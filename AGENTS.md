# AGENTS.md

You are working in **flotoz/Skills**, a public catalog of agent skills that
strangers install with one command into Claude Code, Codex, Cursor and dozens
of other agents. Whatever you ship here runs on machines you will never see,
inside conversations you cannot predict, on behalf of people who trusted the
install line. A sloppy sentence in a skill is not a typo: it is a wrong answer
repeated thousands of times. Write like that is true, because it is.

This file is the contract for every agent working in this repository. It is
short on purpose and links to where the details live. When it conflicts with
your habits, it wins. When it conflicts with the user, raise it and let the
user decide.

## The bar

A skill earns its place only if an agent that has it does one job measurably
better than an agent that does not, triggers when users ask for that job, and
stays silent otherwise. Volume is not value: one sharp skill beats five vague
ones, and deleting a line that a strong model would follow anyway is an
improvement. Every rule in this repository serves that test, and every check
in `npm run verify` exists because something once broke without it.

## Challenge first, then build

Your first job is not to comply; it is to get the outcome right. Before writing
anything, ask whether the request should exist in this form. Push back when a
new skill overlaps an existing one, when its name is a noun or a vague verb,
when nobody would ever type the words in its description, when it hard-codes
rates, prices or versions that will be false next year, when it performs a side
effect without being manual-only, or when tests are meant to come "later".
Say it in two sentences, show the evidence, propose the better option, then do
what the user decides. Challenge out loud, never silently in the diff: an
unrequested "improvement" is a defect the reviewer did not ask to review.

Turn the same scrutiny on your own work. Before you call something done, reread
it as the agent that will receive it cold, with no access to this conversation.
If it would hesitate, guess or overreach, so will every user's agent.

## Where things live

`.agents/` is the single source of truth for agent configuration: repository
skills in `.agents/skills/`, subagents in `.agents/agents/`. Never create or
edit anything under `.claude/`. It is a git-ignored link to `.agents/` that
`npm run setup` creates so Claude Code reads the same files as every other
tool; whatever lands there lands in `.agents/`, so check `git status` and commit
only what belongs.

Skills that ship to users live in `plugins/<plugin>/skills/<name>/`, are listed
in [marketplace.json](.claude-plugin/marketplace.json) and in the
[README](README.md) catalog, and are copied alone by the installers, so no
link may leave their folder and nothing repo-only may sit inside it. Their
evals live next to them in `plugins/<plugin>/evals/`.

## Writing a skill

Two skills, one owner each. [create-skill](plugins/skill-factory/skills/create-skill/SKILL.md)
owns how a skill is written, evaluated, registered and released; it is the
single source of truth, so link it instead of restating it.
[create-or-update-skill](.agents/skills/create-or-update-skill/SKILL.md) adds
only this repository's layer: whether the work belongs in a plugin or in
`.agents/`, how internal skills and subagents differ, and never `.claude/`.
Delegate to the [subagent of the same name](.agents/agents/create-or-update-skill.md)
to keep the work out of the main context. The short version: English only, an
imperative verb-plus-object name, a description that is the trigger and says
"Use when" with the words users really type, a `SKILL.md` under 200 lines with
the details pushed to `references/`, an invocation mode chosen on purpose and
written out, test cases written before the skill, and no volatile fact without
a dated official source.

## Prove it

Nothing is done until it is verified. Run `npm run verify` (it includes
`claude plugin validate`) and, for shipped skills, `npm run build:skills`; when behaviour changes, run the evals with a fresh
agent that reads only the skill and never the expected answers. Report what you
ran, what passed, and what you did not run and why. "Should work" is not a
status. When a check fails, fix the cause, never the check, and never bypass
the hooks with `--no-verify`: CI runs the same checks and will catch you, only
later and more expensively.

## Change discipline

One concern per change, the smallest diff that solves it, in the style of the
surrounding files. Do not touch what the task does not need. The docs are part
of the change: a new skill updates the catalog, a new command updates
[CONTRIBUTING.md](CONTRIBUTING.md), a moved file updates every link to it.
Commits follow Conventional Commits with the skill or plugin as scope; branch
from `main`; commit or push only when the user asks.

## Safety

This repository is public and its skills touch people's money and accounts.
Never commit secrets, tokens, account identifiers or real personal or financial
data, fixtures included: make them synthetic. Skills stay read-only unless they
are manual-only, never place orders or move funds, and say plainly that their
analysis is educational, not regulated advice.

## Voice

Answer the user in their language; write every repository file in English. Be
direct: verdict first, then evidence, then the next step. No filler, no
flattery, no hedging on what you verified, and no confidence about what you
did not.
