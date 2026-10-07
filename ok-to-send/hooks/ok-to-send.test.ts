import { describe, expect, test } from 'claude-code/testing'

import { isOutward } from './register'

describe('which actions count as outward', () => {
  test('sends, posts and pushes count; reads do not', async () => {
    expect(isOutward('mcp__Gmail__send_message', {})).toBe(true)
    expect(isOutward('mcp__linkedin__create_post', {})).toBe(true)
    expect(isOutward('mcp__Gmail__search_threads', {})).toBe(false)
    expect(isOutward('mcp__Gmail__create_draft', {})).toBe(false)
    expect(isOutward('Bash', { command: 'git push -u origin main' })).toBe(true)
    expect(isOutward('Bash', { command: 'git status' })).toBe(false)
    expect(isOutward('Bash', { command: 'git add . && git commit -m x && git push' })).toBe(true)
    expect(isOutward('Bash', { command: "sed -i 's/a/git push/' notes.md" })).toBe(false)
    expect(isOutward('mcp__github__push_files', {})).toBe(true)
    expect(isOutward('mcp__github__create_repository', {})).toBe(true)
    expect(isOutward('mcp__github__get_file_contents', {})).toBe(false)
    expect(isOutward('Read', { file_path: 'a.md' })).toBe(false)
  })
})

test('a push waits for the OK, then goes', async ($, on) => {
  on('prompt.submit', (_, e) => ({ text: e.text }) as never)
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'pushed', stderr: '', interrupted: false } }) as never)

  const held = await $.tool.call({ tool: 'Bash', command: 'git push' })
  expect(String(held.deny ?? held.text)).toContain('ok to send')

  await $.prompt.submit({ text: 'Looks right, ok to send' } as never)
  const sent = await $.tool.call({ tool: 'Bash', command: 'git push' })
  expect(sent.deny).toBeUndefined()
})
