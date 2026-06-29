# Phase 5 — Backup and Rollback Plan

## Meta
- **Timestamp (UTC):** 2026-06-29T06:57:37Z

## Backup
| Feld | Wert |
|------|------|
| Backup-Datei | `database.sqlite.bak.20260629T0600Z` |
| Pfad | `/opt/dev-fabric/n8n/data/.n8n/database.sqlite.bak.20260629T0600Z` (CT 101) |
| Erstellt am | 2026-06-29T06:00:00Z (vor Dual-Table-Patch) |
| Inhalt | Vollständiges SQLite-Datenbank-Backup (pre-patch) |
| Größe | Plausibel (vollständige n8n-DB) |
| Backup-Inhalte ausgegeben | ❌ NO (read-only, keine Inhalte) |

## Aktuelles DB-File
| Feld | Wert |
|------|------|
| Datei | `database.sqlite` |
| Pfad | `/opt/dev-fabric/n8n/data/.n8n/database.sqlite` (CT 101) |
| Existiert | ✅ YES (via laufendem n8n bestätigt: healthz 200, Workflow aktiv) |

## Rollback Procedure (NUR im Notfall)

### Voraussetzungen
**WARNUNG: Rollback nur bei RED/Produktionsfehler, nicht bei kosmetischen Notes.**

### Schritt 1: Dienste stoppen
```bash
# Auf Proxmox Host:
pct enter 101
systemctl stop n8n
# ODER: docker stop n8n (je nach Deployment)
```

### Schritt 2: Backup wiederherstellen
```bash
# In CT 101:
cd /opt/dev-fabric/n8n/data/.n8n/
cp database.sqlite database.sqlite.pre-rollback-$(date +%Y%m%dT%H%M%SZ)
cp database.sqlite.bak.20260629T0600Z database.sqlite
```

### Schritt 3: Dienste starten
```bash
systemctl start n8n
# ODER: docker start n8n
```

### Schritt 4: Verifikation nach Rollback
| Check | Wie prüfen |
|-------|-----------|
| n8n erreichbar | `curl http://192.168.1.52:5678/healthz` → 200 |
| Workflow active | n8n UI → Workflow `Sv12QTo56NoPUu2D` → Published |
| Schedule Trigger vorhanden | n8n UI → Schedule Trigger Node → 15 min |
| Issue-Schutz | `gh issue view 3` → kein `agent:ready` |

## NICHT löschen
- `database.sqlite.bak.20260629T0600Z` (Rollback-Quelle)
- `database.sqlite.pre-rollback-*` (Rollback-Rückgängig)
- `exports/` (Workflow-Snapshots)
- `scripts/patch-config.json` (Patch-Konfiguration)

## Rollback NICHT ausgeführt
- ❌ Dieser Lauf führt KEIN Rollback aus
- ✅ Nur Dokumentation und Plan-Validierung

## Gate
- **Backup/Rollback:** ✅ GREEN — Backup vorhanden, Rollback-Plan dokumentiert, nicht ausgeführt
