export type Entry = { at: number; ask: string; minutes: number }

declare module 'claude-code' {
  interface PluginState {
    'day-log': { entries: Entry[]; startedAt: number | null }
  }
}
