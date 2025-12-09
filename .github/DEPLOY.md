# Hướng dẫn Auto Deploy với GitHub Actions

## Tổng quan

Dự án này có 3 workflow GitHub Actions:

1. **docker-build-deploy.yml** - Build và deploy tự động khi push code
2. **docker-build-only.yml** - Chỉ build image (chạy manual)
3. **deploy-ssh.yml** - Deploy lên server qua SSH

## Setup

### 1. GitHub Container Registry (Tự động)

Không cần setup gì! GitHub Actions tự động sử dụng `GITHUB_TOKEN` để push image lên GitHub Container Registry.

Image sẽ được lưu tại: `ghcr.io/[username]/[repo-name]`

### 2. Deploy lên Server qua SSH

#### Bước 1: Tạo SSH Key

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
```

#### Bước 2: Copy public key lên server

```bash
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server.com
```

#### Bước 3: Thêm Secrets vào GitHub

Vào **Settings > Secrets and variables > Actions**, thêm các secrets sau:

- `SSH_HOST`: Địa chỉ IP hoặc domain của server (ví dụ: `192.168.1.100` hoặc `example.com`)
- `SSH_USERNAME`: Username để SSH (ví dụ: `root` hoặc `ubuntu`)
- `SSH_PRIVATE_KEY`: Nội dung file private key (`~/.ssh/github_actions`)
- `SSH_PORT`: Port SSH (mặc định: `22`)
- `DEPLOY_PATH`: Đường dẫn trên server chứa docker-compose.yml (ví dụ: `/opt/qr-generator`)
- `APP_PORT`: Port ứng dụng chạy (mặc định: `4000`)

#### Bước 4: Setup trên Server

1. Tạo thư mục cho ứng dụng:
```bash
mkdir -p /opt/qr-generator
cd /opt/qr-generator
```

2. Tạo file `docker-compose.yml`:
```yaml
services:
  qr-generator:
    image: ghcr.io/[username]/[repo-name]:latest
    container_name: qr-generator
    ports:
      - "4000:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

3. Login vào GitHub Container Registry:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u [username] --password-stdin
```

Hoặc tạo Personal Access Token với quyền `read:packages` và dùng:
```bash
docker login ghcr.io -u [username] -p [token]
```

## Cách sử dụng

### Auto Deploy (Khi push code)

Workflow `docker-build-deploy.yml` sẽ tự động:
1. Build Docker image khi push vào branch `main` hoặc `master`
2. Push image lên GitHub Container Registry
3. Deploy lên server (nếu đã setup SSH secrets)

### Manual Deploy

1. Vào **Actions** tab trên GitHub
2. Chọn workflow muốn chạy
3. Click **Run workflow**
4. Chọn branch và click **Run workflow**

### Pull image trên server

```bash
docker pull ghcr.io/[username]/[repo-name]:latest
docker-compose up -d
```

## Troubleshooting

### Lỗi: Permission denied khi pull image

Cần login vào GitHub Container Registry:
```bash
docker login ghcr.io -u [username] -p [token]
```

### Lỗi: SSH connection failed

- Kiểm tra `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY` trong GitHub Secrets
- Đảm bảo public key đã được thêm vào `~/.ssh/authorized_keys` trên server
- Kiểm tra firewall có cho phép SSH không

### Lỗi: Image not found

- Đảm bảo workflow build đã chạy thành công
- Kiểm tra image name trong docker-compose.yml trên server
- Đảm bảo đã login vào GitHub Container Registry

