# 📱 Mobile Access Guide

## Quick Start

Your dev server runs on **port 5173**. To access from your phone:

1. **Ensure same WiFi network** - Phone and PC must be on the same WiFi
2. **Find your PC's IP address** (see below)
3. **Start dev server**: `npm run dev`
4. **On phone browser**: `http://[YOUR_PC_IP]:5173`
Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
ip addr show
```

### 2. Stop and Restart Dev Server
```bash
# Press Ctrl+C to stop current server
npm run dev
```

### 3. Access on Phone
Use: `http://YOUR_IP:5173`
Example: `http://192.168.1.100:5173`

## Common Issues:

### ❌ Firewall Blocking
**Windows:**
1. Search "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Click "Change settings" → "Allow another app"
4. Add Node.js or allow port 5173
**Quick test:** Temporarily disable firewall to test

### ❌ Wrong Network
- Phone and PC must be on SAME WiFi network
- Don't use phone's mobile data
- Check WiFi name on both devices

### ❌ Wrong IP Address
- Don't use 127.0.0.1 or localhost
- Use actual network IP (starts with 192.168 or 10.x)
- IP might change - check again if it stops working

### ✅ Verify Server is Running
When you run `npm run dev`, you should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

Use the Network URL on your phone!
