// SPEC.md §6 and §12: the topic page layout at desktop, tablet, and phone widths.
// Desktop (lg): the page is locked to the viewport; only the Code listing and the active
// materials panel scroll. Tablet (md): Operation and Playback keep their content height beside
// Code. Phone: one column in DOM order, the document scrolls.
import { expect, test, type Locator, type Page } from '@playwright/test'

const LISTING = 'ol[aria-label]'
const ACTIVE_PANEL = 'section[aria-label="Course materials"] [role="tabpanel"][data-state="active"]'
const VISUALIZER_COLUMN = 'section[aria-labelledby="visualizer"]'
const LIVE_FIELDS = '[aria-label="Instance fields"]'

function card(page: Page, title: string): Locator {
  return page.locator('[data-slot="card"]', { has: page.locator('[data-slot="card-title"]', { hasText: title }) })
}

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error('element is not rendered')
  return { top: Math.round(b.y), bottom: Math.round(b.y + b.height), left: Math.round(b.x), height: Math.round(b.height) }
}

function documentScroll(page: Page) {
  return page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollY: window.scrollY,
  }))
}

function overflows(locator: Locator) {
  return locator.evaluate((el) => el.scrollHeight > el.clientHeight)
}

async function openOperation(page: Page, slug: string, operation: RegExp, language?: string) {
  await page.goto(`/topic/${slug}`)
  await expect(card(page, 'Operation')).toBeVisible()
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: operation }).click()
  if (language) await page.getByRole('tab', { name: language }).click()
}

// Runs the selected operation, pauses autoplay, then steps to the last step with the arrow key,
// calling `onStep` after every move.
async function stepThrough(page: Page, onStep: () => Promise<void>) {
  await page.getByRole('button', { name: 'Go', exact: true }).click()
  await expect(page.locator('[aria-current="step"]').first()).toBeVisible()
  await page.keyboard.press(' ')
  const counter = page.getByText(/^\d+ \/ \d+$/)
  let moves = 0
  for (;;) {
    await onStep()
    const [index, total] = (await counter.textContent())!.split('/').map((s) => parseInt(s, 10))
    if (index >= total) break
    await page.keyboard.press('ArrowRight')
    moves++
  }
  return moves
}

test.describe('desktop (lg)', () => {
  test.use({ viewport: { width: 1400, height: 900 } })

  test('the page does not scroll; the Code listing and the materials panel do', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    const doc = await documentScroll(page)
    expect(doc.scrollHeight).toBe(doc.clientHeight)
    expect(await overflows(page.locator(LISTING))).toBe(true)
    expect(await overflows(page.locator(ACTIVE_PANEL))).toBe(true)
  })

  test('scrolling those regions leaves the rest of the layout in place', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    const fixed = () =>
      Promise.all([
        box(card(page, 'Operation')),
        box(card(page, 'Playback')),
        box(page.locator('[data-slot="card"]').first()),
        box(page.locator('section[aria-label="Course materials"] [data-slot="tabs-list"]')),
        box(page.locator(`${VISUALIZER_COLUMN} [data-slot="tabs-list"]`).last()),
      ])
    const before = await fixed()
    await page.locator(LISTING).evaluate((el) => (el.scrollTop = 500))
    await page.locator(ACTIVE_PANEL).evaluate((el) => (el.scrollTop = 800))
    expect(await fixed()).toEqual(before)
    expect((await documentScroll(page)).scrollY).toBe(0)
  })

  test('the Code card sizes to a short listing instead of filling the column', async ({ page }) => {
    await openOperation(page, 'arrays', /create from list/i)
    const code = await box(card(page, 'Code'))
    const listing = await box(page.locator(LISTING))
    const playback = await box(card(page, 'Playback'))
    expect(code.bottom).toBeLessThan(playback.bottom)
    // Only the card's own bottom padding sits below the listing.
    expect(code.bottom - listing.bottom).toBeLessThan(40)
  })

  test('stepping keeps the highlighted line inside the listing without moving the page', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    const moves = await stepThrough(page, async () => {
      const listing = await box(page.locator(LISTING))
      // A language listing can map more than one line to the same pseudocode line.
      for (const line of await page.locator('[aria-current="step"]').all()) {
        const active = await box(line)
        expect(active.top).toBeGreaterThanOrEqual(listing.top - 1)
        expect(active.bottom).toBeLessThanOrEqual(listing.bottom + 1)
      }
      expect((await documentScroll(page)).scrollY).toBe(0)
    })
    expect(moves).toBeGreaterThan(5)
  })

  test('the listing takes keyboard focus with a visible ring and scrolls with the arrow keys', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    const listing = page.locator(LISTING)
    // Tab from the language strip (the C++ tab still has focus from openOperation).
    await page.keyboard.press('Tab')
    await expect(listing).toBeFocused()
    const ring = await listing.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(ring).not.toBe('none')
    await page.keyboard.press('ArrowDown')
    await expect.poll(() => listing.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })

  test('the Structure tab scrolls in place and marks the representation on the canvas', async ({ page }) => {
    await page.goto('/topic/stack')
    await expect(card(page, 'Operation')).toBeVisible()
    await page.getByRole('tab', { name: 'Structure' }).click()
    const doc = await documentScroll(page)
    expect(doc.scrollHeight).toBe(doc.clientHeight)
    expect(await page.locator(ACTIVE_PANEL).evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    await expect(page.locator(LIVE_FIELDS)).toContainText('n = 3')
    await expect(page.locator('[data-representation="array"]')).toContainText('on the canvas')
    await page.getByRole('tab', { name: 'Linked list' }).click()
    await expect(page.locator(LIVE_FIELDS)).toContainText(/first = n\d+/)
    await expect(page.locator('[data-representation="linked"]')).toContainText('on the canvas')
    await expect(page.locator('[data-representation="array"]')).not.toContainText('on the canvas')
  })

  test('the instance fields follow the step being shown', async ({ page }) => {
    await openOperation(page, 'queue', /enqueue/i)
    await page.getByRole('textbox').fill('42')
    const chip = page.locator(`${LIVE_FIELDS} [role="listitem"]`).filter({ hasText: /^n = / })
    const before = await chip.textContent()
    await stepThrough(page, async () => {})
    expect(await chip.textContent()).not.toBe(before)
  })
})

test.describe('tablet (md)', () => {
  test.use({ viewport: { width: 900, height: 900 } })

  test('Operation and Playback keep their content height beside a tall Code card', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    const operation = await box(card(page, 'Operation'))
    const playback = await box(card(page, 'Playback'))
    const code = await box(card(page, 'Code'))
    expect(operation.left).toBe(playback.left)
    expect(playback.top).toBe(operation.bottom + 16)
    expect(code.bottom).toBeGreaterThan(playback.bottom)
  })

  test('a short Code card still stretches to the bottom of Playback', async ({ page }) => {
    await openOperation(page, 'bst', /inorder/i)
    const playback = await box(card(page, 'Playback'))
    const code = await box(card(page, 'Code'))
    expect(code.bottom).toBe(playback.bottom)
  })
})

test.describe('phone', () => {
  test.use({ viewport: { width: 400, height: 900 } })

  test('stacks in DOM order, scrolls the document, and never overflows sideways', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    const doc = await documentScroll(page)
    expect(doc.scrollHeight).toBeGreaterThan(doc.clientHeight)
    expect(doc.scrollWidth).toBe(400)
    const tops = await Promise.all(
      [page.locator('[data-slot="card"]').first(), card(page, 'Operation'), card(page, 'Code'), card(page, 'Playback')].map(
        async (l) => (await box(l)).top,
      ),
    )
    expect([...tops].sort((a, b) => a - b)).toEqual(tops)
    expect(await overflows(page.locator(LISTING))).toBe(false)
  })

  test('stepping does not move the page', async ({ page }) => {
    await openOperation(page, 'binary-heap', /heapsort/i, 'C++')
    // Clicking Go scrolls it into view first, so the baseline is wherever the page sits after that.
    let baseline: number | null = null
    await stepThrough(page, async () => {
      const { scrollY } = await documentScroll(page)
      baseline ??= scrollY
      expect(scrollY).toBe(baseline)
    })
  })

  test('the Structure tab fits the width', async ({ page }) => {
    await page.goto('/topic/hash-table')
    await expect(card(page, 'Operation')).toBeVisible()
    await page.getByRole('tab', { name: 'Structure' }).click()
    await expect(page.locator(ACTIVE_PANEL)).toContainText('Separate chaining')
    expect((await documentScroll(page)).scrollWidth).toBe(400)
  })
})
