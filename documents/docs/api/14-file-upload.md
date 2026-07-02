# System Utilities: File Upload

## Overview
This module provides a unified API for uploading files (images, documents) to Firebase Storage. This supports other modules that require storing and using file/image URLs (such as user avatars, equipment images, survey photos, and evidence).

## Standard Error Codes
- `MSG-UF-01`: Không có tệp được cung cấp hoặc tệp trống.
- `MSG-UF-02`: Định dạng tệp không được hỗ trợ (ví dụ: không phải là ảnh).
- `MSG-UF-03`: Kích thước tệp vượt quá giới hạn cho phép.
- `MSG-UF-04`: Tải lên Firebase Storage thất bại.

## Endpoints

### 1. `POST /api/v1/upload/image`
- **Use Case:** Global Image Upload
- **Description:** Uploads an image file to Firebase Storage and returns the public URL. This is intended to support features that store an image URL in the database (e.g., updating user avatars, equipment photos, and field operations).
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body (FormData):**
  - `file`: Tệp hình ảnh (jpeg, png, webp, v.v.)
  - `folder`: (Tùy chọn) Tên thư mục đích trên Firebase Storage (ví dụ: `avatars`, `equipments`, `surveys`, `evidence`). Mặc định là `general`.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-UF-01",
  "message": "Tải ảnh lên thành công",
  "data": {
    "url": "https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/avatars%2Fimage123.jpg?alt=media",
    "fileName": "image123.jpg",
    "folder": "avatars",
    "size": 1024500,
    "mimeType": "image/jpeg"
  }
}
```
