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
  - BR-01-02: User `status` must be `ACTIVE`. If `LOCKED` or `INACTIVE`, return error `MSG-UC01-03`.
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
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "expiresIn": 86400,
    "user": {
      "id": "uuid-1234",
      "username": "adminUser",
      "fullName": "System Admin",
      "role": "ADMIN",
      "status": "ACTIVE"
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
  "data": {
    "id": "uuid-1234",
    "username": "adminUser",
    "fullName": "System Admin",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```
