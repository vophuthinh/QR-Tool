# GitHub Actions Workflows

## Quick Start

### 1. Auto Build (Tự động khi push code)

Workflow `docker-build-deploy.yml` sẽ tự động:
- ✅ Build Docker image khi push vào `main`/`master`
- ✅ Push lên GitHub Container Registry
- ✅ Deploy lên server (nếu đã setup SSH)

**Không cần setup gì!** Chỉ cần push code là xong.

### 2. Deploy lên Server

#### Setup một lần:

1. **Tạo SSH key:**
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
```

2. **Copy public key lên server:**
```bash
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server.com
```

3. **Thêm GitHub Secrets:**
   - Vào repo → Settings → Secrets and variables → Actions
   - Thêm các secrets sau:
     - `SSH_HOST`: IP hoặc domain server
     - `SSH_USERNAME`: Username SSH
     - `SSH_PRIVATE_KEY`: Nội dung file `~/.ssh/github_actions`
     - `SSH_PORT`: Port SSH (mặc định: 22)
     - `DEPLOY_PATH`: Đường dẫn trên server (ví dụ: `/opt/qr-generator`)

4. **Setup trên server:**
```bash
mkdir -p /opt/qr-generator
cd /opt/qr-generator
# Copy docker-compose.prod.yml và đổi tên thành docker-compose.yml
# Cập nhật image name trong docker-compose.yml
```

## Workflows

| Workflow | Trigger | Mô tả |
|----------|---------|-------|
| `docker-build-deploy.yml` | Push/Pull Request | Build và deploy tự động |
| `docker-build-only.yml` | Manual | Chỉ build image |
| `deploy-ssh.yml` | Push/Manual | Deploy lên server qua SSH |

## Image Location

Sau khi build, image sẽ có tại:
```
ghcr.io/[username]/[repo-name]:latest
```

## Xem chi tiết

Xem file [DEPLOY.md](./DEPLOY.md) để biết hướng dẫn chi tiết.

