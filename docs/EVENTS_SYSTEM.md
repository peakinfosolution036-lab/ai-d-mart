# AI D Mart Events System

A comprehensive system for managing and discovering events across Bharat.

## 👤 Customer Features
Customers can browse and interact with events through a dedicated premium interface.

### 🔍 Discovery & Filtering
- **Multi-Filter Search**: Search by Category (Wedding, Corporate, Expo, Concert), Location, and Date.
- **Premium Event Cards**: Visual preview, date, venue, and price at a glance.
- **Save for Later**: Ability to "Heart" events for quick access.

### 🎟 Registration & Booking
- **Digital Tickets**: One-click booking using Wallet balance.
- **View Tracker**: Events track engagement automatically.
- **Confirmed Status**: Real-time confirmation of event registration.

## 🛠 Admin Features
The Master Admin has full control over the event lifecycle.

### 📋 Moderation Flow
- **Pending Queue**: All new event submissions start in `pending`.
- **Approve/Reject**: One-click moderation with real-time status updates.
- **Active Management**: Ability to edit details or delete events.

### 📊 Event Analytics
- **Engagement Tracking**: Real-time view counts for every event.
- **Conversion Metrics**: Number of confirmed bookings.
- **Revenue Overview**: Total revenue generated from registration fees.

## 🔌 API Reference

### Public API (`/api/events`)
- `GET`: Fetch active events with filters (`q`, `location`, `category`, `date`).
- `PATCH`: Increment view counts (requires `id`).

### Booking API (`/api/events/book`)
- `POST`: Create a new booking (requires `eventId`, `userId`, `amount`, `eventTitle`).

### Admin API (`/api/admin/events`)
- `GET`: Full event list with details.
- `POST`: Create official events.
- `PATCH`: Moderation and metadata updates.
- `DELETE`: Permanent removal.

## 💾 Database Schema (DynamoDB)
Items are stored in the `DATA_TABLE` with `PK=EVENT#<id>` and `SK=DATA`.

| Attribute | Type | Description |
|-----------|------|-------------|
| id | string | Unique event ID |
| status | string | `pending`, `ACTIVE`, `REJECTED` |
| category | string | Event type classification |
| views | number | Total user views |
| bookings | number | Total tickets sold |
| revenue | number | Total earnings |
| price | number | Registration fee |
