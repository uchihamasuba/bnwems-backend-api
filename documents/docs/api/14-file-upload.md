# System Utilities: File Upload & Evidence Management

## Overview
This module provides a unified API for uploading files (images, documents) to Firebase Storage and managing `Evidence` records in the system. This supports other modules that require storing and using file/image URLs (such as user avatars, equipment images, survey photos, and field handover evidence).

## Standard Error Codes
- `MSG-UF-01`: Không có tệp được cung cấp hoặc tệp trống.
- `MSG-UF-02`: Định dạng tệp không được hỗ trợ (ví dụ: không phải là ảnh).
- `MSG-UF-03`: Kích thước tệp vượt quá giới hạn cho phép.
- `MSG-UF-04`: Tải lên lưu trữ thất bại.

---

## Endpoints

### 1. `POST /api/v1/evidence/upload`
- **Use Case:** Global File & Evidence Upload
- **Description:** Uploads a file to Firebase Storage, saves an `Evidence` record in the database, and returns the stored data.
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body (FormData):**
  - `file`: Tệp hình ảnh hoặc tài liệu (jpeg, png, webp, pdf, v.v.)
  - `folder`: (Tùy chọn) Tên thư mục đích (ví dụ: `avatars`, `equipments`, `surveys`, `handover`). Mặc định là `general`.
  - `description`: (Tùy chọn) Mô tả về tệp chứng từ này.
  - `referenceType`: (Tùy chọn) Loại tham chiếu (e.g. `SURVEY_REPORT`, `SCHEDULE_PLAN`, `SETTLEMENT`).
  - `referenceId`: (Tùy chọn) ID của bản ghi tham chiếu.
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-UF-01",
  "message": "Tải ảnh và lưu chứng từ thành công.",
  "data": {
    "evidenceId": 1,
    "fileUrl": "https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/avatars%2Fimage123.jpg?alt=media",
    "fileType": "image/jpeg",
    "description": "Ảnh khảo sát mặt bằng",
    "referenceType": "SURVEY_REPORT",
    "referenceId": 5,
    "uploadedBy": 2,
    "uploadedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 2. `GET /api/v1/evidence/:id`
- **Use Case:** View Evidence Detail
- **Description:** Retrieves the details of a specific evidence record.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-UF-02",
  "data": {
    "evidenceId": 1,
    "fileUrl": "https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/avatars%2Fimage123.jpg?alt=media",
    "fileType": "image/jpeg",
    "description": "Ảnh khảo sát mặt bằng",
    "referenceType": "SURVEY_REPORT",
    "referenceId": 5,
    "uploadedBy": 2,
    "uploadedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 3. `POST /api/v1/users/:id/avatar`
- **Use Case:** Change User Avatar
- **Description:** Uploads a new avatar image to Firebase Storage and updates the user's `avatarUrl` in the database.
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body (FormData):**
  - `file`: Tệp hình ảnh (jpeg, png, webp, v.v.). Dung lượng tối đa 5MB.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-UF-05",
  "message": "Cập nhật ảnh đại diện thành công.",
  "data": {
    "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/avatars%2Fimage123.jpg?alt=media"
  }
}
```
