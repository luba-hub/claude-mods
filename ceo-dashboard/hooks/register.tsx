import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Day } from '../types'

const today = atom({ plugin: 'ceo-dashboard', key: 'today' } as const, null)
const isHidden = atom({ plugin: 'ceo-dashboard', key: 'isHidden' } as const, false)

const WRITES = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])

export function dateOf(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function hours(ms: number): string {
  const minutes = Math.round(ms / 60000)

  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

const empty = (date: string): Day => ({ date, tasks: 0, files: [], workedMs: 0 })

// Loads today's numbers, starting a fresh day when the date has changed.
async function current($: EngineInterface): Promise<Day> {
  const date = dateOf(await $.clock.now())
  const held = await read($, today)
  if (held !== null && held.date === date) return held
  const stored = (await $.store.get(`day:${date}`)) as Day | undefined

  return stored ?? empty(date)
}

async function save($: EngineInterface, change: (day: Day) => Day): Promise<void> {
  const day = change(await current($))
  await update($, today, () => day)
  await $.store.set(`day:${day.date}`, day)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await save($, day => day)

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const path = (e as { file_path?: unknown; notebook_path?: unknown }).file_path
      ?? (e as { notebook_path?: unknown }).notebook_path
    if (WRITES.has(String(e.tool)) && ran.deny === undefined && ran.isError !== true && typeof path === 'string') {
      await save($, day => (day.files.includes(path) ? day : { ...day, files: [...day.files, path].slice(-500) }))
    }

    return ran
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      await save($, day => ({
        ...day,
        tasks: day.tasks + (e.reason === 'answer' ? 1 : 0),
        workedMs: day.workedMs + e.durationMs,
      }))
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const day = await read($, today)
    if (e.props.hasSurvey || day === null || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text bold>Today </Text>
        <Text>
          {day.tasks} tasks done · {day.files.length} files changed · {hours(day.workedMs)} of work{' '}
        </Text>
        <Button key="hide" label="Hide" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
