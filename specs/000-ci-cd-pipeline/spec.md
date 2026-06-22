# CI/CD Pipeline Specification

## 1. Overview

This system defines an automated CI/CD pipeline for deploying the repository to a shared VM using GitHub Actions.

It enforces:
- deterministic deployments from Git state
- branch-based environment routing
- strict CI gating (lint + tests)
- SSH-based deployment execution
- rollback for production failures
- deployment traceability via artifact file

---

## 2. Scope

### In scope
- GitHub Actions pipeline
- VM deployment via SSH
- systemd service management
- git-based deployment strategy

### Out of scope
- infrastructure provisioning
- service implementation (backend/frontend logic)
- monitoring/observability systems

---

## 3. Environments

| Branch | Environment | Path | Services |
|--------|------------|------|----------|
| main | production | /srv/uteach-speckit | uteach_backend, uteach_frontend |
| other | development | /srv/uteach-speckit-devel | uteach_devel_backend, uteach_devel_frontend |

---

## 4. CI Pipeline

### 4.1 Lint Stage

- Tool: Ruff
- Python: 3.13

```bash
ruff check .
```

**Failure condition:**

* any lint error blocks pipeline

---

### 4.2 Test Stage

Current implementation:

```bash
echo "Test placeholder"
```

Future extension point for pytest or integration tests.

**Failure condition:**

* non-zero exit stops pipeline

---

## 5. Deployment Model

### 5.1 Trigger condition

Deployment runs after CI success on every push.

---

### 5.2 Execution model

Deployment is executed via SSH:

* GitHub Actions → VM
* bash script executed remotely
* environment variables passed explicitly

---

## 6. Deployment Algorithm

### 6.1 Branch resolution

```text
if branch == main:
    env = production
else:
    env = development
```

---

### 6.2 Repository update strategy

Each deployment forces synchronization with remote:

```bash
git fetch origin
git checkout <branch>
git reset --hard origin/<branch>
git clean -fd
```

Guarantee:

* local state == origin state
* no merge conflicts
* no local drift

---

### 6.3 State snapshot (production only)

Before update:

```bash
PREVIOUS_COMMIT=$(git rev-parse HEAD)
```

Used for rollback.

---

## 7. Service Management

### Restart order

1. backend service
2. frontend service

```bash
systemctl restart <service>
```

---

### Health check

```bash
systemctl is-active <service>
```

---

## 8. Failure Model

### 8.1 Production

Triggers rollback if:

* restart fails
* service not active after restart

Rollback procedure:

1. restore previous commit
2. restart services
3. set status = ROLLED_BACK

---

### 8.2 Development

* no rollback
* warnings only
* status = FAILED if critical failure occurs

---

## 9. Deployment Artifact

### File

```text
deployment_note.txt
```

### Location

* production: `/srv/uteach-speckit/`
* development: `/srv/uteach-speckit-devel/`

### Mode

Overwrite on every deployment.

### Schema

```text
Deployment Status
Timestamp
Actor
Branch
Commit SHA
Previous Commit
Workflow Run URL
Mode
```

---

## 10. Security Model

### Authentication

* SSH key-based auth via GitHub Secrets
* secrets:

  * SSH_HOST
  * SSH_USER
  * SSH_PRIVATE_KEY

---

### VM permissions

User `uteach`:

* passwordless sudo for systemctl restart only
* no full root access required

---

## 11. System Assumptions

* both VM directories are valid git repositories
* origin remote is correctly configured
* systemd services already installed and enabled
* repo contains backend/ and frontend/ in same structure across environments

---

## 12. Invariants

* deployments are idempotent
* production always has rollback point
* CI must pass before deployment
* only latest commit per branch is deployed
* VM state is never mutated manually

---

## 13. Failure Taxonomy

| Stage           | Failure | Behavior        |
| --------------- | ------- | --------------- |
| lint            | error   | stop pipeline   |
| test            | error   | stop pipeline   |
| deploy (dev)    | failure | warn            |
| deploy (prod)   | failure | rollback        |
| service restart | failure | rollback (prod) |

---

## 14. Execution Semantics

Deployment is:

* destructive
* non-incremental
* git-reset-based
* fully reproducible from remote origin state

No local persistence is allowed.
