# Reports, Promotions, Social Media & Settings

This document covers the implementation of advanced features in AI D Mart.

## 📊 Reports & Analytics

### Customer Panel (Business Owners)
Access business performance reports from the **Reports** tab:
- **Event Performance**: Track booking trends over time
- **Sales & Revenue**: View total revenue and transaction history
- **Customer Engagement**: Monitor pending/completed bookings and leads
- **Booking Trends**: Visual 7-day booking chart

### Admin Panel
Platform-wide analytics dashboard:
- **Total Users**: All registered customers and admins
- **Total Revenue**: Combined order revenue
- **Total Bookings**: Event and service bookings
- **Top Businesses**: Highest revenue performers

**API Endpoints:**
- `GET /api/reports` - Platform stats
- `GET /api/reports?type=business&businessId={id}` - Business-specific stats

**Export Options:**
- Export CSV (raw data)
- Download PDF (formatted report)

---

## 📢 Promotions & Ad Campaigns

### Customer Panel (Business Owners)
Create and manage ad campaigns from the **Promotions** tab:

**Campaign Creation:**
1. Click "Create Campaign"
2. Fill in campaign details:
   - Title & Description
   - Target City (optional)
   - Target Category (optional)
   - Duration (days)
   - Budget (₹)
   - Placement: Banner, Featured, Sidebar, Popup
3. Submit for admin approval

**Campaign Status:**
- `pending` - Awaiting admin approval
- `active` - Live and running
- `paused` - Temporarily stopped
- `completed` - Duration ended
- `rejected` - Declined by admin

**Tracking Metrics:**
- Impressions
- Clicks
- CTR (Click-Through Rate)

### Admin Panel
Manage all platform campaigns:
- Approve/Reject pending campaigns
- View campaign analytics
- Control featured listings
- Revenue analytics for promotions

**API Endpoints:**
- `GET /api/campaigns` - All campaigns
- `GET /api/campaigns?businessId={id}` - Business campaigns
- `POST /api/campaigns` - Create campaign
- `PATCH /api/campaigns` - Update status

---

## 📱 Social Media Integration

### Customer Features
- **Share Events/Offers** on:
  - Instagram
  - Facebook
  - WhatsApp
- **Follow Businesses** to get updates
- View followed business updates

### Admin Features
- Track social engagement metrics
- Moderate user-generated content
- Manage social integration settings

**API Endpoints:**
- `POST /api/social` - Share/Follow/Unfollow actions
- `GET /api/social?type=followers&businessId={id}` - Get business followers
- `GET /api/social?type=following&userId={id}` - Get user's following list

### Database Schema
```typescript
// Social Share
{
  id: string;
  userId: string;
  contentType: 'event' | 'offer' | 'product';
  contentId: string;
  platform: 'facebook' | 'instagram' | 'whatsapp';
  createdAt: string;
}

// Follow
{
  id: string;
  userId: string;
  businessId: string;
  createdAt: string;
}
```

---

## ⚙️ Settings

### Customer Settings
Available in the **Settings** tab:

**Notification Preferences:**
- Email Notifications
- Push Notifications
- SMS Alerts
- Promotional Offers
- Order Updates

**Language & Region:**
- Language: English, Hindi, Tamil, Telugu, Marathi
- Region: India, US, UK
- Currency: INR, USD, GBP

**Privacy Controls:**
- Profile Visibility: Public, Business-only, Private
- Location Sharing toggle
- Analytics consent

**Payment Methods:**
- Add/Remove UPI, Cards, Net Banking
- Set default payment method

**API Endpoints:**
- `GET /api/customer/settings?userId={id}` - Get user settings
- `PUT /api/customer/settings` - Update settings

### Admin Settings
Platform configuration options:

**Platform Controls:**
- Maintenance Mode toggle
- App Version display

**Financial Settings:**
- Commission Rate (%)
- Tax Rate (%)
- Featured Listing Price (₹)
- Ad Price per Day (₹)
- Min/Max Withdrawal limits

**Payment Gateways:**
- Razorpay enable/disable
- Paytm enable/disable
- UPI enable/disable

**Feature Toggles:**
- Jobs module
- Events module
- Shopping module
- Rewards module
- Wallet module

**Security & Roles:**
- Role Management (admin permissions)
- Activity Logs
- API Key Management
- Backup & Restore

**API Endpoints:**
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

---

## 🗄️ Database Operations

### DynamoDB Operations Added

```typescript
// src/lib/dynamodb.ts

// Ad Campaigns
campaigns.create(id, data)
campaigns.get(id)
campaigns.getAll()
campaigns.getByBusiness(businessId)
campaigns.getActive()
campaigns.update(id, updates)
campaigns.incrementStats(id, 'impressions' | 'clicks')
campaigns.delete(id)

// User Settings
userSettings.get(userId)
userSettings.save(userId, settings)
userSettings.getDefault()

// Platform Settings
platformSettings.get()
platformSettings.save(settings, adminId)
platformSettings.getDefault()

// Reports
reports.getPlatformStats()
reports.getBusinessStats(businessId)

// Social Engagement
socialEngagement.trackShare(userId, contentType, contentId, platform)
socialEngagement.getSharesByContent(contentType, contentId)
socialEngagement.followBusiness(userId, businessId)
socialEngagement.unfollowBusiness(userId, businessId)
socialEngagement.getFollowers(businessId)
socialEngagement.getFollowing(userId)
```

---

## 🧪 Testing

### Reports Testing
```bash
# Get platform stats
curl http://localhost:3000/api/reports

# Get business stats
curl "http://localhost:3000/api/reports?type=business&businessId=BIZ123"
```

### Campaign Testing
```bash
# Create campaign
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "BIZ123",
    "businessName": "Test Business",
    "title": "Summer Sale",
    "description": "50% off all items",
    "duration": 7,
    "budget": 500,
    "placement": "featured"
  }'

# Update campaign status
curl -X PATCH http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"id": "camp_abc123", "status": "active"}'
```

### Settings Testing
```bash
# Get user settings
curl "http://localhost:3000/api/customer/settings?userId=DI1234"

# Update user settings
curl -X PUT http://localhost:3000/api/customer/settings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "DI1234",
    "language": "hi",
    "notifications": {"email": true, "push": false}
  }'

# Get platform settings
curl http://localhost:3000/api/admin/settings

# Update platform settings
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "ADM001",
    "commissionRate": 12,
    "taxRate": 18
  }'
```

### Social Testing
```bash
# Track share
curl -X POST http://localhost:3000/api/social \
  -H "Content-Type: application/json" \
  -d '{
    "action": "share",
    "userId": "DI1234",
    "contentType": "event",
    "contentId": "EVT123",
    "platform": "whatsapp"
  }'

# Follow business
curl -X POST http://localhost:3000/api/social \
  -H "Content-Type: application/json" \
  -d '{
    "action": "follow",
    "userId": "DI1234",
    "businessId": "BIZ456"
  }'
```

---

## 📝 TypeScript Interfaces

```typescript
// src/types/index.ts

interface AdCampaign {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  image?: string;
  targetCity?: string;
  targetCategory?: string;
  duration: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
  placement: 'banner' | 'featured' | 'sidebar' | 'popup';
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    promotions: boolean;
    orderUpdates: boolean;
    newOffers: boolean;
  };
  language: string;
  region: string;
  currency: string;
  privacy: {
    profileVisibility: 'public' | 'private' | 'business-only';
    showLocation: boolean;
    allowAnalytics: boolean;
  };
  paymentMethods: PaymentMethod[];
  theme: 'light' | 'dark' | 'system';
  updatedAt: string;
}

interface PlatformSettings {
  id: string;
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  paymentGateway: {
    razorpay: boolean;
    paytm: boolean;
    upi: boolean;
  };
  commissionRate: number;
  taxRate: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  featuredListingPrice: number;
  adPricePerDay: number;
  supportEmail: string;
  supportPhone: string;
  socialLinks: SocialLinks;
  features: {
    jobs: boolean;
    events: boolean;
    shopping: boolean;
    rewards: boolean;
    wallet: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}
```
