import { expect, test } from 'claude-code/testing'

import { block } from './register'

test('writes a session block with times and minutes', async () => {
  const start = new Date(2026, 9, 7, 9, 0).getTime()
  const end = new Date(2026, 9, 7, 10, 30).getTime()
  const text = block(start, end, [
    { at: start, ask: 'Draft the Live post', minutes: 12 },
    { at: start + 3600000, ask: 'Build the mods', minutes: 25 },
  ])
  expect(text).toContain('## Session 09:00–10:30')
  expect(text).toContain('2 tasks, 37 min of work.')
  expect(text).toContain('- 10:00 · 25 min · Build the mods')
})
