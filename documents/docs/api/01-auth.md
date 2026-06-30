# Core System & Access: Authentication and Personal Account

## Overview
This module handles **UC 2.1 (Authentication)** and **UC 2.2 (Personal Account Management)** for `Internal User`. It uses JSON Web Tokens (JWT) for session management and relies on the `InternalUser` entity.

## Standard Error Codes (SRS Mapping)
- `MSG-UC01-01`: Required information is missing or invalid.
- `MSG-UC01-02`: Invalid username or password.
- `MSG-UC01-03`: Account is locked or inactive.
- `MSG-UC01-04`: Token expired or invalid.
- `MSG-UC02-01`: Password change failed (old password incorrect).

## Endpoints

### 1. `POST /api/v1/auth/login`
- **Use Case:** UC 2.1 - Login
- **Description:** Authenticates an internal user and issues a JWT token.
- **Business Rules:**
  - BR-01-01: Must validate username and password against `InternalUser` table.
  - BR-01-02: User `status` must be `active`. If inactive, return error `MSG-UC01-03`.
  - BR-01-03: On success, log activity in `AuditLog`.
- **Request Body:**
```json
{
  "username": "adminUser",
  "password": "securePassword123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "expiresIn": 86400,
    "user": {
      "userId": 1,
      "username": "adminUser",
      "fullName": "System Admin",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "System Administrator",
      "role": {
        "roleId": 1,
        "roleName": "Admin"
      },
      "status": "active"
    }
  }
}
```

### 2. `POST /api/v1/auth/logout`
- **Use Case:** UC 2.1 - Logout
- **Description:** Invalidates the current user session.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "Logged out successfully."
}
```

### 3. `POST /api/v1/auth/forgot-password`
- **Use Case:** UC 2.1 - Forgot Password
- **Description:** Initiates the password recovery process for an internal user.
- **Request Body:**
```json
{
  "username": "adminUser"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "If the account exists, a recovery email has been sent."
}
```

### 4. `PUT /api/v1/auth/change-password`
- **Use Case:** UC 2.2 - Change Password
- **Description:** Allows authenticated users to change their password.
- **Headers:** `Authorization: Bearer <token>`
- **Business Rules:** 
  - BR-02-01: `oldPassword` must match current hash. 
  - BR-02-02: `newPassword` must meet complexity requirements.
- **Request Body:**
```json
{
  "oldPassword": "securePassword123",
  "newPassword": "newSecurePassword456",
  "confirmNewPassword": "newSecurePassword456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "Password changed successfully."
}
```

### 5. `GET /api/v1/auth/profile`
- **Use Case:** UC 2.2 - View Profile
- **Description:** Retrieves the personal profile of the currently logged-in user.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "data": {
    "userId": 1,
    "username": "adminUser",
    "fullName": "System Admin",
    "email": "admin@example.com",
    "phone": "+123456789",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "System Administrator",
    "role": {
      "roleId": 1,
      "roleName": "Admin"
    },
    "status": "active",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 6. `PUT /api/v1/auth/profile`
- **Use Case:** UC 2.2 - Update Profile
- **Description:** Allows the authenticated user to update their personal profile information, including their avatar.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "fullName": "System Admin Updated",
  "phone": "+1234567890",
  "bio": "Updated System Administrator",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "Profile updated successfully.",
  "data": {
    "userId": 1,
    "username": "adminUser",
    "fullName": "System Admin Updated",
    "email": "admin@example.com",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "bio": "Updated System Administrator",
    "role": {
      "roleId": 1,
      "roleName": "Admin"
    },
    "status": "active",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 7. `POST /api/v1/auth/device-token`
- **Use Case:** UC 7 - Register Device Token
- **Description:** Registers or updates a device token (e.g., FCM token) for the authenticated user to receive push notifications.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "deviceToken": "fcm_token_string_here",
  "deviceType": "android" 
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "Device token registered successfully."
}
```

### 8. `GET /api/v1/notifications`
- **Use Case:** UC 7 - View Notifications
- **Description:** Retrieves a paginated list of notifications for the authenticated user.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?page=1&limit=20`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "data": [
    {
      "notificationId": 1,
      "title": "New Order Assigned",
      "body": "You have been assigned to Order #ORD-010.",
      "type": "ORDER_ASSIGNMENT",
      "referenceId": 10,
      "isRead": false,
      "createdAt": "2026-06-22T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### 9. `PUT /api/v1/notifications/:id/read`
- **Use Case:** UC 7 - Mark Notification as Read
- **Description:** Marks a specific notification as read.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "Notification marked as read."
}
```

### 10. `PUT /api/v1/notifications/read-all`
- **Use Case:** UC 7 - Mark All Notifications as Read
- **Description:** Marks all unread notifications for the user as read.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-00",
  "message": "All notifications marked as read."
}
```
