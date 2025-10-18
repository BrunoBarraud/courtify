# Courtify API Documentation

Complete API reference for the Courtify platform.

## 🔐 Authentication

All authenticated endpoints require a valid session token in the request cookies.

### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

**Response**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

## 🏟️ Venues

### List Venues
```http
GET /api/venues?city=Miami&search=tennis
```

**Query Parameters**
- `city` (optional): Filter by city
- `country` (optional): Filter by country
- `search` (optional): Search in name and description

**Response**
```json
{
  "venues": [
    {
      "id": "uuid",
      "name": "Miami Tennis Club",
      "slug": "miami-tennis-club",
      "description": "Premier tennis facility",
      "address": "123 Main St",
      "city": "Miami",
      "country": "USA",
      "phone": "+1234567890",
      "email": "info@miamitennisclub.com",
      "amenities": ["parking", "wifi", "showers"],
      "opening_hours": {
        "monday": { "open": "08:00", "close": "22:00" }
      },
      "courts": { "count": 8 }
    }
  ]
}
```

### Get Venue Details
```http
GET /api/venues/:id
```

**Response**
```json
{
  "venue": {
    "id": "uuid",
    "name": "Miami Tennis Club",
    "courts": [
      {
        "id": "uuid",
        "name": "Court 1",
        "court_type": "tennis",
        "hourly_rate": 50.00,
        "is_indoor": false,
        "has_lighting": true
      }
    ]
  }
}
```

### Create Venue (Admin Only)
```http
POST /api/venues
Authorization: Required
Content-Type: application/json

{
  "name": "New Sports Complex",
  "address": "456 Sports Ave",
  "city": "Miami",
  "country": "USA",
  "phone": "+1234567890",
  "email": "info@newsportscomplex.com"
}
```

### Update Venue (Admin Only)
```http
PUT /api/venues/:id
Authorization: Required
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

## 🎾 Courts

### List Courts for Venue
```http
GET /api/venues/:venueId/courts?type=tennis&indoor=true
```

**Query Parameters**
- `type` (optional): Filter by court type
- `indoor` (optional): Filter by indoor/outdoor

**Response**
```json
{
  "courts": [
    {
      "id": "uuid",
      "venue_id": "uuid",
      "name": "Court 1",
      "court_type": "tennis",
      "description": "Professional clay court",
      "is_indoor": false,
      "has_lighting": true,
      "surface_type": "clay",
      "hourly_rate": 50.00,
      "amenities": ["ball machine", "seating"]
    }
  ]
}
```

### Check Court Availability
```http
GET /api/courts/:id/availability?date=2025-01-15
```

**Query Parameters**
- `date` (required): Date in YYYY-MM-DD format

**Response**
```json
{
  "available": true,
  "slots": [
    {
      "start": "2025-01-15T08:00:00Z",
      "end": "2025-01-15T09:00:00Z",
      "available": true,
      "price": 50.00
    },
    {
      "start": "2025-01-15T09:00:00Z",
      "end": "2025-01-15T10:00:00Z",
      "available": false,
      "price": 50.00
    }
  ]
}
```

### Create Court (Admin Only)
```http
POST /api/venues/:venueId/courts
Authorization: Required
Content-Type: application/json

{
  "name": "Court 5",
  "court_type": "tennis",
  "hourly_rate": 60.00,
  "is_indoor": true,
  "has_lighting": true,
  "surface_type": "hard"
}
```

## 📅 Bookings

### List User Bookings
```http
GET /api/bookings?status=confirmed
Authorization: Required
```

**Query Parameters**
- `status` (optional): Filter by status (pending, confirmed, cancelled, completed)

**Response**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "booking_number": "BK-20250115-000001",
      "court_id": "uuid",
      "start_datetime": "2025-01-15T10:00:00Z",
      "end_datetime": "2025-01-15T11:00:00Z",
      "status": "confirmed",
      "total_amount": 50.00,
      "discount_amount": 0,
      "final_amount": 50.00,
      "court": {
        "name": "Court 1",
        "venue": {
          "name": "Miami Tennis Club"
        }
      }
    }
  ]
}
```

### Create Booking
```http
POST /api/bookings
Authorization: Required
Content-Type: application/json

{
  "courtId": "uuid",
  "startDatetime": "2025-01-15T10:00:00Z",
  "endDatetime": "2025-01-15T11:00:00Z",
  "participants": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "notes": "Birthday celebration",
  "promotionCode": "SUMMER2025"
}
```

**Response**
```json
{
  "booking": {
    "id": "uuid",
    "booking_number": "BK-20250115-000001",
    "status": "pending",
    "final_amount": 45.00
  }
}
```

### Cancel Booking
```http
POST /api/bookings/:id/cancel
Authorization: Required
Content-Type: application/json

{
  "reason": "Schedule conflict"
}
```

**Response**
```json
{
  "success": true,
  "refundAmount": 45.00,
  "message": "Booking cancelled. Refund of 45.00 will be processed."
}
```

## 💳 Payments

### Create Payment
```http
POST /api/payments/create
Authorization: Required
Content-Type: application/json

{
  "bookingId": "uuid",
  "paymentMethod": "stripe",
  "currency": "USD"
}
```

**Response**
```json
{
  "success": true,
  "paymentId": "pi_xxx",
  "clientSecret": "pi_xxx_secret_xxx",
  "status": "pending"
}
```

### Stripe Webhook
```http
POST /api/webhooks/stripe
Stripe-Signature: xxx
Content-Type: application/json

{
  "type": "payment_intent.succeeded",
  "data": { ... }
}
```

## 🎫 Subscriptions

### List Subscription Plans
```http
GET /api/subscriptions/plans?venueId=uuid
```

**Response**
```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "Monthly Membership",
      "description": "10 hours per month",
      "duration_days": 30,
      "credits": 10,
      "price": 400.00,
      "court_types": ["tennis", "paddle"]
    }
  ]
}
```

### Subscribe to Plan
```http
POST /api/subscriptions/subscribe
Authorization: Required
Content-Type: application/json

{
  "planId": "uuid",
  "autoRenew": true
}
```

## 🏆 Tournaments

### List Tournaments
```http
GET /api/tournaments?venueId=uuid&status=open
```

**Query Parameters**
- `venueId` (optional): Filter by venue
- `status` (optional): Filter by status (draft, open, in_progress, completed)

**Response**
```json
{
  "tournaments": [
    {
      "id": "uuid",
      "name": "Summer Championship 2025",
      "sport_type": "tennis",
      "tournament_type": "single_elimination",
      "max_participants": 32,
      "registration_fee": 50.00,
      "start_date": "2025-06-01",
      "end_date": "2025-06-07",
      "status": "open"
    }
  ]
}
```

### Register for Tournament
```http
POST /api/tournaments/:id/register
Authorization: Required
Content-Type: application/json

{
  "teamName": "Team Awesome",
  "partnerName": "John Doe"
}
```

## 🔔 Notifications

### List User Notifications
```http
GET /api/notifications?unread=true
Authorization: Required
```

**Response**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Booking Confirmed",
      "body": "Your booking for Court 1 has been confirmed",
      "is_read": false,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Required
```

### Update Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Required
Content-Type: application/json

{
  "emailEnabled": true,
  "pushEnabled": true,
  "bookingReminders": true,
  "promotionalEmails": false
}
```

## 📊 Analytics (Admin Only)

### Venue Statistics
```http
GET /api/admin/venues/:id/stats?startDate=2025-01-01&endDate=2025-01-31
Authorization: Required (Admin)
```

**Response**
```json
{
  "stats": {
    "totalBookings": 150,
    "totalRevenue": 7500.00,
    "averageBookingValue": 50.00,
    "occupancyRate": 75.5,
    "popularCourts": [
      {
        "court_id": "uuid",
        "name": "Court 1",
        "bookings": 45
      }
    ]
  }
}
```

## ⚠️ Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## 🔄 Rate Limiting

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- **Payment endpoints**: 50 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642089600
```

## 📝 Pagination

List endpoints support pagination:

```http
GET /api/venues?page=2&limit=20
```

**Response Headers**
```
X-Total-Count: 150
X-Page: 2
X-Per-Page: 20
X-Total-Pages: 8
```

## 🔍 Filtering & Sorting

Most list endpoints support:

**Filtering**
```http
GET /api/bookings?status=confirmed&startDate=2025-01-01
```

**Sorting**
```http
GET /api/venues?sort=name&order=asc
```

## 🌐 Internationalization

Include `Accept-Language` header:
```http
Accept-Language: es-ES
```

Supported languages:
- `en-US` (English)
- `es-ES` (Spanish)
- `pt-BR` (Portuguese)

---

**API Version**: 1.0.0  
**Base URL**: `https://api.courtify.com`  
**Last Updated**: January 2025
