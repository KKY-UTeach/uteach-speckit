# Deployment Guide

This guide describes production and staging (devel) deployment on a Ubuntu/Debian VM using:

- Apache reverse proxy
- FastAPI backend
- Vite React frontend
- systemd services for persistent runtime

The system runs two environments:

| Environment | URL | Purpose |
|------------|-----|--------|
| Production | https://uteach.kky.zcu.cz | Main stable version |
| Devel | https://uteach.kky.zcu.cz:444 | Development / testing |

---

## 1. System Prerequisites

### OS-level dependencies

```bash
sudo apt-get update
sudo apt-get install -y \
    python3-pip \
    python3-venv \
    build-essential \
    python3-dev \
    python3-setuptools \
    python3-wheel \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libgdk-pixbuf2.0-0
```

---

### Node.js (20+)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 2. Project Layout
It should contain 2 clones of repository

```text
/srv/
  uteach-speckit/           → production (main branch)
  uteach-speckit-devel/     → devel (dev branch)
```

---

## 3. Backend Setup

### Production backend

```bash
cd /srv/uteach-speckit/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Runs on:

* 127.0.0.1:8001

---

### Devel backend

```bash
cd /srv/uteach-speckit-devel/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Runs on:

* 127.0.0.1:8002

---

## 4. Frontend Setup (Vite)

### Production frontend

```bash
cd /srv/uteach-speckit/frontend
npm install
```

Runs on:

* 5173

Start command:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

---

### Devel frontend

```bash
cd /srv/uteach-speckit-devel/frontend
npm install
```

Runs on:

* 5174

Start command:

```bash
npm run dev -- --host 0.0.0.0 --port 5174
```


## 5. systemd Services

All service files are located in:

```text
/etc/systemd/system/
```

---

### 5.1 Production Backend Service

File: `uteach_backend.service`

```ini
[Unit]
Description=Uteach Backend (FastAPI via Gunicorn + Uvicorn)
After=network.target

[Service]
Type=simple
User=uteach
Group=uteach
WorkingDirectory=/srv/uteach-speckit/backend

ExecStart=/srv/uteach-speckit/backend/.venv/bin/python3 -m src.main --port 8001

Restart=on-failure
RestartSec=5

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

### 5.2 Production Frontend Service

File: `uteach_frontend.service`

```ini
[Unit]
Description=Uteach Frontend (Dev Server)
After=network.target

[Service]
Type=simple
User=uteach
Group=uteach
WorkingDirectory=/srv/uteach-speckit/frontend

ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0

Restart=on-failure
RestartSec=5

Environment=NODE_ENV=development

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

### 5.3 Devel Backend Service

File: `uteach_devel_backend.service`

```ini
[Unit]
Description=DEVEL Uteach Backend (FastAPI via Gunicorn + Uvicorn)
After=network.target

[Service]
Type=simple
User=uteach
Group=uteach
WorkingDirectory=/srv/uteach-speckit-devel/backend

ExecStart=/srv/uteach-speckit-devel/backend/.venv/bin/python3 -m src.main --port 8002

Restart=on-failure
RestartSec=5

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

### 5.4 Devel Frontend Service

File: `uteach_devel_frontend.service`

```ini
[Unit]
Description=DEVEL Uteach Frontend (Dev Server)
After=network.target

[Service]
Type=simple
User=uteach
Group=uteach
WorkingDirectory=/srv/uteach-speckit-devel/frontend

ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5174

Restart=on-failure
RestartSec=5

Environment=NODE_ENV=development

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

### systemd commands

Start services:

```bash
sudo systemctl start uteach_backend.service
sudo systemctl start uteach_frontend.service
sudo systemctl start uteach_devel_backend.service
sudo systemctl start uteach_devel_frontend.service
```

Enable on boot:

```bash
sudo systemctl enable uteach_backend.service
sudo systemctl enable uteach_frontend.service
sudo systemctl enable uteach_devel_backend.service
sudo systemctl enable uteach_devel_frontend.service
```

Logs:

```bash
journalctl -u uteach_backend.service -f
journalctl -u uteach_frontend.service -f
journalctl -u uteach_devel_backend.service -f
journalctl -u uteach_devel_frontend.service -f
```

---

## 6. Apache Reverse Proxy Configuration

### Production (443)

```apache
<VirtualHost *:443>
    ServerName uteach.kky.zcu.cz

    ProxyPreserveHost On
    ProxyRequests Off

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    ProxyPass /api/ http://127.0.0.1:8001/
    ProxyPassReverse /api/ http://127.0.0.1:8001/

    ProxyPass / http://127.0.0.1:5173/
    ProxyPassReverse / http://127.0.0.1:5173/

    SSLCertificateFile /etc/letsencrypt/live/uteach.kky.zcu.cz/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/uteach.kky.zcu.cz/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
```

---

### Devel (444)

```apache
<VirtualHost *:444>
    ServerName uteach.kky.zcu.cz

    ProxyPreserveHost On
    ProxyRequests Off

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "444"

    ProxyPass /api/ http://127.0.0.1:8002/
    ProxyPassReverse /api/ http://127.0.0.1:8002/

    ProxyPass / http://127.0.0.1:5174/
    ProxyPassReverse / http://127.0.0.1:5174/

    SSLCertificateFile /etc/letsencrypt/live/uteach.kky.zcu.cz/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/uteach.kky.zcu.cz/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
```

---

## 7. Running the Application

### Manual execution

#### Production

```bash
cd backend
source .venv/bin/activate
uvicorn src.main:app --host 127.0.0.1 --port 8001

cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

---

#### Devel

```bash
cd backend
source .venv/bin/activate
uvicorn src.main:app --host 127.0.0.1 --port 8002

cd frontend
npm run dev -- --host 0.0.0.0 --port 5174
```

---

## 8. Verification

Production:
[https://uteach.kky.zcu.cz](https://uteach.kky.zcu.cz)

Devel:
[https://uteach.kky.zcu.cz:444](https://uteach.kky.zcu.cz:444)

---

## 9. Notes

* Production runs on HTTPS :443
* Devel runs on HTTPS :444
* systemd manages persistent services
* Vite dev server is used for frontend runtime

