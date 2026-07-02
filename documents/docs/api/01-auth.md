# Core System & Access: Authentication and Personal Account

## Overview
This module handles **UC 2.1 (Authentication)** and **UC 2.2 (Personal Account Management)** for `Internal User`. It uses JSON Web Tokens (JWT) for session management and relies on the `InternalUser` entity.

## Standard Error Codes (SRS Mapping)
- `MSG-UC01-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC01-02`: Tên người dùng hoặc mật khẩu không hợp lệ.
- `MSG-UC01-03`: Tài khoản bị khóa hoặc không hoạt động.
- `MSG-UC01-04`: Token đã hết hạn hoặc không hợp lệ.
- `MSG-UC02-01`: Đổi mật khẩu thất bại (mật khẩu cũ không chính xác).

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
  "code": "MSG-AU-01",
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "expiresIn": 86400,
    "user": {
      "userId": 1,
      "username": "adminUser",
      "fullName": "System Admin",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "Quản trị viên hệ thống",
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
  "code": "MSG-AU-02",
  "message": "Đăng xuất thành công."
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
  "code": "MSG-AU-03",
  "message": "Nếu tài khoản tồn tại, email khôi phục sẽ được gửi."
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
  "code": "MSG-AU-04",
  "message": "Đổi mật khẩu thành công."
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
  "code": "MSG-AU-05",
  "data": {
    "userId": 1,
    "username": "adminUser",
    "fullName": "System Admin",
    "email": "admin@example.com",
    "phone": "+123456789",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Quản trị viên hệ thống",
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
  "bio": "Quản trị viên hệ thống (đã cập nhật)",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-AU-06",
  "message": "Cập nhật hồ sơ thành công.",
  "data": {
    "userId": 1,
    "username": "adminUser",
    "fullName": "System Admin Updated",
    "email": "admin@example.com",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "bio": "Quản trị viên hệ thống (đã cập nhật)",
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
  "code": "MSG-AU-07",
  "message": "Đăng ký token thiết bị thành công."
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
  "code": "MSG-AU-08",
  "data": [
    {
      "notificationId": 1,
      "title": "Được phân công đơn hàng mới",
      "body": "Bạn đã được phân công thực hiện đơn hàng #ORD-010.",
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
  "code": "MSG-AU-09",
  "message": "Đã đánh dấu thông báo là đã đọc."
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
  "code": "MSG-AU-10",
  "message": "Đã đánh dấu tất cả thông báo là đã đọc."
}
```
