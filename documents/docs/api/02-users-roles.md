# Core System & Access: User and Notification Management

## Overview
This module handles **UC 2.4 (User & Permission Management)** and **UC 2.3 (Notification Management)**.
It primarily interacts with the `InternalUser` and `Notification` entities.

## Standard Error Codes (SRS Mapping)
- `MSG-UC04-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC04-02`: Hệ thống không thể hoàn thành yêu cầu lúc này.
- `MSG-UC04-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC04-05`: Tên người dùng đã tồn tại.
- `MSG-UC03-01`: Không tìm thấy thông báo hoặc bị từ chối truy cập.

## 1. User & Permission Management (UC 2.4)

### 1. `GET /api/v1/users`
- **Use Case:** UC 2.4 - View User List
- **Description:** Retrieves a paginated list of internal users. Admin access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches username or fullName
  - `role` (enum, optional) - Quản trị viên, Quản lý, Trưởng nhóm, Nhân viên kỹ thuật
  - `status` (enum, optional) - Hoạt động, Ngừng hoạt động, Tạm khóa
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-01",
  "data": [
    {
      "userId": 1,
      "username": "user1",
      "fullName": "Manager One",
      "role": "Quản lý",
      "status": "Hoạt động",
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

### 2. `POST /api/v1/users`
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
  "role": "Quản lý",
  "email": "user1@company.vn",
  "phone": "0900000000",
  "bio": "Quản lý sự kiện",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-US-02",
  "message": "Tạo người dùng thành công",
  "data": {
    "userId": 2,
    "username": "user1",
    "fullName": "Manager One",
    "role": "Quản lý",
    "status": "Hoạt động"
  }
}
```

### 3. `PUT /api/v1/users/:id`
- **Use Case:** UC 2.4 - Update User Information
- **Description:** Updates details for an existing user. Admin access required.
- **Business Rules:**
  - BR-04-01: Cannot update username.
  - BR-04-04: Log activity to `AuditLog`.
- **Request Body:**
```json
{
  "fullName": "Manager Two",
  "role": "Quản lý",
  "email": "user2@company.vn",
  "phone": "0900000002",
  "bio": "Quản lý sự kiện cấp cao",
  "avatarUrl": "https://example.com/avatar-updated.jpg"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-03",
  "message": "Cập nhật người dùng thành công"
}
```

### 4. `PATCH /api/v1/users/:id/status`
- **Use Case:** UC 2.4 - Deactivate/Reactivate User
- **Description:** Changes the status of a user. Admin access required.
- **Request Body:**
```json
{
  "status": "Ngừng hoạt động"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-04",
  "message": "Cập nhật trạng thái người dùng thành công"
}
```

### 5. `POST /api/v1/users/:id/reset-password`
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
  "code": "MSG-US-05",
  "message": "Đặt lại mật khẩu người dùng thành công"
}
```

## 2. Notification Management (UC 2.3)

### 6. `GET /api/v1/notifications`
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
  "code": "MSG-US-06",
  "data": [
    {
      "notificationId": 1,
      "type": "Hệ thống",
      "title": "Phân công mới",
      "content": "Bạn đã được phân công thực hiện công việc T123",
      "refType": "work_task",
      "refId": 1,
      "isRead": false,
      "pushStatus": "Đã gửi",
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

### 7. `PUT /api/v1/notifications/:id/read`
- **Use Case:** UC 2.3 - Notification Detail
- **Description:** Marks a specific notification as read.
- **Business Rules:**
  - BR-03-01: User can only mark their own notifications as read.
- **Request Body:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-US-07",
  "message": "Đã đánh dấu thông báo là đã đọc."
}
```
