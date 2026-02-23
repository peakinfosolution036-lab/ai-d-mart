# 🎯 Offers & Promotions Guide - Event Management Platform

## Overview
Complete guide on using Offers and Promotions features for your event management platform.

---

## 📋 Table of Contents
1. [Offers System](#offers-system)
2. [Promotions System](#promotions-system)
3. [Use Cases for Event Management](#use-cases)
4. [Step-by-Step Examples](#examples)
5. [Customer Experience](#customer-experience)

---

## 1. Offers System

### What are Offers?
**Offers** are promotional discount banners displayed to customers. Think of them as visual promotions that attract attention.

### Creating an Offer

**Admin Dashboard → Offers → Create New Offer**

#### Fields:
- **Title**: Catchy name (e.g., "Early Bird Special", "Weekend Flash Sale")
- **Code**: Unique identifier (e.g., `EARLY50`, `WEEKEND20`)
- **Discount**: Amount or percentage off
- **Discount Type**:
  - `Percentage` (e.g., 20% off)
  - `Fixed` (e.g., ₹500 off)
- **Description**: What customers get
- **Color Theme**: Visual appearance
- **Valid From/Until**: Start and end dates
- **Event**: Link to specific event (optional)
- **Min Order Value**: Minimum booking amount required
- **Status**: Enable/Disable

### Example Offers for Events:

#### 1. **Early Bird Discount**
```
Title: "Early Bird Special - 30% OFF"
Code: EARLY30
Discount: 30
Type: Percentage
Description: Book 30 days in advance and save 30%!
Valid: Jan 1 - Jan 31, 2026
Event: Tech Conference 2026
Min Order: ₹1000
```

#### 2. **Group Booking**
```
Title: "Group of 5+ Get 25% OFF"
Code: GROUP25
Discount: 25
Type: Percentage
Description: Book for 5 or more people
Valid: Ongoing
Min Order: ₹5000
```

#### 3. **Festival Special**
```
Title: "New Year Mega Sale - Flat ₹1000 OFF"
Code: NEWYEAR1000
Discount: 1000
Type: Fixed
Description: Celebrate New Year with us!
Valid: Dec 25 - Jan 5
Min Order: ₹3000
```

---

## 2. Promotions System

### What are Promotions?
**Promotions** are promo codes that customers enter at checkout to get discounts.

### Creating a Promo Code

**Admin Dashboard → Promotions → Create New Promo**

#### Fields:
- **Code**: Unique promo code (e.g., `SAVE20`, `FIRSTBOOK`)
- **Title**: Internal name
- **Discount**: Amount or percentage
- **Discount Type**: Percentage or Fixed
- **Description**: Internal notes
- **Expiry Date**: When code expires
- **Min Purchase**: Minimum amount to use code
- **Max Usage**: Total number of times code can be used
- **Max Usage Per User**: Times each user can use it

### Example Promo Codes for Events:

#### 1. **First-Time Customer**
```
Code: FIRSTBOOK
Title: First Booking Discount
Discount: 15
Type: Percentage
Description: For new customers
Expiry: Dec 31, 2026
Min Purchase: ₹500
Max Usage: 1000
Max Per User: 1
```

#### 2. **Referral Code**
```
Code: REFER50
Title: Referral Discount
Discount: 50
Type: Fixed
Description: Referred customer discount
Expiry: Ongoing
Min Purchase: ₹1000
Max Usage: Unlimited
Max Per User: 1
```

#### 3. **Flash Sale**
```
Code: FLASH24H
Title: 24-Hour Flash Sale
Discount: 40
Type: Percentage
Description: Limited time offer
Expiry: Tomorrow
Min Purchase: ₹2000
Max Usage: 100
Max Per User: 1
```

---

## 3. Use Cases for Event Management

### A. Early Bird Discounts
**Goal**: Encourage early bookings

**Strategy**:
1. Create offer "Early Bird - 25% OFF"
2. Set validity 60-30 days before event
3. Promo code: `EARLY25`
4. Gradually reduce discount as event approaches

### B. Group Bookings
**Goal**: Fill more seats

**Strategy**:
1. Offer: "Book 5+ tickets, Get 20% OFF"
2. Min order value: ₹5000
3. Promo code: `GROUP20`
4. No expiry (ongoing)

### C. Student/Senior Discounts
**Goal**: Include diverse audience

**Strategy**:
1. Promo codes: `STUDENT10`, `SENIOR15`
2. 10-15% discount
3. Require verification
4. Max usage per user: 1

### D. Seasonal Promotions
**Goal**: Boost bookings during specific periods

**Strategy**:
1. New Year: `NEWYEAR2026` - 30% OFF
2. Festival Season: `FESTIVAL25` - 25% OFF
3. Summer Special: `SUMMER20` - 20% OFF
4. Set expiry dates for urgency

### E. Last-Minute Deals
**Goal**: Fill remaining seats

**Strategy**:
1. Offer: "Last 10 Seats - 35% OFF"
2. Promo: `LASTHOUR35`
3. Valid: 48 hours before event
4. Max usage: 10

### F. Loyalty/Repeat Customer
**Goal**: Reward returning customers

**Strategy**:
1. Promo: `LOYAL15`
2. 15% discount for 2nd booking onwards
3. Track in customer profile
4. Ongoing validity

---

## 4. Step-by-Step Examples

### Example 1: Creating a Flash Sale for Tech Conference

**Step 1: Create the Offer**
```
Admin Dashboard → Offers → Create New
- Title: "Flash Sale - 50% OFF Tech Conference!"
- Code: TECHFLASH50
- Discount: 50%
- Description: "Limited time - First 50 bookings only"
- Valid: Jan 15, 2026 (Today only)
- Event: Select "Tech Conference 2026"
- Min Order: ₹1000
- Enable: Yes
```

**Step 2: Create Matching Promo Code**
```
Admin Dashboard → Promotions → Create New
- Code: TECHFLASH50
- Title: Tech Flash Sale
- Discount: 50%
- Expiry: Jan 15, 2026 23:59
- Min Purchase: ₹1000
- Max Usage: 50
- Max Per User: 1
```

**Step 3: Notify Customers**
- System will show offer on event page
- Customers can apply code `TECHFLASH50` at checkout
- Discount applied automatically

### Example 2: Early Bird Campaign

**Week 1-2 (60-45 days before)**
```
Offer: SUPER EARLY - 40% OFF
Code: SUPEREARLY40
Valid: 60-45 days before event
```

**Week 3-4 (45-30 days before)**
```
Offer: EARLY BIRD - 30% OFF
Code: EARLY30
Valid: 45-30 days before event
```

**Week 5-6 (30-15 days before)**
```
Offer: ADVANCE BOOKING - 20% OFF
Code: ADVANCE20
Valid: 30-15 days before event
```

**Week 7-8 (15-1 days before)**
```
Offer: REGULAR PRICE
No discount
```

---

## 5. Customer Experience

### How Customers See Offers:

#### On Events Page:
- Colorful offer banners displayed
- Shows discount and validity
- "Apply Code" button visible

#### At Checkout:
1. Customer selects event and tickets
2. Sees "Have a promo code?" field
3. Enters code (e.g., `EARLY30`)
4. Clicks "Apply"
5. Discount shows immediately
6. Final price updated

#### Validation:
- ✅ Code is valid and not expired
- ✅ Min purchase amount met
- ✅ Usage limit not exceeded
- ✅ Event matches (if specified)
- ❌ Shows error if invalid

### Sample Customer Journey:

1. **Browse Events**
   - Sees "Early Bird - 30% OFF" banner
   - Clicks on Tech Conference

2. **Event Details**
   - Reads about event
   - Sees offer: "Use code EARLY30 for 30% OFF"
   - Clicks "Book Now"

3. **Checkout**
   - Selects 2 tickets (₹2000)
   - Enters promo code: `EARLY30`
   - Clicks "Apply"
   - Discount: -₹600
   - Final amount: ₹1400
   - Completes booking

4. **Confirmation**
   - Email shows discount applied
   - Savings highlighted

---

## 6. Best Practices

### Dos ✅
- Create urgency with time-limited offers
- Use clear, memorable promo codes
- Set reasonable min order values
- Track usage and adjust
- Test codes before announcing
- Stack multiple offers strategically
- Send email notifications for new offers

### Don'ts ❌
- Don't make codes too complex
- Don't set unrealistic discounts
- Don't forget expiry dates
- Don't ignore usage limits
- Don't create too many overlapping offers
- Don't reuse expired codes

---

## 7. Marketing Calendar Example

### January (New Year)
- `NEWYEAR30` - 30% OFF (Jan 1-15)
- `RESOLUTION20` - 20% OFF workshops (Jan 1-31)

### February (Valentine's)
- `COUPLE25` - 25% OFF couples tickets (Feb 1-14)
- `LOVEEVENTS` - Special event bundles

### March-April (Season Start)
- `SPRING20` - 20% OFF all events
- `EARLYBIRD` - Rolling early bird discounts

### May-June (Summer)
- `SUMMER25` - 25% OFF outdoor events
- `STUDENT15` - Student discount

### July-August (Mid-Year)
- `MIDYEAR30` - 30% OFF clearance
- `GROUP20` - Group booking specials

### September-October (Festival)
- `FESTIVAL35` - 35% OFF all events
- `DIWALI40` - Diwali special

### November-December (Year-End)
- `BLACKFRIDAY50` - 50% OFF flash sale
- `YEAREND25` - Year-end celebration
- `XMAS30` - Christmas special

---

## 8. Analytics & Tracking

### Monitor These Metrics:
- Total discount amount given
- Number of times each code used
- Most popular promo codes
- Revenue vs. discounts
- Customer acquisition cost with offers
- Repeat usage of codes

### Optimization:
- Disable underperforming offers
- Extend popular offers
- Adjust discount percentages
- Test different code names
- A/B test offer designs

---

## 9. Technical Integration

### For Developers:

#### Promo Code Validation API:
```javascript
POST /api/validate-promo
Body: {
  code: "EARLY30",
  eventId: "event-123",
  amount: 2000,
  userId: "user-456"
}

Response: {
  valid: true,
  discount: 600,
  finalAmount: 1400,
  message: "30% discount applied"
}
```

#### Apply to Booking:
```javascript
// At checkout
const booking = {
  eventId: "event-123",
  userId: "user-456",
  tickets: 2,
  amount: 2000,
  promoCode: "EARLY30",
  discount: 600,
  finalAmount: 1400
}
```

---

## 10. FAQs

**Q: Can I combine multiple promo codes?**
A: Currently, only one promo code per booking.

**Q: What happens when max usage is reached?**
A: Code becomes invalid automatically.

**Q: Can I edit an active promo code?**
A: Yes, but changes apply only to future bookings.

**Q: How do customers know about offers?**
A: Email notifications, website banners, social media.

**Q: Can I target specific customers?**
A: Yes, create exclusive codes and share privately.

**Q: What if a customer forgets to apply code?**
A: They can contact support; admin can manually adjust.

---

## 11. Support & Contact

For questions about Offers & Promotions:
- Check Admin Dashboard → Help
- Email: support@ai-d-mart.com
- Create ticket in admin panel

---

**Last Updated**: January 2026
**Version**: 1.0
