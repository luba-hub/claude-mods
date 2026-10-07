import { expect, test } from 'claude-code/testing'

import { waitingOn } from './register'

test('reads the one thing waiting on you', async () => {
  expect(waitingOn('Done: drafted it.\nWaiting on you: pick Oct 15 or Oct 22\nNext: create the event')).toBe('pick Oct 15 or Oct 22')
  expect(waitingOn('**Waiting on you:** approve the post')).toBe('approve the post')
  expect(waitingOn('Waiting on you: nothing')).toBeUndefined()
  expect(waitingOn('No brief here.')).toBeUndefined()
})
