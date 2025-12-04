# GlowBridge Backend

## Running locally

1. Set `DATABASE_URL` in your environment.
2. Optional: set `PGSSL=true` if using a managed DB that requires SSL.
3. Start in dev mode:

```bash
npm run dev
```

Server listens on `http://localhost:3005` by default.

## API Base URL

All endpoints are prefixed with:

```
http://localhost:3005/api
```

## Conventions

- Request/response bodies are JSON.
- Use header: `Content-Type: application/json` for POST/PUT.
- Validation errors return HTTP 400 with shape:

```json
{
  "error": "ValidationError",
  "message": "Invalid request body",
  "fieldErrors": { "field": ["message"] },
  "formErrors": []
}
```

- Unique constraint conflict (e.g., duplicate email) returns HTTP 409:

```json
{ "error": "Conflict", "message": "Email already exists" }
```

---

## Users

Table: `public.user`

Fields:

- `id: uuid`
- `first_name: text`
- `last_name: text`
- `email: text` (unique)
- `contact_number: text`
- `role: text` (defaults to `customer`)

Allowed roles: `customer`, `admin`, `salon_owner`, `salon_staff`.

### Create user

- Method: POST
- Path: `/users`
- Body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "contact_number": "+1234567890",
  "role": "customer"
}
```

- Response: 201

```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "contact_number": "+1234567890",
    "role": "customer"
  }
}
```

- cURL

```bash
curl -X POST http://localhost:3005/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "contact_number": "+1234567890",
    "role": "customer"
  }'
```

### List users

- Method: GET
- Path: `/users`
- Query Parameters (required):
  - `page`: Page number (minimum: 1)
  - `limit`: Items per page (minimum: 1, maximum: 100)
- Query Parameters (optional):
  - `role`: Filter by user role (`customer`, `admin`, `salon_owner`, `salon_staff`)
- Response: 200

```json
{
  "users": [
    {
      "id": "uuid",
      "first_name": "...",
      "last_name": "...",
      "email": "...",
      "contact_number": "...",
      "role": "..."
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

- cURL

```bash
# List users with pagination
curl "http://localhost:3005/api/users?page=1&limit=10"

# Filter by role
curl "http://localhost:3005/api/users?page=1&limit=10&role=admin"
```

### Get user by id

- Method: GET
- Path: `/users/:id`
- Params: `id` (uuid)
- Response: 200

```json
{
  "user": {
    "id": "uuid",
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "contact_number": "...",
    "role": "..."
  }
}
```

- cURL

```bash
USER_ID=replace-with-uuid
curl http://localhost:3005/api/users/$USER_ID
```

### Update user

- Method: PUT
- Path: `/users/:id`
- Params: `id` (uuid)
- Body (all fields optional):

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "contact_number": "+9876543210",
  "role": "admin"
}
```

- Response: 200

```json
{
  "user": {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "contact_number": "+9876543210",
    "role": "admin"
  }
}
```

- cURL

```bash
USER_ID=replace-with-uuid
curl -X PUT http://localhost:3005/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "email": "jane.doe@example.com"
  }'
```

### Delete user

- Method: DELETE
- Path: `/users/:id`
- Params: `id` (uuid)
- Response: 200

```json
{ "message": "User deleted successfully" }
```

- cURL

```bash
USER_ID=replace-with-uuid
curl -X DELETE http://localhost:3005/api/users/$USER_ID
```

---

## Salons

Currently implemented route:

### Create salon

- Method: POST
- Path: `/salons`
- Body:

```json
{
  "name": "My Salon",
  "type": "salon",
  "bio": "About us",
  "location": "Colombo",
  "contact_number": "+94112223344"
}
```

- Response: 201

```json
{
  "salon": {
    "id": "uuid",
    "name": "My Salon",
    "type": "salon",
    "bio": "About us",
    "location": "Colombo",
    "contact_number": "+94112223344",
    "created_at": "ISO",
    "updated_at": "ISO"
  }
}
```

- cURL

```bash
curl -X POST http://localhost:3005/api/salons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Salon",
    "type": "salon",
    "bio": "About us",
    "location": "Colombo",
    "contact_number": "+94112223344"
  }'
```
