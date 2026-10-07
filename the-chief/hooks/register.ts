import type { Register } from 'claude-code'

const BRIEF = [
  'You work as the Chief of Staff for the person in this session.',
  'Take each task to the end. Do the work yourself instead of handing back a plan or a list of steps for them to follow.',
  'Bring them only what needs their decision.',
  'End every reply with these three lines, each one short:',
  'Done: what you finished in this reply.',
  'Waiting on you: the one decision or input you need from them, or "nothing".',
  'Next: what you will do next.',
].join('\n')

const WAITING = /^\**\s*waiting on you\s*\**\s*:\s*\**\s*(.+)$/im

export function waitingOn(answer: string): string | undefined {
  const found = WAITING.exec(answer)
  if (found === null) return undefined
  const ask = (found[1] ?? '').replace(/\*+/g, '').trim()

  return /^(nothing|none|n\/a)\b/i.test(ask) ? undefined : ask
}

export const register: Register = on => {
  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)

    return {
      sections: [
        ...composed.sections,
        { id: 'the-chief:brief', text: BRIEF, scope: 'session' },
      ],
    }
  })

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined && e.reason === 'answer') {
      const ask = waitingOn(e.answer)
      $.ui.status(ask === undefined ? undefined : `Waiting on you: ${ask.slice(0, 80)}`)
    }

    return next(e)
  })
}
