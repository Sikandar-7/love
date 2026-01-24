# 🛍️ Love & Joy - Medusa E-commerce Store

Professional e-commerce platform built with Medusa v2, optimized for Pakistan market.

---

## 🚀 Quick Start

### Development
```bash
# Install dependencies
yarn install

# Start backend
yarn dev

# Start storefront (separate terminal)
cd my-medusa-store-storefront
yarn dev
```

**Access:**
- Admin Panel: `http://localhost:9000/app`
- Storefront: `http://localhost:8000`

---

## 📦 Deployment Guide

### Important: Database Setup After Deploy

**Har deployment par database setup zaroori hai!**

Local aur Production databases alag hain, isliye deploy ke baad ye steps follow karein:

```bash
# 1. Migrations run karein
yarn medusa migrations run

# 2. Pakistan data seed karein
yarn seed:pakistan

# 3. Admin user banayein
yarn medusa user -e admin@example.com -p yourpassword
```

### Seed Files Available:
- `yarn seed:pakistan` - Pakistan region, PKR currency, local products
- `yarn seed` - Default Europe setup

---

## ✨ Admin Panel Features

### 1. 🌟 VIP Customer CRM
- Automatic VIP tagging (50k+ spend)
- Customer segmentation
- **Location:** Customers → Customer Details

### 2. 🛒 Abandoned Cart Recovery
- Track incomplete checkouts
- Recovery email/WhatsApp links
- **Location:** Abandoned Carts tab

### 3. ⚡ Daily Operations Tools
- **Internal Notes:** Order-specific sticky notes
- **WhatsApp Button:** One-click customer contact
- **Location:** Orders → Order Details

### 4. 📊 Store Insights Dashboard
- Real-time revenue tracking
- Order analytics
- Performance metrics
- **Location:** Dashboard tab

---

## 🛠️ Configuration

### Pakistan-Specific Setup

**Region:** Pakistan (PKR)
**Shipping:** Major cities configured
**Payment:** COD + Online

Setup script already includes:
- Karachi, Lahore, Islamabad, Faisalabad
- Standard shipping rates
- PKR currency formatting

---

## 📁 Project Structure

```
my-medusa-store/
├── src/
│   ├── admin/          # Admin panel customizations
│   │   ├── widgets/    # Dashboard widgets
│   │   ├── routes/     # Custom pages
│   │   └── components/ # Reusable components
│   ├── api/            # Custom API routes
│   └── scripts/        # Setup scripts
└── my-medusa-store-storefront/  # Customer-facing store
```

---

## 🔧 Troubleshooting

### Server won't start?
```bash
# Check if ports are free
netstat -ano | findstr :9000
netstat -ano | findstr :8000

# Restart with clean cache
yarn dev
```

### Database issues?
```bash
# Re-run migrations
yarn medusa migrations run

# Re-seed data
yarn seed:pakistan
```

### Admin panel blank/white screen?
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for errors

---

## 🔄 Data Reset (Store Ko Khali Karna)

Agar aap sirf **data delete** karna chahte hain (products, customers, orders) bina extensions/customizations ko khatam kiye:

### Method 1: Database Reset (Recommended - Sabse Fast)

```bash
# 1. Database file delete karein
Remove-Item -Path ".medusa\server\data\medusa.db" -Force

# 2. Fresh database banayein
yarn medusa migrations run

# 3. Fresh data seed karein
yarn seed:pakistan

# 4. Admin user dobara banayein
yarn medusa user -e admin@example.com -p yourpassword
```

**Result:**
- ✅ Saare products, customers, orders delete
- ✅ Admin customizations (widgets, features) safe rahenge
- ✅ Code/Extensions untouched

### Method 2: Manual Delete (Admin Panel Se)

1. **Products:** Products tab → Select All → Delete
2. **Customers:** Customers tab → One by one delete
3. **Orders:** Automatically cleanup ho jayega

**Note:** Time consuming, manual work hai.

---

## 📞 Support

**Medusa Docs:** https://docs.medusajs.com
**Version:** Medusa v2.12.5
**Node:** >= 20

---

**Built with ❤️ for Love & Joy**
