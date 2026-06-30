# System Utilities: File Upload

## Overview
This module provides a unified API for uploading files (images, documents) to Firebase Storage. This supports other modules that require storing and using file/image URLs (such as user avatars, equipment images, survey photos, and evidence).

## Standard Error Codes
- `MSG-UF-01`: No file provided or file is empty.
- `MSG-UF-02`: File format not supported (e.g., not an image).
- `MSG-UF-03`: File size exceeds the allowed limit.
- `MSG-UF-04`: Upload to Firebase Storage failed.

## Endpoints

### 1. `POST /api/v1/upload/image`
- **Use Case:** Global Image Upload
- **Description:** Uploads an image file to Firebase Storage and returns the public URL. This is intended to support features that store an image URL in the database (e.g., updating user avatars, equipment photos, and field operations).
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body (FormData):**
  - `file`: The image file (jpeg, png, webp, etc.)
  - `folder`: (Optional) The target folder name in Firebase Storage (e.g., `avatars`, `equipments`, `surveys`, `evidence`). Defaults to `general`.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-UF-00",
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/avatars%2Fimage123.jpg?alt=media",
    "fileName": "image123.jpg",
    "folder": "avatars",
    "size": 1024500,
    "mimeType": "image/jpeg"
  }
}
```
