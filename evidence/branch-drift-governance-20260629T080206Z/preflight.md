# Preflight — Branch Drift Governance

## System Environment
| Field | Value |
|-------|-------|
| **Datum/Zeit UTC** | 2026-06-29T08:02:06Z |
| **Lokalzeit** | 2026-06-29 10:02:06 CEST |
| **Hostname** | AQCER |
| **OS** | Microsoft Windows 10 Pro Education |
| **Shell** | Windows PowerShell 5.1 |
| **Arbeitsverzeichnis** | C:\Spec-kit_n8n |
| **Repository** | https://github.com/xxammaxx/n8n-blueprint-workflow |

## Git Status

| Field | Value |
|-------|-------|
| **Aktueller lokaler Branch** | `master` |
| **HEAD Commit** | `1c9a68b` — docs(ops): add comment sync 24h observation |
| **HEAD Datum** | 2026-06-29 09:51:14 +0200 |
| **Upstream Status** | Your branch is up to date with 'origin/master' |
| **Working Tree** | Clean (1 modified untracked image + untracked temp dirs, no staged changes) |

## Remote Status

| Field | Value |
|-------|-------|
| **origin/master HEAD** | `1c9a68b` — docs(ops): add comment sync 24h observation |
| **origin/master Datum** | 2026-06-29 09:51:14 +0200 |
| **origin/main HEAD** | `3687959` — docs: add verification session results |
| **origin/main Datum** | 2026-06-27 06:14:47 +0200 |
| **GitHub Default Branch** | `main` |
| **GitHub Visibility** | public |
| **GitHub Archived** | no |

## Branch Drift Detection

| Check | Result |
|-------|--------|
| **main und master weichen ab?** | **JA — fundamental divergiert** |
| **Gemeinsamer Vorfahre?** | **KEINER** — unrelated histories |
| **1c9a68b auf master?** | Ja (HEAD) |
| **1c9a68b auf main?** | Nein |
| **master root commit** | `5088845` — fix(n8n): make guardrails trigger-agnostic |
| **main root commit** | `9e41bba` — chore: initial commit |
| **Merge-Base** | Nicht vorhanden (leere Menge) |

## Secret Hygiene Pre-Check

| Check | Status |
|-------|--------|
| Secrets ausgegeben? | **Nein** |
| API-Keys sichtbar? | Nein |
| Tokens sichtbar? | Nein |
| SSH-Keys sichtbar? | Nein |
| n8n-Credential-Werte gelesen? | Nein |
| Passwörter geloggt? | Nein |

## Branch Drift Classification

**Status: RED_BRANCH_CONFLICT**

Die Branches `main` und `master` haben keine gemeinsame Historie. Sie teilen keinen einzigen Commit. Dies ist keine normale Divergenz, sondern zwei vollständig separate Commit-Trees.
