import { expect, test } from 'claude-code/testing'

import { waitingOn } from './register'

test('reads the one thing waiting on you', async () => {
  expect(waitingOn('Done: report drafted.\nWaiting on you: pick a meeting time\nNext: send the invite')).toBe('pick a meeting time')
  expect(waitingOn('**Waiting on you:** approve the budget')).toBe('approve the budget')
  expect(waitingOn('Waiting on you: nothing')).toBeUndefined()
  expect(waitingOn('No brief here.')).toBeUndefined()
})
