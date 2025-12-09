# VPS Deployment Guide

## Prerequisites

- Ubuntu 20.04 LTS or later
- At least 4GB RAM, 2 CPU cores
- 50GB disk space
- Docker and Docker Compose installed
- Open ports: 8080 (API), 8761 (Eureka), 3000 (Grafana), 9090 (Prometheus)

## Initial Server Setup

### 1. Install Docker

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/dentalhelp-2.git dentalhelp
cd dentalhelp
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your actual credentials
sudo nano .env
```

Required variables:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string
AZURE_STORAGE_CONTAINER_NAME=xrays
```

## Deployment

### Option 1: Manual Deployment

```bash
cd /opt/dentalhelp

# Pull latest changes
git pull origin main

# Start services
docker-compose up -d

# Start monitoring (optional)
docker-compose -f docker-compose.monitoring.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Automated Deployment Script

```bash
cd /opt/dentalhelp
sudo bash deployment/vps/deploy.sh
```

The script will:
1. Create backup of current deployment
2. Pull latest code
3. Pull latest Docker images
4. Stop old containers
5. Clean up old resources
6. Start new containers
7. Verify health
8. Show deployment summary

## Automated Deployments with GitHub Actions

### Setup SSH Access

1. Generate SSH key on your VPS:
```bash
ssh-keygen -t rsa -b 4096 -C "deploy@dentalhelp"
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_rsa  # Copy this
```

2. Add to GitHub Secrets:
   - `SSH_PRIVATE_KEY`: The private key content
   - `SERVER_HOST`: Your server IP
   - `SERVER_USER`: SSH username (e.g., ubuntu)

3. GitHub Actions will automatically deploy on push to `main` branch

## Monitoring

### Access Dashboards

- **Grafana**: http://YOUR_SERVER_IP:3000
  - Username: admin
  - Password: admin (change on first login)

- **Prometheus**: http://YOUR_SERVER_IP:9090

- **Eureka**: http://YOUR_SERVER_IP:8761

- **API Gateway**: http://YOUR_SERVER_IP:8080

### Set Up Alerts

Edit `monitoring/prometheus/alerts.yml` and reload Prometheus:
```bash
docker-compose -f docker-compose.monitoring.yml restart prometheus
```

## Backup and Restore

### Manual Backup

```bash
# Backup data volumes
docker-compose down
tar -czf dentalhelp-backup-$(date +%Y%m%d).tar.gz \
  -C /var/lib/docker/volumes .

# Upload to S3, Google Drive, etc.
```

### Automated Backups

Add to crontab:
```bash
sudo crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * cd /opt/dentalhelp && docker-compose down && tar -czf /backups/dentalhelp-$(date +\%Y\%m\%d).tar.gz -C /var/lib/docker/volumes . && docker-compose up -d
```

### Restore from Backup

```bash
# Stop services
docker-compose down

# Restore volumes
cd /var/lib/docker/volumes
sudo tar -xzf /path/to/backup.tar.gz

# Start services
cd /opt/dentalhelp
docker-compose up -d
```

## Rollback

If deployment fails, rollback to previous version:

```bash
cd /opt/dentalhelp

# Rollback git
git log --oneline  # Find previous commit
git reset --hard COMMIT_HASH

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

Or restore from backup:
```bash
cd /opt/dentalhelp-backups
# Extract latest backup
tar -xzf dentalhelp-backup-TIMESTAMP.tar.gz -C /opt/dentalhelp
cd /opt/dentalhelp
docker-compose up -d
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

1. Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx
```

2. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/dentalhelp

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/dentalhelp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

3. Get SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## Performance Tuning

### Docker Resource Limits

Edit `docker-compose.yml`:
```yaml
services:
  auth-service:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Database Optimization

Increase connection pool sizes in `application.yml`:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
```

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs auth-service

# Check disk space
df -h

# Check memory
free -h

# Restart specific service
docker-compose restart auth-service
```

### Out of Memory

```bash
# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs auth-db

# Restart database
docker-compose restart auth-db

# Check connections
docker-compose exec auth-db mysql -u root -p -e "SHOW PROCESSLIST;"
```

## Security Checklist

- [ ] Change default passwords (Grafana, databases)
- [ ] Configure firewall (ufw)
- [ ] Set up SSL/TLS
- [ ] Enable auto-updates
- [ ] Configure log rotation
- [ ] Set up monitoring alerts
- [ ] Regular backups
- [ ] Restrict SSH access
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Maintenance

### Regular Tasks

- **Daily**: Check logs for errors
- **Weekly**: Review Grafana dashboards
- **Monthly**: Update Docker images, security patches
- **Quarterly**: Review and optimize database

### Update Application

```bash
cd /opt/dentalhelp
git pull origin main
docker-compose pull
docker-compose up -d --build
```

## Support

For issues, check:
1. Docker logs: `docker-compose logs -f`
2. System logs: `sudo journalctl -u docker -f`
3. Disk space: `df -h`
4. Memory: `free -h`
5. Network: `docker network ls`
