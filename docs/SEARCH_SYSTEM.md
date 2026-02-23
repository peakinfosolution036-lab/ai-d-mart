# AI D Mart Search System

The search system is designed to provide high-speed, relevant results across all entities in the AI D Mart platform.

## 👥 Customer Search
Customers can find services and events through a dedicated search interface in their dashboard.

### 📅 Event Search Features
- **By Location**: Filter events within a specific city/region.
- **By Date**: Targeted search for events on a specific day.
- **By Category**: Standardized categories:
    - Wedding
    - Corporate
    - Expo
    - Concert

### 🏷️ Service Search
Customers can search across specialized database segments:
- **Stores**: Find local retailers and businesses.
- **Jobs**: Search for career opportunities.
- **Offers**: Find active discounts and coupons.
- **Businesses**: Explore registered service providers.

## 🛠 Admin Global Search
The Admin panel features a "Master Search" capability that performs a simultaneous scan across:
- **Users**: Search by Name, Email, or System ID.
- **Events**: Search by Event Title or Description.
- **Stores**: Search by Store Name or Category.
- **Jobs**: Search by Job Title or Company.

## 🔌 API Implementation
- **Endpoint**: `GET /api/search`
- **Parameters**:
    - `q`: Search keyword.
    - `type`: `event` for targeted event search, or empty for global entity search.
    - `location`, `date`, `category`: Filters for event search.
    - `entities`: Comma-separated list for global search (e.g., `user,event,job`).

## 💾 Database Logic
- Implemented using `src/lib/dynamodb.ts` which utilizes `ScanCommand` with runtime filtering to ensure complex cross-field matching that standard DynamoDB queries don't support natively without complex GSI designs.
