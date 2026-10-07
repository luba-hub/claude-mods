import type { Register } from 'claude-code'

// Connector actions that reach another person or the public.
const OUTWARD_ACTION = /(^|_)(send|post|publish|reply|forward|share|invite|comment|tweet|deploy|schedule_post|create_post|push|push_files|merge|create_repository|create_pull_request|create_or_update_file|create_issue)(_|$)/i
// Shell commands that ship something out of this computer, where a command starts.
const OUTWARD_COMMAND = /(^|[;&|(]|\n)\s*(git\s+push|npm\s+publish|gh\s+(pr\s+(create|merge|comment)|release\s+create|issue\s+(create|comment))|vercel\b[^;&|\n]*--prod|netlify\s+deploy|fly\s+deploy|wrangler\s+(deploy|publish))\b/i
// Quoted text is what a command says, not what it runs.
const QUOTED = /'[^']*'|"(?:[^"\\]|\\.)*"/g
const APPROVAL = /\bok to send\b/i

export function isOutward(tool: string, input: unknown): boolean {
  if (tool.startsWith('mcp__')) {
    const action = tool.split('__').slice(2).join('__')

    return OUTWARD_ACTION.test(action)
  }
  if (tool === 'Bash') {
    const command = (input as { command?: unknown }).command

    return typeof command === 'string' && OUTWARD_COMMAND.test(command.replace(QUOTED, "''"))
  }

  return false
}

export const register: Register = on => {
  // The OK lasts for the turn it was given in; each new prompt starts without one.
  let isApproved = false

  on('prompt.submit', ($, e, next) => {
    isApproved = APPROVAL.test(e.text)

    return next(e)
  })

  on('tool.call', ($, e, next) => {
    if (!isOutward(String(e.tool), e) || isApproved) return next(e)
    $.ui.toast('OK to Send held an outward action')

    return {
      deny:
        'OK to Send: this action reaches someone outside this computer. ' +
        'Stop here. Show the person exactly what would go out (the full text, the recipient, the destination) ' +
        'and ask them to reply "ok to send". Do not retry until they do.',
    }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'OK to Send: its check failed, so the action was held.' }))
}
