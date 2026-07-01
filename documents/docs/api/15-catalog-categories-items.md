# Legacy Catalog Management (Frontend Compatibility)

## Overview
This module handles `CatalogCategory` and `CatalogItem` entities, added to maintain compatibility with the Web Frontend's `UC 2.5`.

## Endpoints

### `GET /api/v1/catalog-categories`
- Retrieves a paginated list of catalog categories.

### `GET /api/v1/catalog-categories/:id`
- Retrieves details for a specific catalog category.

### `POST /api/v1/catalog-categories`
- Creates a new catalog category. Admin/Manager access required.

### `PUT /api/v1/catalog-categories/:id`
- Updates a catalog category.

### `PUT /api/v1/catalog-categories/:id/deactivate`
- Updates a catalog category's status (isActive).

### `GET /api/v1/catalog-items`
- Retrieves a paginated list of catalog items. Filters by `itemType`, `categoryId`, `search`.

### `GET /api/v1/catalog-items/:id`
- Retrieves a specific catalog item.

### `POST /api/v1/catalog-items`
- Creates a new catalog item (e.g. SERVICE, PACKAGE). Admin/Manager access required.

### `PUT /api/v1/catalog-items/:id`
- Updates a catalog item.

### `PUT /api/v1/catalog-items/:id/deactivate`
- Updates a catalog item's status.
