# Core System & Access: User and Notification Management

## Overview
This module handles **UC 2.4 (User & Permission Management)** and **UC 2.3 (Notification Management)**.
It primarily interacts with the `InternalUser` and `Notification` entities.

## Standard Error Codes (SRS Mapping)
- `MSG-UC04-01`: Required information is missing or invalid.
- `MSG-UC04-02`: System cannot complete the request at this time.
- `MSG-UC04-03`: You do not have permission to perform this action.
- `MSG-UC04-05`: Username already exists.
- `MSG-UC03-01`: Notification not found or access denied.

## 1. User & Permission Management (UC 2.4)

### `GET /api/v1/users`
- **Use Case:** UC 2.4 - View User List
- **Description:** Retrieves a paginated list of internal users. Admin access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches username or fullName
  - `role` (enum, optional) - ADMIN, MANAGER, LEADER_STAFF, TECHNICAL_STAFF
  - `status` (enum, optional) - ACTIVE, INACTIVE, LOCKED
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "username": "user1",
      "fullName": "Manager One",
      "role": {
        "roleId": 2,
        "roleName": "Manager"
      },
      "status": "active",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 100
  }
}
```

### `POST /api/v1/users`
- **Use Case:** UC 2.4 - Create User Information
- **Description:** Creates a new internal user. Admin access required.
- **Business Rules:**
  - BR-04-01: Username must be unique.
  - BR-04-04: Log activity to `AuditLog`.
- **Request Body:**
```json
{
  "username": "user1",
  "password": "InitialPassword123!",
  "fullName": "Manager One",
  "roleId": 2
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": 2,
    "username": "user1",
    "fullName": "Manager One",
    "role": {
      "roleId": 2,
      "roleName": "Manager"
    },
    "status": "active"
  }
}
```

### `PUT /api/v1/users/:id`
- **Use Case:** UC 2.4 - Update User Information
- **Description:** Updates details for an existing user. Admin access required.
- **Business Rules:**
  - BR-04-01: Cannot update username.
  - BR-04-04: Log activity to `AuditLog`.
- **Request Body:**
```json
{
  "fullName": "Manager Two",
  "roleId": 2
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### `PUT /api/v1/users/:id/status`
- **Use Case:** UC 2.4 - Deactivate/Reactivate User
- **Description:** Changes the status of a user. Admin access required.
- **Request Body:**
```json
{
  "status": "inactive"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

### `POST /api/v1/users/:id/reset-password`
- **Use Case:** UC 2.4 - Reset User Password
- **Description:** Resets the password of a specific user. Admin access required.
- **Request Body:**
```json
{
  "newPassword": "NewSecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User password reset successfully"
}
```

## 2. Notification Management (UC 2.3)

### `GET /api/v1/notifications`
- **Use Case:** UC 2.3 - Receive Notifications
- **Description:** Retrieves paginated notifications for the currently authenticated user.
- **Query Parameters:** 
  - `isRead` (boolean, optional)
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "notificationId": 1,
      "title": "New Assignment",
      "content": "You have been assigned to task T123",
      "isRead": false,
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 5
  }
}
```

### `PUT /api/v1/notifications/:id/read`
- **Use Case:** UC 2.3 - Notification Detail
- **Description:** Marks a specific notification as read.
- **Business Rules:**
  - BR-03-01: User can only mark their own notifications as read.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read."
}
```
