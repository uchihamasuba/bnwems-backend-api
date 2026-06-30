# Operations & Field Work: Survey & Assignment

## Overview
This module handles **UC 2.12 (Survey Management)** and **UC 2.14 - 2.15 (Staff Assignment & Operation Planning)**.
It manages `Schedule` entities and their associated `WorkTask` entities, assigning `InternalUser` personnel to them through the `Assignment` entity.

## Standard Error Codes (SRS Mapping)
- `MSG-UC53-01`: Required information is missing or invalid.
- `MSG-UC53-02`: System cannot complete the request.
- `MSG-UC53-05`: Staff assignment information is missing.
- `MSG-UC55-06`: Task cannot be deleted because it has already started or been executed.
- `MSG-UC12-01`: Survey report already submitted.

## 1. Survey Management (UC 2.12)

### `POST /api/v1/orders/:id/tasks`
- **Use Case:** UC 2.12 - Create Survey Task
- **Description:** Manager creates a survey task linked to an order.
- **Request Body:**
```json
{
  "scheduleId": 1,
  "taskType": "survey",
  "scheduledStart": "2026-08-01T09:00:00Z",
  "scheduledEnd": "2026-08-01T12:00:00Z",
  "location": "123 Event Hall"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "message": "Survey task created.",
  "data": { "workTaskId": 1 }
}
```

### `GET /api/v1/tasks/:id/survey-report`
- **Use Case:** UC 2.12 - View Survey Report
- **Description:** Manager reviews submitted survey reports attached to a task.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "data": {
    "workTaskId": 1,
    "notes": "Venue has strict height limits.",
    "evidences": [
      { "fileUrl": "https://storage.example.com/survey1.jpg" }
    ],
    "submittedAt": "2026-06-22T12:00:00Z"
  }
}
```

### `PUT /api/v1/tasks/:id/survey-report/review`
- **Use Case:** UC 2.12 - Survey Report Approval
- **Description:** Manager duyệt hoặc yêu cầu bổ sung báo cáo khảo sát.
- **Request Body:**
```json
{
  "status": "approved",
  "reviewNotes": "All good to proceed."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "message": "Survey report review submitted."
}
```

## 2. Staff Assignment (UC 2.14, 2.15)

### `GET /api/v1/schedules`
- **Use Case:** UC 2.14 - View Schedule List
- **Description:** Manager views scheduled operations for orders.
- **Query Parameters:**
  - `orderId` (string, optional)
  - `status` (enum, optional)
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "data": [
    {
      "scheduleId": 1,
      "orderId": 1,
      "status": "draft",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 50 }
}
```

### `POST /api/v1/tasks`
- **Use Case:** UC 2.15.1 - Create Work Task for Staff
- **Description:** Creates an operational task (e.g. preparation, transport, installation) and links it to a `Schedule`.
- **Business Rules:**
  - BR-52-05: Must be linked to a related `scheduleId`.
- **Request Body:**
```json
{
  "scheduleId": 1,
  "taskType": "installation",
  "scheduledStart": "2026-10-14T08:00:00Z",
  "scheduledEnd": "2026-10-15T18:00:00Z",
  "location": "123 Event Hall"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "message": "Task created successfully.",
  "data": { "workTaskId": 1 }
}
```

### `POST /api/v1/tasks/:id/assignments`
- **Use Case:** UC 2.15.2 - Assign Work Task for Staff
- **Description:** Assigns staff members to a specific task.
- **Business Rules:**
  - BR-53-06: Must identify responsible staff and roles.
  - BR-53-08: Assignment changes should trigger notification to affected staff (UC 2.3).
- **Request Body:**
```json
{
  "assignments": [
    {
      "userId": 1,
      "assignedRole": "Leader Staff"
    },
    {
      "userId": 2,
      "assignedRole": "Technical Staff"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "message": "Staff assigned and notified."
}
```

### `PUT /api/v1/tasks/:id`
- **Use Case:** UC 2.15.3 - Edit Work Task
- **Description:** Modifies a task.
- **Business Rules:**
  - BR-54-07: Executed tasks should not be modified, only updated with progress.
- **Request Body:**
```json
{
  "scheduledStart": "2026-10-14T09:00:00Z"
}
```

### `PATCH /api/v1/tasks/:id/status`
- **Use Case:** UC 2.15.4 - Soft Delete / Cancel Task
- **Description:** Soft-deletes or cancels an unscheduled or draft task.
- **Business Rules:**
  - BR-55-07: Cannot delete if `status` is not `pending`. Returns `MSG-UC55-06`.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-00",
  "message": "Task deleted."
}
```
