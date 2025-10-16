# 📱 Mobile Access Troubleshooting Guide

## Quick Fix Checklist

### ✅ Step 1: Verify Server is Running
```bash
npm run dev
```
You should see: `Local: http://localhost:5173/` and `Network: http://[IP]:5173/`

### ✅ Step 2: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
ip addr show
```
Look for an IP like 192.168.x.x or 10.0.x.x

### ✅ Step 3: Check Same WiFi Network
- **CRITICAL**: Your phone and laptop MUST be on the SAME WiFi network
- Don't use mobile data on your phone
- Check WiFi name matches on both devices

### ✅ Step 4: Access from Phone
Open browser on phone and go to:
```
http://[YOUR_PC_IP]:5173
```
Example: `http://192.168.1.100:5173`

---

## 🔥 Common Issues & Solutions

### Issue 1: Connection Refused / Can't Connect

**Solution A: Windows Firewall**
1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Click "Change settings" → "Allow another app"
4. Browse to Node.js or add port 5173
5. Check both Private and Public networks

**Solution B: Create Firewall Rule (Windows)**
```bash
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
```

**Solution C: Mac Firewall**
System Preferences → Security & Privacy → Firewall → Firewall Options → Add Node

**Solution D: Temporarily Disable Firewall (Testing Only)**
- Windows: Turn off Windows Defender Firewall temporarily
- Mac: System Preferences → Security & Privacy → Firewall → Turn Off

### Issue 2: Wrong IP Address
- Don't use 127.0.0.1 or localhost
- Use your actual local network IP (192.168.x.x or 10.0.x.x)
- Vite should show the Network URL when starting

### Issue 3: VPN or Multiple Networks
- Disable VPN on both devices
- Make sure laptop isn't using Ethernet while phone uses WiFi
- Both must be on the same network segment

### Issue 4: Router Isolation (Guest Network)
- Some routers isolate devices on guest networks
- Move both devices to main WiFi network
- Check router settings for "AP Isolation" and disable it

---

## 🧪 Testing Steps

1. **Restart dev server** after config changes:
   ```bash
   npm run dev
   ```

2. **Check Vite output** - should show:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.100:5173/
   ```

3. **Test from laptop first**:
   - Open `http://[YOUR_IP]:5173` in laptop browser
   - If this doesn't work, firewall is blocking

4. **Then test from phone**:
   - Use the exact Network URL shown by Vite
   - Try both Chrome and Safari on phone

---

## 🆘 Still Not Working?

### Advanced Debugging

**Check if port is listening:**
```bash
# Windows
netstat -an | findstr :5173

# Mac/Linux
lsof -i :5173
```

**Ping test from phone:**
- Download a network utility app
- Ping your PC's IP address
- If ping fails, network issue exists

**Try different port:**
Edit `vite.config.ts` and change port to 3000 or 8080

**Check antivirus software:**
- Temporarily disable antivirus
- Add exception for Node.js or port 5173

---

## ✨ Success Indicators

When working correctly:
- ✅ Vite shows Network URL on startup
- ✅ Can access from laptop using IP:5173
- ✅ Can access from phone using same URL
- ✅ App loads and functions normally

---

## 📝 Configuration Reference

Your `vite.config.ts` should have:
```typescript
server: {
  host: "0.0.0.0",  // Allows external connections
  port: 5173,       // Standard Vite port
}
```

**After ANY config changes, restart the dev server!**
