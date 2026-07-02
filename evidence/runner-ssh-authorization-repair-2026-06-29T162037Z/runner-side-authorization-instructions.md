# Runner-Side Authorization Instructions

## WARNING
Der Agent hat **KEINEN** direkten Admin-Zugang zum Runner `192.168.1.53`.
Ein Admin/User muss diese Schritte manuell auf dem Runner ausführen (via Proxmox Console, SSH als root, o.ä.).

## Schritt-für-Schritt auf dem Runner (192.168.1.53)

### 1. User-Prüfung
```bash
id runner
getent passwd runner
```
Erwartet: User `runner` existiert mit Home `/home/runner`.

### 2. SSH-Verzeichnis anlegen
```bash
sudo -u runner mkdir -p /home/runner/.ssh
sudo chmod 700 /home/runner/.ssh
```

### 3. authorized_keys erstellen
```bash
sudo touch /home/runner/.ssh/authorized_keys
sudo chmod 600 /home/runner/.ssh/authorized_keys
sudo chown -R runner:runner /home/runner/.ssh
```

### 4. Public Key einfügen
```bash
sudo nano /home/runner/.ssh/authorized_keys
```
Folgende Zeile **EXAKT** einfügen (eine Zeile):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgnFkW5F74zJ/+5jLQIG6ihbUt5b/Sh+fOCSLuipLED docvault-ai-vscode
```

### 5. Rechte finalisieren
```bash
sudo chown -R runner:runner /home/runner/.ssh
sudo chmod 700 /home/runner/.ssh
sudo chmod 600 /home/runner/.ssh/authorized_keys
```

### 6. Optional: Home-Verzeichnis-Rechte (falls SSHD strikt)
```bash
sudo chmod go-w /home/runner
sudo chmod go-w /home/runner/.ssh
sudo chmod go-w /home/runner/.ssh/authorized_keys
```

### 7. Verifikation
```bash
sudo -u runner test -r /home/runner/.ssh/authorized_keys && echo "authorized_keys readable by runner: yes"
sudo -u runner wc -l /home/runner/.ssh/authorized_keys
```
Erwartet: `1 /home/runner/.ssh/authorized_keys`

## Nach der Autorisierung
Bitte bestätigen mit:
```
Ich habe den ausgewählten Public Key auf runner@192.168.1.53 in /home/runner/.ssh/authorized_keys autorisiert.
```

## Status
**USER_MUST_AUTHORIZE_PUBLIC_KEY_ON_RUNNER** — Agent hat keinen Admin-Zugang, manuelle Autorisierung erforderlich.
