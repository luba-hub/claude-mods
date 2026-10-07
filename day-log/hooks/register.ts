import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Entry } from '../types'

const entries = atom({ plugin: 'day-log', key: 'entries' } as const, [])
const startedAt = atom({ plugin: 'day-log', key: 'startedAt' } as const, null)

const pad = (n: number) => String(n).padStart(2, '0')
export const dateOf = (ms: number) => {
  const d = new Date(ms)

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const timeOf = (ms: number) => {
  const d = new Date(ms)

  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function block(start: number, end: number, list: readonly Entry[]): string {
  const total = list.reduce((sum, one) => sum + one.minutes, 0)
  const rows = list.map(one => `- ${timeOf(one.at)} · ${one.minutes} min · ${one.ask}`)

  return [
    `## Session ${timeOf(start)}–${timeOf(end)}`,
    '',
    `${list.length} tasks, ${total} min of work.`,
    '',
    ...rows,
    '',
  ].join('\n')
}

// Appends this session's block to today's file and returns the file's path.
async function writeLog($: EngineInterface): Promise<string | undefined> {
  const list = await read($, entries)
  if (list.length === 0) return undefined
  const now = await $.clock.now()
  const start = (await read($, startedAt)) ?? list[0]?.at ?? now
  const home = (await $.env.get('HOME')) ?? '.'
  const path = `${home}/claude-day-log/${dateOf(start)}.md`
  const before = (await $.fs.exists(path)) ? await $.fs.read(path) : `# ${dateOf(start)}\n\n`
  await $.fs.write(path, before + block(start, now, list) + '\n')
  await update($, entries, () => [])
  await update($, startedAt, () => now)

  return path
}

export const register: Register = on => {
  let ask = ''

  on('session.start', async ($, e, next) => {
    const now = await $.clock.now()
    await update($, startedAt, held => held ?? now)
    await $.command.register({ name: 'daylog', description: 'Write what you did with Claude so far to your day log' })

    return next(e)
  })

  on('prompt.submit', ($, e, next) => {
    if (e.turnId === undefined) ask = e.text.replace(/\s+/g, ' ').trim().slice(0, 120)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined && ask !== '') {
      const entry: Entry = {
        at: (await $.clock.now()) - e.durationMs,
        ask,
        minutes: Math.max(1, Math.round(e.durationMs / 60000)),
      }
      await update($, entries, list => [...list, entry].slice(-300))
      ask = ''
    }

    return next(e)
  })

  on('command.run', { command: 'daylog' }, async $ => {
    const path = await writeLog($)

    return { text: path === undefined ? 'Nothing new to log yet.' : `Logged to ${path}` }
  })

  on('session.end', async ($, e, next) => {
    await writeLog($)

    return next(e)
  })
}
