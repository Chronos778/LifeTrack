# Chatbot Debug Guide

## 🔍 Steps to Debug the Chatbot Issue

### Step 1: Clear Browser Cache & Restart Servers

1. **Stop both servers** (if running):
   - Press `Ctrl+C` in both terminal windows

2. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files" and "Cookies and other site data"
   - Click "Clear data"
   
3. **Or do a hard refresh**:
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Step 2: Restart Servers

**Terminal 1 - Backend:**
```powershell
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

### Step 3: Test the Login Flow

1. Open browser to `http://localhost:3000`
2. **Open Developer Console** (Press `F12`)
3. Go to the **Console** tab
4. Login with:
   - Email: `raj@example.com`
   - Password: `1234`

**Look for these console messages:**
```
📝 handleLogin called with: {user_id: 1, name: "Raj", ...}
✅ User saved to localStorage
```

### Step 4: Check localStorage

In the browser console (F12), run:
```javascript
localStorage.getItem('user')
```

**Expected output:**
```
'{"user_id":1,"name":"Raj","age":32,"gender":"Male","contact_number":"9875488456","email":"raj@example.com"}'
```

If you see `null`, the login didn't save the user properly.

### Step 5: Click Chatbot Link

1. Click the **🤖 Chatbot** link in the navbar
2. Watch the console for these messages:

**Success case:**
```
🤖 Chatbot component rendering
🤖 Chatbot useEffect triggered
🤖 User from localStorage: {"user_id":1,"name":"Raj",...}
✅ Parsed user: {user_id: 1, name: "Raj", ...}
✅ User data set successfully
```

**Failure case (redirects to login):**
```
🤖 Chatbot component rendering
🤖 Chatbot useEffect triggered
🤖 User from localStorage: null
❌ No user in localStorage, redirecting to login
```

## 🐛 Common Issues & Solutions

### Issue 1: "User from localStorage: null"
**Solution:**
- Login again - the old session wasn't using localStorage
- Check if login actually completes successfully

### Issue 2: Console shows nothing when clicking Chatbot
**Possible causes:**
- Frontend not running
- Build is cached
- Route not registered

**Solutions:**
1. Check frontend terminal - should show "webpack compiled successfully"
2. Stop frontend (`Ctrl+C`) and restart: `npm start`
3. Clear browser cache completely

### Issue 3: "Cannot read property 'user_id' of null"
**Solution:**
- The user object structure is wrong
- Try logging out and logging in again

### Issue 4: Chatbot link doesn't navigate
**Solution:**
- Check browser console for errors
- Make sure you're logged in (user state in App.js)
- Try clicking other nav links first (Home, Doctors, etc.)

## 🔧 Manual Workaround

If chatbot still doesn't work, manually set the user in browser console:

```javascript
localStorage.setItem('user', JSON.stringify({
  user_id: 1,
  name: "Raj",
  age: 32,
  gender: "Male",
  contact_number: "9875488456",
  email: "raj@example.com"
}));
```

Then refresh the page and try clicking Chatbot again.

## 📊 What to Share for Further Help

If it still doesn't work, share:

1. **Console output** (all messages)
2. **localStorage content**:
   ```javascript
   console.log(localStorage.getItem('user'));
   ```
3. **Network tab** (F12 → Network):
   - Any failed requests?
   - What's the status when clicking Chatbot?
4. **Any error messages** in red in the console

## ✅ Expected Behavior

When everything works:
1. Login → see login success messages
2. Click Chatbot → component loads
3. See welcome message in chat interface
4. Can type and send messages
5. Get AI responses back

---

**After following these steps, the chatbot should work!**
