// SPEC.md §19.0 and §12: the case study page keeps the topic page layout contract, and the quiz
// works by keyboard without driving the simulator's playback.
import { expect, test, type Locator, type Page } from '@playwright/test'

const ACTIVE_PANEL = 'section[aria-label="Case study materials"] [role="tabpanel"][data-state="active"]'
const SLUGS = ['canteen-orders', 'er-triage', 'study-plan']

function card(page: Page, title: string): Locator {
  return page.locator('[data-slot="card"]', { has: page.locator('[data-slot="card-title"]', { hasText: title }) })
}

function documentScroll(page: Page) {
  return page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
  }))
}

async function open(page: Page, slug: string) {
  await page.goto(`/case-study/${slug}`)
  await expect(card(page, 'Operation')).toBeVisible()
}

test.describe('desktop (lg)', () => {
  test.use({ viewport: { width: 1400, height: 900 } })

  for (const slug of SLUGS) {
    test(`${slug}: the page does not scroll and the Reasoning panel does`, async ({ page }) => {
      await open(page, slug)
      await page.getByRole('tab', { name: 'Reasoning' }).click()
      const doc = await documentScroll(page)
      expect(doc.scrollHeight).toBe(doc.clientHeight)
      await expect(page.locator(ACTIVE_PANEL)).toContainText('Chosen')
      expect(await page.locator(ACTIVE_PANEL).evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto')
    })
  }

  test('the naive design shows its cost in the live fields', async ({ page }) => {
    await open(page, 'er-triage')
    await page.getByRole('tab', { name: 'Arrival queue' }).click()
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Treat next' }).click()
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await expect(page.locator('[aria-label="Instance fields"]')).toContainText('bypassed = 1')
  })

  test('the quiz checks an answer, explains it, and ends with a score', async ({ page }) => {
    await open(page, 'study-plan')
    await page.getByRole('tab', { name: 'Quiz' }).click()
    const quiz = page.locator(ACTIVE_PANEL)
    const count = Number((await quiz.getByText(/^Question 1 of \d+$/).textContent())!.match(/of (\d+)/)![1])
    for (let i = 0; i < count; i++) {
      await quiz.getByRole('radio').first().check()
      await quiz.getByRole('button', { name: 'Check answer' }).click()
      await expect(quiz.getByRole('status')).toContainText(/Correct\.|Not quite\./)
      await quiz.getByRole('button', { name: i === count - 1 ? 'See your score' : 'Next question' }).click()
    }
    await expect(quiz.getByRole('heading', { name: new RegExp(`You answered \\d+ of ${count} correctly\\.`) })).toBeVisible()
    await quiz.getByRole('button', { name: 'Retry the quiz' }).click()
    await expect(quiz.getByText(`Question 1 of ${count}`)).toBeVisible()
  })

  test('a predict question draws the simulator step it asks about', async ({ page }) => {
    await open(page, 'canteen-orders')
    await page.getByRole('tab', { name: 'Quiz' }).click()
    const quiz = page.locator(ACTIVE_PANEL)
    for (let i = 0; i < 6; i++) {
      await quiz.getByRole('radio').first().check()
      await quiz.getByRole('button', { name: 'Check answer' }).click()
      await quiz.getByRole('button', { name: 'Next question' }).click()
    }
    await expect(quiz.locator('figure')).toContainText('Step shown: lo = 0, hi = 2, so mid = 1: order 102.')
    await expect(quiz.locator('figure [aria-label^="Served log"]')).toBeVisible()
  })

  test('Space inside the quiz selects and presses, and never toggles playback', async ({ page }) => {
    await open(page, 'canteen-orders')
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await page.getByRole('button', { name: 'Step backward' }).click()
    const counter = page.getByText(/^\d+ \/ \d+$/)
    const before = await counter.textContent()
    await page.getByRole('tab', { name: 'Quiz' }).click()
    const quiz = page.locator(ACTIVE_PANEL)
    await quiz.getByRole('radio').nth(1).focus()
    await page.keyboard.press(' ')
    await expect(quiz.getByRole('radio').nth(1)).toBeChecked()
    await quiz.getByRole('button', { name: 'Check answer' }).focus()
    await page.keyboard.press(' ')
    await expect(quiz.getByRole('status')).toContainText('Correct.')
    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
    expect(await counter.textContent()).toBe(before)
  })
})

test.describe('canvas view switch', () => {
  test.use({ viewport: { width: 1400, height: 900 } })

  const view = (page: Page, name: string) => page.getByRole('group', { name: 'Choose what the canvas shows' }).getByRole('button', { name })

  test('study plan: rests on the digraph, opens the index, and follows the step again', async ({ page }) => {
    await open(page, 'study-plan')
    await expect(view(page, 'Prerequisite digraph')).toHaveAttribute('aria-pressed', 'true')
    await expect(view(page, 'Study plan')).toBeDisabled()
    await view(page, 'Code index').click()
    await expect(page.getByRole('list', { name: 'Code index with 11 buckets' })).toBeVisible()
    await view(page, 'Prerequisite digraph').click()
    await expect(page.getByRole('img', { name: /Directed graph with 8 vertices/ })).toBeVisible()

    // Add course: steps 0 and 1 are on the index, step 2 on the digraph, step 3 back on the index.
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Add course' }).click()
    await page.getByPlaceholder('Course code, e.g. PR3').fill('PR3')
    await page.getByRole('button', { name: 'Go', exact: true }).click()
    await page.getByRole('button', { name: 'Step backward' }).click()
    const counter = page.getByText(/^\d+ \/ \d+$/)
    while (!(await counter.textContent())!.startsWith('3 ')) await page.getByRole('button', { name: 'Step forward' }).click()
    await expect(view(page, 'Prerequisite digraph')).toHaveAttribute('aria-pressed', 'true')
    await view(page, 'Code index').click()
    await expect(page.getByRole('list', { name: 'Code index with 11 buckets' })).toBeVisible()
    await expect(view(page, 'Prerequisite digraph')).toContainText('the current step is here')

    await view(page, 'Code index').focus()
    await page.keyboard.press(' ')
    await expect(counter).toHaveText(/^3 \//)

    await page.getByRole('button', { name: 'Step forward' }).click()
    await page.getByRole('button', { name: 'Step backward' }).click()
    await expect(view(page, 'Prerequisite digraph')).toHaveAttribute('aria-pressed', 'true')
  })

  test('er triage: the archive opens at rest', async ({ page }) => {
    await open(page, 'er-triage')
    await view(page, 'Record archive: B-tree').click()
    await expect(page.getByRole('img', { name: /B-tree with 5 keys/ })).toBeVisible()
  })

  test('study plan: Randomize changes the curriculum on screen', async ({ page }) => {
    await open(page, 'study-plan')
    const graph = page.getByRole('img', { name: /Directed graph/ })
    const before = await page.locator('[aria-label="Instance fields"]').textContent()
    const labels = async () => (await graph.locator('text').allTextContents()).sort().join(',')
    const seedLabels = await labels()
    let changed = false
    for (let i = 0; i < 5 && !changed; i++) {
      await page.getByRole('button', { name: 'Randomize' }).click()
      changed = (await labels()) !== seedLabels
    }
    expect(changed, `still ${before}`).toBe(true)
  })
})

test.describe('phone', () => {
  test.use({ viewport: { width: 400, height: 900 } })

  for (const slug of SLUGS) {
    test(`${slug}: stacks and never overflows sideways, quiz included`, async ({ page }) => {
      await open(page, slug)
      expect((await documentScroll(page)).scrollWidth).toBe(400)
      await page.getByRole('tab', { name: 'Reasoning' }).click()
      expect((await documentScroll(page)).scrollWidth).toBe(400)
      await page.getByRole('tab', { name: 'Quiz' }).click()
      expect((await documentScroll(page)).scrollWidth).toBe(400)
    })
  }
})
