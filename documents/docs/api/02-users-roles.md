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
  - `role` (enum, optional) - Admin, Manager, Leader Staff, Technical Staff
  - `status` (enum, optional) - active, inactive
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-00",
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
  "roleId": 2,
  "email": "user1@company.vn",
  "phone": "0900000000",
  "bio": "Events Manager",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-US-00",
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
  "roleId": 2,
  "email": "user2@company.vn",
  "phone": "0900000002",
  "bio": "Senior Events Manager",
  "avatarUrl": "https://example.com/avatar-updated.jpg"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-00",
  "message": "User updated successfully"
}
```

### `PATCH /api/v1/users/:id/status`
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
  "code": "MSG-US-00",
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
  "code": "MSG-US-00",
  "message": "User password reset successfully"
}
```

## 2. Notification Management (UC 2.3)

### `GET /api/v1/notifications`
- **Use Case:** UC 2.3 - Receive Notifications
- **Description:** Retrieves paginated notifications for the currently authenticated user.
- **Query Parameters:** 
  - `isRead` (boolean, optional)
  - `scope` (enum, optional) - manager (để lấy thông báo chuyên biệt/chuẩn cho Manager)
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-00",
  "data": [
    {
      "notificationId": 1,
      "type": "task",
      "title": "New Assignment",
      "content": "You have been assigned to task T123",
      "priority": "normal",
      "targetScreen": "task_detail",
      "targetRefType": "work_task",
      "targetRefId": 1,
      "isRead": false,
      "pushStatus": "sent",
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
  "code": "MSG-US-00",
  "message": "Notification marked as read."
}
```
