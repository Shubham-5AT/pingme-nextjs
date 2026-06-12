# PingME — Apache Deployment Guide

## Architecture Overview

```
Browser → Apache (port 80/443) → Node.js server (port 3000)
```

Apache acts as a **reverse proxy**. The Next.js Node.js process handles all requests.

---

## Step 1: Copy Files to Server

Copy the following from your build output to the server:

```
.next/standalone/          → your deployment folder (e.g., /var/www/pingme/)
.next/static/              → copy into /var/www/pingme/.next/static/
public/                    → copy into /var/www/pingme/public/
```

**Commands:**
```bash
scp -r .next/standalone/   user@your-server:/var/www/pingme/
scp -r .next/static/       user@your-server:/var/www/pingme/.next/static/
scp -r public/             user@your-server:/var/www/pingme/public/
scp .env.local             user@your-server:/var/www/pingme/.env.local
```

---

## Step 2: Install PM2 (Process Manager)

On the server:
```bash
npm install -g pm2
```

---

## Step 3: Start the App with PM2

```bash
cd /var/www/pingme
pm2 start server.js --name pingme --env production
pm2 save
pm2 startup   # auto-start on reboot
```

The app will run on **port 3000** by default.

---

## Step 4: Configure Apache Virtual Host

Enable required Apache modules:
```bash
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests rewrite headers
sudo systemctl restart apache2
```

Create virtual host config:
```bash
sudo nano /etc/apache2/sites-available/pingme.conf
```

Paste the contents of `pingme.conf` from this folder.

Enable the site:
```bash
sudo a2ensite pingme.conf
sudo systemctl reload apache2
```

---

## Step 5: SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com
```

---

## Useful PM2 Commands

```bash
pm2 status           # check if running
pm2 logs pingme      # view logs
pm2 restart pingme   # restart
pm2 stop pingme      # stop
```
