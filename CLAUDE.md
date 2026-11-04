# CLAUDE.md

Project instructions live in `AGENTS.md` (shared with OpenCode). It is imported below so there is a
single source of truth — edit `AGENTS.md`, not this file.

@AGENTS.md

## Claude Code specifics

- Where `AGENTS.md` mentions OpenCode's `skill` tool, use Claude Code's `Skill` tool instead
  (e.g. `daisyui` for templates, `superpowers:*` for process workflows).
- Shell is Windows (PowerShell primary, Git Bash available). Use `pnpm`, never `npm`.
- `AGENTS.md` is gitignored and contains test credentials — never copy its contents into tracked
  files (including this one).
