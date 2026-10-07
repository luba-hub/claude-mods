# Four Claude Code mods from how I run my company

I run Efficiency Sprint with a team of AI agents. These four pieces come from that setup. Each one installs in about five minutes and works on its own.

## The Chief

Claude works like a chief of staff. It takes each task to the end instead of handing you a plan to follow. Every reply ends with three lines: Done, Waiting on you, Next. The one thing waiting on you shows in your status line.

## CEO Dashboard

One line above your prompt: tasks done today, files changed, and how long Claude worked for you. It starts fresh every morning.

## OK to Send

Nothing leaves without your OK. Emails, posts, DMs, git pushes and deploys stop and wait. Claude shows you exactly what would go out. You type "ok to send", and only then it goes.

## Day Log

A written log of your day with Claude: what you asked, when, and how many minutes each took. It saves to `~/claude-day-log/` when you close the session, or any time you type `/daylog`.

## Install

In Claude Code, type:

```
/plugin install the-chief --marketplace luba-hub/claude-mods
/plugin install ceo-dashboard --marketplace luba-hub/claude-mods
/plugin install ok-to-send --marketplace luba-hub/claude-mods
/plugin install day-log --marketplace luba-hub/claude-mods
```

Answer `y` to add the marketplace, then press Enter to pick the scope.

## Running a team?

These four work for one person. A company needs more: who decides what, which agent reports to whom, and the SOPs they work by. That's what we build in EfficiOS, with the Efficiency Sprint team. [efficiencysprint.com](https://efficiencysprint.com)
