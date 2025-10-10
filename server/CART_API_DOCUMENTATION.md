# Cart API Documentation

This document provides comprehensive documentation for all Cart-related APIs in the MacZone E-Commerce application.

## Base URL

```
/api/cart
```

## Authentication

All cart endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get User's Cart

Get the current user's shopping cart with all items.

**Endpoint:** `GET /api/cart`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "cart_id": "507f1f77bcf86cd799439011",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "product": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "iPhone 15 Pro Max",
          "description": "Latest iPhone model",
          "thumbnail_url": "https://example.com/image.jpg",
          "category": {
            "_id": "507f1f77bcf86cd799439014",
            "name": "Smartphones"
          }
        },
        "variant": {
          "_id": "507f1f77bcf86cd799439015",
          "color": "Titanium Blue",
          "storage": "256GB",
          "price": 29990000,
          "stock": 50,
          "image_url": "https://example.com/variant.jpg"
        },
        "quantity": 2,
        "subtotal": 59980000
      }
    ],
    "total_items": 2,
    "total_price": 59980000
  }
}
```

**Features:**

- Automatically creates an empty cart if user doesn't have one
- Filters out inactive products and variants
- Automatically removes inactive items from cart
- Calculates total items and total price

---

### 2. Get Cart Item Count

Get the total number of items in user's cart (useful for cart badge).

**Endpoint:** `GET /api/cart/count`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

**Note:** This endpoint only counts active items (products and variants that are still available).

---

### 3. Add Item to Cart

Add a product variant to the shopping cart.

**Endpoint:** `POST /api/cart`

**Authentication:** Required

**Request Body:**

```json
{
  "product_id": "507f1f77bcf86cd799439013",
  "variant_id": "507f1f77bcf86cd799439015",
  "quantity": 1
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | String | Yes | MongoDB ObjectId of the product |
| variant_id | String | Yes | MongoDB ObjectId of the product variant |
| quantity | Number | No | Quantity to add (default: 1, min: 1) |

**Response:**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "product": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "iPhone 15 Pro Max",
      "description": "Latest iPhone model",
      "thumbnail_url": "https://example.com/image.jpg",
      "category": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Smartphones"
      }
    },
    "variant": {
      "_id": "507f1f77bcf86cd799439015",
      "color": "Titanium Blue",
      "storage": "256GB",
      "price": 29990000,
      "stock": 50,
      "image_url": "https://example.com/variant.jpg"
    },
    "quantity": 1,
    "subtotal": 29990000
  }
}
```

**Validation:**

- Product must exist and be active
- Variant must exist and be active
- Variant must belong to the specified product
- Sufficient stock must be available
- If item already exists in cart, quantity is updated

**Error Responses:**

- `400` - Validation error or insufficient stock
- `404` - Product or variant not found

---

### 4. Update Cart Item Quantity

Update the quantity of an existing cart item.

**Endpoint:** `PUT /api/cart/:itemId`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemId | String | Yes | MongoDB ObjectId of the cart item |

**Request Body:**

```json
{
  "quantity": 3
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| quantity | Number | Yes | New quantity (min: 1) |

**Response:**

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "product": { ... },
    "variant": { ... },
    "quantity": 3,
    "subtotal": 89970000
  }
}
```

**Validation:**

- Cart item must exist
- Cart must belong to the authenticated user
- Sufficient stock must be available for the new quantity

**Error Responses:**

- `400` - Validation error or insufficient stock
- `403` - Not authorized to update this cart item
- `404` - Cart item not found

---

### 5. Remove Item from Cart

Remove a specific item from the shopping cart.

**Endpoint:** `DELETE /api/cart/:itemId`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| itemId | String | Yes | MongoDB ObjectId of the cart item |

**Response:**

```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

**Validation:**

- Cart item must exist
- Cart must belong to the authenticated user

**Error Responses:**

- `403` - Not authorized to remove this cart item
- `404` - Cart item not found

---

### 6. Clear Cart

Remove all items from the shopping cart.

**Endpoint:** `DELETE /api/cart`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

**Error Responses:**

- `404` - Cart not found

---

## Database Schema

### Cart Model

```javascript
{
  user_id: ObjectId (ref: User, unique),
  createdAt: Date,
  updatedAt: Date
}
```

### CartItem Model

```javascript
{
  cart_id: ObjectId (ref: Cart),
  product_id: ObjectId (ref: Product),
  variant_id: ObjectId (ref: ProductVariant),
  quantity: Number (min: 1, default: 1),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `cart_id` - For efficient cart item queries
- `product_id` - For product lookups
- `variant_id` - For variant lookups
- `cart_id + variant_id` (unique compound) - Ensures one variant per cart

---

## Business Logic

### Stock Management

- All cart operations check stock availability
- Adding items checks if requested quantity is available
- Updating quantity checks if new quantity is available
- If insufficient stock, the operation fails with appropriate error message

### Inactive Items Handling

- When getting cart, inactive products/variants are automatically filtered out
- Inactive items are automatically removed from the database
- This ensures cart only contains available products

### Cart Creation

- Cart is automatically created for user on first add to cart operation
- Empty cart is returned if user has no cart when calling GET endpoint

### Duplicate Prevention

- Compound unique index on `cart_id + variant_id` prevents duplicates
- If same variant is added again, quantity is incremented instead

### Authorization

- Users can only access their own cart
- All operations verify cart ownership before proceeding

---

## Example Usage

### Complete Flow Example

```javascript
// 1. Add item to cart
const addResponse = await fetch("/api/cart", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_TOKEN",
  },
  body: JSON.stringify({
    product_id: "507f1f77bcf86cd799439013",
    variant_id: "507f1f77bcf86cd799439015",
    quantity: 2,
  }),
});

// 2. Get cart count for badge
const countResponse = await fetch("/api/cart/count", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});
const {
  data: { count },
} = await countResponse.json();

// 3. Get full cart details
const cartResponse = await fetch("/api/cart", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});
const cart = await cartResponse.json();

// 4. Update item quantity
const updateResponse = await fetch("/api/cart/507f1f77bcf86cd799439012", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_TOKEN",
  },
  body: JSON.stringify({
    quantity: 3,
  }),
});

// 5. Remove specific item
const removeResponse = await fetch("/api/cart/507f1f77bcf86cd799439012", {
  method: "DELETE",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});

// 6. Clear entire cart
const clearResponse = await fetch("/api/cart", {
  method: "DELETE",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});
```

---

## Testing with Swagger

All cart endpoints are documented in Swagger UI. Access it at:

```
http://localhost:5000/api-docs
```

Look for the "Cart" tag in the Swagger documentation to test all cart endpoints interactively.

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message description",
  "errors": [
    {
      "msg": "Detailed validation error",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors, insufficient stock)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not authorized to access resource)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Notes

1. **Cart Persistence**: Cart data persists in the database, so users can close the app and return to find their items still in the cart.

2. **Stock Validation**: All operations that modify cart validate stock availability to prevent overselling.

3. **Performance**: The API uses MongoDB indexes for efficient queries and population.

4. **Security**: All endpoints require authentication and verify cart ownership.

5. **Data Integrity**: Compound unique indexes prevent duplicate items in cart.

6. **Auto-cleanup**: Inactive products/variants are automatically removed when fetching cart.
