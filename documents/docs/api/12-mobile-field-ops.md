# Operations & Field Work: Mobile Field Operations

## Overview
This module aggregates endpoints primarily consumed by the Mobile App for field operations.
It covers:
- **UC 2.18:** Field Operation Monitoring & Approval
- **UC 2.20:** Assigned Field Task Management
- **UC 2.21:** Equipment Pick-list Viewing
- **UC 2.22:** Survey Reporting
- **UC 2.25:** Field Progress Tracking
- **UC 2.26:** Handover Evidence Management
- **UC 2.28:** Damage/Loss Recording

## Standard Error Codes (SRS Mapping)
- `MSG-UC20-01`: Task not found or access denied.
- `MSG-UC25-01`: Invalid progress state transition.
- `MSG-UC26-01`: Missing customer signature/evidence for handover.
- `MSG-UC28-01`: Missing evidence for damage/loss report.

## Endpoints

### `GET /api/v1/tasks/assigned`
- **Use Case:** UC 2.20 - View Assigned Tasks
- **Description:** Mobile staff views their assigned tasks.
- **Query Parameters:**
  - `date` (string, format YYYY-MM-DD, optional)
  - `status` (enum, optional) - PENDING, IN_PROGRESS
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "workTaskId": 1,
      "orderId": 1,
      "taskType": "installation",
      "scheduledStart": "2026-10-14T08:00:00Z",
      "location": "123 Event Hall",
      "status": "pending"
    }
  ],
  "meta": { "totalCount": 5 }
}
```

### `GET /api/v1/tasks/:id/pick-list`
- **Use Case:** UC 2.21 - View Pick List
- **Description:** Retrieves the pick-list of equipment for a specific task (preparation, delivery, etc.).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "catalogItemId": 1,
      "itemName": "Standard Speaker",
      "quantity": 10
    }
  ]
}
```

### `POST /api/v1/tasks/:id/survey-report`
- **Use Case:** UC 2.22 - Record Survey Report
- **Description:** Leader staff uploads survey details and images from the field.
- **Business Rules:**
  - BR-22-01: Must include at least one photo evidence.
- **Request Body:**
```json
{
  "notes": "Venue height limits noted.",
  "evidences": [{ "fileUrl": "url-to-image" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Survey report submitted."
}
```

### `PUT /api/v1/tasks/:id/progress`
- **Use Case:** UC 2.25 - Update Field Progress
- **Description:** Leader staff updates the progress status of a task.
- **Business Rules:**
  - BR-25-01: Updating to `IN_PROGRESS` sets `actualStart`. Updating to `COMPLETED` sets `actualEnd`.
- **Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Arrived at venue, starting setup."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Task progress updated."
}
```

### `GET /api/v1/orders/field-progress`
- **Use Case:** UC 2.18 - Monitor Field Operation Progress
- **Description:** Manager view to monitor real-time updates from field staff.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "orderId": 1,
      "currentTask": "installation",
      "status": "in_progress",
      "lastUpdate": "2026-06-22T08:30:00Z"
    }
  ],
  "meta": { "totalCount": 12 }
}
```

### `POST /api/v1/orders/:id/handover`
- **Use Case:** UC 2.26 - Record Handover Evidence
- **Description:** Leader staff uploads handover photos and confirmation after setup.
- **Business Rules:**
  - BR-26-01: `customerAgreed` must be true and evidence must be provided.
- **Request Body:**
```json
{
  "customerAgreed": true,
  "notes": "Customer signed off.",
  "evidences": [{ "fileUrl": "url-to-image" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Handover record created."
}
```

### `POST /api/v1/orders/:id/damage-loss`
- **Use Case:** UC 2.28 - Record Damage/Loss Report
- **Description:** Leader staff records any damaged or lost items during collection/return.
- **Business Rules:**
  - BR-28-01: Must specify responsible party (CUSTOMER or STAFF).
  - BR-28-02: Requires evidence.
- **Request Body:**
```json
{
  "reportDetails": {
    "items": [
      {
        "catalogItemId": 1,
        "quantity": 1,
        "type": "damaged",
        "responsible": "staff",
        "responsibleUserId": 1
      }
    ]
  },
  "evidences": [{ "fileUrl": "url-to-image" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Damage/Loss report submitted successfully."
}
```
