import { expect, test } from 'claude-code/testing'

import { dateOf, hours } from './register'

test('formats the day and the hours', async () => {
  expect(dateOf(new Date(2026, 9, 7, 9, 5).getTime())).toBe('2026-10-07')
  expect(hours(45 * 60000)).toBe('45m')
  expect(hours(130 * 60000)).toBe('2h 10m')
})
