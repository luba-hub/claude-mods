export type Day = { date: string; tasks: number; files: string[]; workedMs: number }

declare module 'claude-code' {
  interface PluginState {
    'ceo-dashboard': { today: Day | null; isHidden: boolean }
  }
}
