# 🔐 **Clerk Authentication Setup Guide**

## **Overview**
This guide will help you set up Clerk authentication for EmailForge, replacing the old session-based authentication system with a modern, secure authentication solution.

## **🚀 Step 1: Create a Clerk Account**

1. **Visit [clerk.com](https://clerk.com)**
2. **Sign up** for a free account
3. **Create a new application** for EmailForge

## **🔑 Step 2: Get Your Clerk Keys**

1. **Go to your Clerk Dashboard**
2. **Navigate to API Keys** in the sidebar
3. **Copy the following keys:**
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## **⚙️ Step 3: Configure Environment Variables**

### **Backend (.env)**
```bash
# Add these to your existing .env file
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### **Frontend (client/.env)**
```bash
# Create client/.env file
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_API_BASE_URL=http://localhost:5000
```

## **🔧 Step 4: Configure Clerk Application**

### **In Clerk Dashboard:**

1. **Authentication Settings:**
   - Enable **Email/Password** authentication
   - Enable **Email verification** (recommended)
   - Set **Session duration** to 24 hours

2. **User Management:**
   - Configure **User profile fields** (First Name, Last Name, Username)
   - Set **Password requirements** (minimum 8 characters)

3. **Appearance:**
   - Customize **Sign-in/Sign-up** pages
   - Match **brand colors** with EmailForge theme

4. **Redirect URLs:**
   - Add `http://localhost:3000` for development
   - Add your production domain when deploying

## **📱 Step 5: Test the Integration**

### **Start the Development Servers:**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

### **Test Authentication Flow:**
1. **Visit** `http://localhost:3000`
2. **Sign up** with a new account
3. **Verify** user appears in sidebar
4. **Test** logout functionality
5. **Verify** protected routes work

## **🔒 Step 6: Security Features**

### **What Clerk Provides:**
- ✅ **JWT-based authentication**
- ✅ **Automatic session management**
- ✅ **Password hashing & salting**
- ✅ **Rate limiting**
- ✅ **Multi-factor authentication** (optional)
- ✅ **Social login** (optional)
- ✅ **User management dashboard**

### **What We've Implemented:**
- ✅ **User sync** between Clerk and Neon database
- ✅ **Protected API routes** with Clerk middleware
- ✅ **Automatic user creation** in local database
- ✅ **Profile updates** synced to local database

## **🔄 Step 7: User Data Synchronization**

### **How It Works:**
1. **User signs up/logs in** via Clerk
2. **Clerk creates** user account
3. **Our middleware** automatically syncs user to Neon database
4. **All API calls** use the synced local user ID
5. **User data** stays consistent between Clerk and local database

### **Sync Triggers:**
- ✅ **User registration**
- ✅ **User login**
- ✅ **Profile updates**
- ✅ **API requests**

## **🐛 Troubleshooting**

### **Common Issues:**

1. **"Clerk publishable key is not configured"**
   - Check `client/.env` file exists
   - Verify `VITE_CLERK_PUBLISHABLE_KEY` is set

2. **"CLERK_SECRET_KEY environment variable is required"**
   - Check backend `.env` file
   - Verify `CLERK_SECRET_KEY` is set

3. **Authentication not working**
   - Check browser console for errors
   - Verify Clerk keys are correct
   - Check network requests in DevTools

4. **User not syncing to database**
   - Check backend logs for sync errors
   - Verify database connection
   - Check user sync service logs

### **Debug Commands:**
```bash
# Check environment variables
echo $CLERK_SECRET_KEY
echo $CLERK_PUBLISHABLE_KEY

# Check frontend environment
cat client/.env

# Check backend environment
cat .env
```

## **🚀 Step 8: Production Deployment**

### **Update Environment Variables:**
```bash
# Production .env
CLERK_SECRET_KEY=sk_live_your_production_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key

# Production client/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key
VITE_API_BASE_URL=https://yourdomain.com
```

### **Update Clerk Dashboard:**
1. **Add production domain** to allowed origins
2. **Update redirect URLs** for production
3. **Switch to live keys** when ready

## **📚 Additional Resources**

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React Components](https://clerk.com/docs/components)
- [Clerk API Reference](https://clerk.com/docs/reference)
- [Clerk Security Best Practices](https://clerk.com/docs/security)

## **✅ What's Been Implemented**

- ✅ **Clerk authentication** integration
- ✅ **User sync service** with Neon database
- ✅ **Protected API routes** with Clerk middleware
- ✅ **Frontend Clerk components** integration
- ✅ **Updated sidebar** with Clerk user info
- ✅ **Updated settings page** for Clerk users
- ✅ **Environment configuration** for both frontend and backend
- ✅ **Comprehensive documentation** and setup guide

## **🎯 Next Steps**

1. **Set up your Clerk account** following this guide
2. **Configure environment variables**
3. **Test the authentication flow**
4. **Customize Clerk appearance** to match your brand
5. **Deploy to production** when ready

---

**🎉 Congratulations!** You now have a modern, secure authentication system powered by Clerk that's fully integrated with your EmailForge application and Neon database.
