# Panduan Deployment

## 1. Development Environment

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd rag-llm-assistant

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env file dengan konfigurasi Anda

# Run application
python main.py
```

## 2. Production Deployment

### Persiapan Server

**Minimum Requirements:**
- Ubuntu 20.04+ / CentOS 8+
- Python 3.8+
- 4GB RAM
- 2GB Storage
- Port 8000 terbuka

### Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python dan dependencies
sudo apt install python3 python3-pip python3-venv nginx -y

# Create application user
sudo useradd -m -s /bin/bash ragapp
sudo mkdir /opt/rag-assistant
sudo chown ragapp:ragapp /opt/rag-assistant
```

### Deploy Application

```bash
# Switch to app user
sudo su - ragapp

# Clone repository
cd /opt/rag-assistant
git clone <repository-url> .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env file

# Create directories
mkdir -p data logs
```

### Systemd Service

Create `/etc/systemd/system/rag-assistant.service`:

```ini
[Unit]
Description=RAG LLM Assistant
After=network.target

[Service]
Type=simple
User=ragapp
Group=ragapp
WorkingDirectory=/opt/rag-assistant
Environment=PATH=/opt/rag-assistant/venv/bin
ExecStart=/opt/rag-assistant/venv/bin/python main.py
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rag-assistant
sudo systemctl start rag-assistant
sudo systemctl status rag-assistant
```

### Nginx Configuration

Create `/etc/nginx/sites-available/rag-assistant`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/rag-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 3. Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p data logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Run application
CMD ["python", "main.py"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  rag-assistant:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DEBUG=false
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - rag-assistant
    restart: unless-stopped
```

### Deploy dengan Docker

```bash
# Build dan run
docker-compose up -d

# Check logs
docker-compose logs -f rag-assistant

# Stop
docker-compose down
```

## 4. Monitoring dan Logging

### Log Management

```bash
# Setup log rotation
sudo tee /etc/logrotate.d/rag-assistant << EOF
/opt/rag-assistant/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ragapp ragapp
    postrotate
        systemctl reload rag-assistant
    endscript
}
EOF
```

### Monitoring Script

Create `/opt/rag-assistant/monitoring.py`:

```python
#!/usr/bin/env python3
import requests
import sys
import time

def check_health():
    try:
        response = requests.get('http://localhost:8000/api/v1/health', timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                print("✅ Service is healthy")
                return True
        print("❌ Service is unhealthy")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    if not check_health():
        sys.exit(1)
```

### Cron Job for Monitoring

```bash
# Add to crontab
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * /opt/rag-assistant/venv/bin/python /opt/rag-assistant/monitoring.py >> /opt/rag-assistant/logs/monitoring.log 2>&1
```

## 5. Backup dan Recovery

### Backup Script

Create `/opt/rag-assistant/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup/rag-assistant"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup ChromaDB data
tar -czf $BACKUP_DIR/chroma_db_$DATE.tar.gz -C /opt/rag-assistant/data chroma_db

# Backup configuration
cp /opt/rag-assistant/.env $BACKUP_DIR/env_$DATE

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Automated Backup

```bash
# Add to crontab (daily backup at 2 AM)
0 2 * * * /opt/rag-assistant/backup.sh >> /opt/rag-assistant/logs/backup.log 2>&1
```

### Recovery Process

```bash
# Stop service
sudo systemctl stop rag-assistant

# Restore data
cd /opt/rag-assistant/data
tar -xzf /backup/rag-assistant/chroma_db_YYYYMMDD_HHMMSS.tar.gz

# Restore configuration
cp /backup/rag-assistant/env_YYYYMMDD_HHMMSS /opt/rag-assistant/.env

# Start service
sudo systemctl start rag-assistant
```

## 6. Security Considerations

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Restrict API access if needed
sudo ufw allow from specific-ip to any port 8000
```

### Environment Security

```bash
# Secure .env file
chmod 600 /opt/rag-assistant/.env
chown ragapp:ragapp /opt/rag-assistant/.env
```

### API Rate Limiting

Consider implementing rate limiting in production:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/chat")
@limiter.limit("10/minute")
async def chat_with_assistant(request: Request, chat_request: ChatRequest):
    # Your code here
```

## 7. Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo journalctl -u rag-assistant -f
   ```

2. **Port already in use**
   ```bash
   sudo lsof -i :8000
   sudo kill -9 <PID>
   ```

3. **Permission issues**
   ```bash
   sudo chown -R ragapp:ragapp /opt/rag-assistant
   ```

4. **Database corruption**
   ```bash
   # Restore from backup
   sudo systemctl stop rag-assistant
   rm -rf /opt/rag-assistant/data/chroma_db
   # Restore from backup
   sudo systemctl start rag-assistant
   ```

### Performance Tuning

1. **Increase worker processes** (for high load):
   ```python
   # In main.py
   if __name__ == "__main__":
       uvicorn.run(
           "main:app",
           host=settings.host,
           port=settings.port,
           workers=4  # Add this
       )
   ```

2. **Optimize ChromaDB**:
   - Consider using persistent storage
   - Monitor memory usage
   - Regular maintenance

3. **Nginx optimizations**:
   ```nginx
   # Add to nginx config
   gzip on;
   gzip_types text/plain application/json;
   client_max_body_size 50M;
   proxy_buffering on;
   proxy_buffer_size 128k;
   proxy_buffers 4 256k;
   ```

Dengan mengikuti panduan ini, aplikasi RAG LLM Assistant Anda akan berjalan dengan stabil dan aman di production environment.