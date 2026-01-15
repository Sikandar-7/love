# Medusa Admin Customizations Documentation

This document provides a comprehensive guide to all customizations made to the Medusa v2 admin panel.

## Table of Contents

1. [Overview](#overview)
2. [Features Added](#features-added)
3. [How to Access Features](#how-to-access-features)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)

## Overview

The admin panel has been enhanced with professional features for managing an e-commerce store. All customizations are located in the `src/admin/` folder and follow Medusa v2's extension patterns.

## Features Added

### 1. Dashboard Widgets

#### Sales Analytics Widget
- **Location**: Home dashboard (before zone)
- **Features**:
  - Today's revenue and order count
  - 7-day revenue chart with visual bars
  - Order count per day
  - Auto-refresh capability

#### Low Stock Alerts Widget
- **Location**: Home dashboard (before zone)
- **Features**:
  - Shows products with stock < 10 units
  - Color-coded alerts (red for < 5, orange for 5-9)
  - Quick navigation to product details
  - View all low stock products

#### Recent Orders Widget
- **Location**: Home dashboard (before zone)
- **Features**:
  - Last 10 orders with status badges
  - Customer email and order total
  - Click to view order details
  - Status color coding

#### Top Selling Products Widget
- **Location**: Home dashboard (after zone)
- **Features**:
  - Top 5 products by sales volume
  - Visual progress bars
  - Quick navigation to product pages

#### Customer Activity Widget
- **Location**: Home dashboard (after zone)
- **Features**:
  - Recent customer registrations
  - Time ago display
  - Customer avatars
  - Quick navigation to customer profiles

#### Quick Actions Widget
- **Location**: Home dashboard (before zone)
- **Features**:
  - Quick access to common actions
  - New Product, New Order, Reports, Customers

### 2. Enhanced Product Management

#### Bulk Product Editor
- **Location**: Products → Bulk Editor (custom route)
- **Features**:
  - Select multiple products
  - Bulk update status
  - Bulk update metadata
  - Select all functionality

**Access**: Navigate to `/products/bulk-editor` in admin

### 3. Order Management

#### Order Notes & Timeline Widget
- **Location**: Order details page (after zone)
- **Features**:
  - Add notes to orders
  - View order timeline
  - Track order history
  - User attribution

**Access**: Open any order detail page, widget appears at bottom

### 4. Customer Insights

#### Customer Insights Page
- **Location**: Customers → Insights (custom route)
- **Features**:
  - Customer lifetime value (LTV)
  - Order count and average order value
  - Customer segmentation (VIP, High, Medium, Low)
  - Filter by segment
  - Sort by LTV

**Access**: Navigate to `/customers/insights` in admin

### 5. Marketing Tools

#### Marketing Campaigns Page
- **Location**: Marketing → Campaigns (custom route)
- **Features**:
  - Create discount campaigns
  - Set percentage or fixed discounts
  - Campaign scheduling (start/end dates)
  - Campaign status tracking
  - Usage statistics
  - Coupon code generator

**Access**: Navigate to `/marketing/campaigns` in admin

#### Coupon Code Generator
- **Features**:
  - Generate random 8-character codes
  - Link codes to campaigns
  - One-click generation

**Access**: From Marketing Campaigns page, click "Generate Coupon"

### 6. Reports & Analytics

#### Sales Reports Page
- **Location**: Reports → Sales (custom route)
- **Features**:
  - Revenue reports (7d, 30d, 90d, 1y)
  - Total orders and average order value
  - Growth percentage comparison
  - Export to CSV
  - Export to PDF (placeholder)

**Access**: Navigate to `/reports/sales` in admin

## How to Access Features

### Dashboard Widgets
1. Log in to admin panel at `http://localhost:9000/app`
2. Widgets appear automatically on the home dashboard

### Custom Pages
1. Navigate using the sidebar menu (if added) or directly via URL:
   - Bulk Editor: `/products/bulk-editor`
   - Customer Insights: `/customers/insights`
   - Marketing Campaigns: `/marketing/campaigns`
   - Sales Reports: `/reports/sales`

### Widgets on Existing Pages
- Order Notes widget appears automatically on order detail pages
- Product widgets can be added to product pages (zones: `product.details.before`, `product.details.after`)

## Configuration

### Pakistan-Specific Settings

#### 1. Run Setup Script
```bash
npx medusa exec ./src/scripts/setup-pakistan.ts
```

This script will:
- Create Pakistan region with PKR currency
- Set up basic configuration

#### 2. Manual Configuration Steps

**Add Cash on Delivery Payment Provider:**
1. Go to Settings → Payment Providers
2. Add a custom payment provider for COD
3. Configure it for the Pakistan region

**Configure Shipping Zones:**
1. Go to Settings → Shipping
2. Create shipping zones for Pakistan cities
3. Set up shipping rates

**Set Default Currency:**
1. Go to Settings → Regions
2. Ensure Pakistan region has PKR as currency
3. Set as default if needed

**Add Pakistan Cities:**
The setup script includes major Pakistan cities. You can add more in:
- Settings → Regions → Pakistan → Shipping Zones

### Environment Variables

No additional environment variables are required. The customizations use existing Medusa configuration.

## API Routes

All custom API routes are located in `src/api/admin/custom/`:

- `/admin/custom/analytics` - Dashboard analytics data
- `/admin/custom/reports/sales` - Sales report data
- `/admin/custom/reports/export` - Export reports (CSV/PDF)
- `/admin/custom/customers/insights` - Customer insights data
- `/admin/custom/marketing/campaigns` - Marketing campaigns CRUD
- `/admin/custom/marketing/coupons/generate` - Generate coupon codes
- `/admin/custom/orders/[id]/notes` - Order notes CRUD

## Troubleshooting

### Widgets Not Appearing

**Issue**: Dashboard widgets don't show up

**Solutions**:
1. Check that files are in `src/admin/widgets/` folder
2. Verify widget config exports `defineWidgetConfig`
3. Ensure zone names are correct (e.g., `home.before`, `home.after`)
4. Restart Medusa dev server: `npm run dev`
5. Clear browser cache and hard refresh

### API Routes Returning 404

**Issue**: Custom API routes not found

**Solutions**:
1. Verify route files are in `src/api/admin/custom/` folder
2. Check file naming: `route.ts` (not `routes.ts`)
3. Ensure proper HTTP method exports (GET, POST, etc.)
4. Restart Medusa server
5. Check server logs for errors

### Navigation Not Working

**Issue**: Clicking widgets doesn't navigate

**Solutions**:
1. Widgets use `window.location.href` for navigation
2. Ensure URLs are correct (e.g., `/products/123`)
3. Check browser console for JavaScript errors

### Data Not Loading

**Issue**: Widgets show "Loading..." indefinitely

**Solutions**:
1. Check API route is responding (test in browser/Postman)
2. Verify database connection
3. Check server logs for errors
4. Ensure modules are properly resolved in API routes
5. Verify user has admin permissions

### TypeScript Errors

**Issue**: TypeScript compilation errors

**Solutions**:
1. Run `npm install` to ensure dependencies are installed
2. Check `tsconfig.json` includes admin folder
3. Verify `@medusajs/admin-sdk` and `@medusajs/ui` are installed
4. Check import paths are correct

### Currency Display Issues

**Issue**: Currency not showing as PKR

**Solutions**:
1. Run Pakistan setup script
2. Verify region currency is set to PKR
3. Check `formatCurrency` functions in widgets
4. Ensure Intl.NumberFormat locale is set to "en-PK"

## Development

### Adding New Widgets

1. Create file in `src/admin/widgets/`
2. Export component and config:
```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const MyWidget = () => {
  // Widget content
}

export const config = defineWidgetConfig({
  zone: "home.before", // or other zone
})

export default MyWidget
```

### Adding New Pages

1. Create folder in `src/admin/routes/your-page/`
2. Create `page.tsx` file:
```tsx
import { definePageConfig } from "@medusajs/admin-sdk"

const MyPage = () => {
  // Page content
}

export const config = definePageConfig({
  label: "My Page",
  description: "Page description",
})

export default MyPage
```

### Adding New API Routes

1. Create folder in `src/api/admin/custom/your-route/`
2. Create `route.ts` file:
```tsx
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Handle GET request
}
```

## File Structure

```
src/
├── admin/
│   ├── widgets/              # Dashboard widgets
│   │   ├── sales-analytics-widget.tsx
│   │   ├── low-stock-alerts-widget.tsx
│   │   ├── recent-orders-widget.tsx
│   │   ├── top-products-widget.tsx
│   │   ├── customer-activity-widget.tsx
│   │   ├── order-notes-widget.tsx
│   │   └── quick-actions-widget.tsx
│   ├── routes/               # Custom pages
│   │   ├── products/
│   │   │   └── bulk-editor/
│   │   ├── customers/
│   │   │   └── insights/
│   │   ├── marketing/
│   │   │   └── campaigns/
│   │   └── reports/
│   │       └── sales/
│   └── components/           # Reusable components
│       ├── help-tooltip.tsx
│       └── quick-actions.tsx
├── api/
│   └── admin/
│       └── custom/           # Custom API routes
│           ├── analytics/
│           ├── reports/
│           ├── customers/
│           ├── marketing/
│           └── orders/
└── scripts/
    └── setup-pakistan.ts     # Pakistan configuration
```

## Next Steps

1. **Database Integration**: Some features (campaigns, notes) use mock data. Integrate with database for production.

2. **PDF Generation**: Implement proper PDF generation for invoices and reports using libraries like `pdfkit` or `puppeteer`.

3. **Email Notifications**: Set up automated email notifications for order status changes.

4. **Dark Mode**: Implement dark mode toggle using Medusa UI theme system.

5. **Keyboard Shortcuts**: Add global keyboard shortcut handler.

6. **Abandoned Cart Recovery**: Implement abandoned cart tracking and recovery emails.

7. **Inventory Forecasting**: Add ML-based inventory forecasting.

8. **Advanced Analytics**: Integrate chart libraries (recharts, chart.js) for better visualizations.

## Support

For issues or questions:
1. Check Medusa documentation: https://docs.medusajs.com
2. Review server logs for errors
3. Check browser console for frontend errors
4. Verify all dependencies are installed

## Version Information

- Medusa Version: 2.12.5
- Node Version: >= 20
- Database: PostgreSQL

---

**Last Updated**: 2024
**Maintained By**: Your Team
