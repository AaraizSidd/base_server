# TODO API - Complete Documentation Report

## 📋 Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Validation & Error Handling](#validation--error-handling)
8. [Data Flow](#data-flow)
9. [Code Examples](#code-examples)
10. [Curl Commands](#curl-commands)

---

## 🎯 Overview

The TODO API is a comprehensive task management system built using **Express.js** with **TypeScript** and **MongoDB**. It allows authenticated users to create, read, update, and delete their personal todos with features like:

- ✅ User authentication (JWT-based)
- ✅ Role-based access control
- ✅ Todo ownership verification
- ✅ Advanced filtering and pagination
- ✅ Status tracking (pending, in_progress, completed)
- ✅ Priority levels (low, medium, high)
- ✅ Due date management
- ✅ Rate limiting on write operations
- ✅ Comprehensive error handling

---

## 📁 Project Structure

```
src/APIs/todo/
├── models/
│   └── todo.model.ts           # MongoDB Schema Definition
├── repo/
│   └── todo.repository.ts       # Database Query Layer
├── types/
│   └── todo.interface.ts        # TypeScript Interfaces & Types
├── validation/
│   ├── validation.schema.ts     # Joi Validation Schemas
│   └── validations.ts           # Custom Validators
├── todo.controller.ts           # Request Handlers
├── todo.service.ts              # Business Logic Layer
├── router.ts                    # Route Definitions
└── index.ts                     # Route Export
```

**Integration Points:**
- Registered in `src/APIs/index.ts` at route `/v1/todo`
- Response messages in `src/constant/responseMessage.ts`
- Uses existing authentication middleware from `src/middlewares/authenticate.ts`

---

## 🏗️ Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────┐
│         Express Routes (router.ts)      │
│  GET, POST, PUT, PATCH, DELETE /todo   │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│     Controller Layer (controller.ts)    │
│  - Request validation                   │
│  - Parameter extraction                 │
│  - Response formatting                  │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│     Service Layer (todo.service.ts)     │
│  - Business logic                       │
│  - Ownership verification               │
│  - Data transformation                  │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│    Repository Layer (todo.repository.ts)│
│  - Database queries                     │
│  - MongoDB operations                   │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│      MongoDB Database (todo.model.ts)   │
│  - Data persistence                     │
│  - Schema validation                    │
└─────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Todo Collection Schema

```typescript
{
  _id: ObjectId,              // Unique identifier (auto-generated)
  title: String,              // Required, 3-255 chars
  description: String,        // Optional, max 1000 chars
  status: String,             // pending | in_progress | completed
  priority: String,           // low | medium | high (default: medium)
  dueDate: Date,              // Optional expiry date
  userId: String,             // Reference to user who owns this todo
  createdAt: Date,            // Timestamp of creation
  updatedAt: Date             // Timestamp of last update
}
```

**Indexes:**
- `userId` - indexed for fast user-specific queries

**Collection Name:** `todos`

---

## 🔌 API Endpoints

### 1. Create Todo
**Endpoint:** `POST /v1/todo`
- **Authentication:** Required ✅
- **Rate Limiting:** Applied ✅
- **Request Body:**
  ```json
  {
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "dueDate": "2026-03-15"
  }
  ```
- **Response:** 201 Created
  ```json
  {
    "success": true,
    "data": {
      "_id": "65f1234...",
      "title": "Buy groceries",
      "status": "pending",
      "userId": "65f0987...",
      "createdAt": "2026-03-09T10:30:00Z"
    }
  }
  ```

### 2. Get All Todos
**Endpoint:** `GET /v1/todo`
- **Authentication:** Required ✅
- **Query Parameters:**
  - `status`: Filter by status (pending, in_progress, completed)
  - `priority`: Filter by priority (low, medium, high)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
- **Response:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      { "todoObject1": {...} },
      { "todoObject2": {...} }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
  ```

### 3. Get Specific Todo
**Endpoint:** `GET /v1/todo/:id`
- **Authentication:** Required ✅
- **Ownership Check:** Yes ✅
- **Response:** 200 OK
  ```json
  {
    "success": true,
    "data": { "todoObject": {...} }
  }
  ```
- **Error:** 404 Not Found / 403 Unauthorized

### 4. Update Todo
**Endpoint:** `PUT /v1/todo/:id`
- **Authentication:** Required ✅
- **Rate Limiting:** Applied ✅
- **Ownership Check:** Yes ✅
- **Request Body:** (all fields optional)
  ```json
  {
    "title": "Updated title",
    "status": "in_progress",
    "priority": "medium",
    "dueDate": "2026-03-20"
  }
  ```
- **Response:** 200 OK (updated todo)
- **Error:** 404 Not Found / 403 Unauthorized

### 5. Mark Todo Complete
**Endpoint:** `PATCH /v1/todo/:id/complete`
- **Authentication:** Required ✅
- **Rate Limiting:** Applied ✅
- **Ownership Check:** Yes ✅
- **What it does:** Sets status to `completed`
- **Response:** 200 OK (updated todo)

### 6. Delete Todo
**Endpoint:** `DELETE /v1/todo/:id`
- **Authentication:** Required ✅
- **Rate Limiting:** Applied ✅
- **Ownership Check:** Yes ✅
- **Response:** 200 OK
  ```json
  {
    "success": true,
    "message": "Operation is completed",
    "data": { "deletedTodoObject": {...} }
  }
  ```
- **Error:** 404 Not Found / 403 Unauthorized

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
┌────────────────────────────────┐
│   1. User Registers & Logs In  │
│   - Credentials validated      │
│   - JWT tokens generated       │
│   - Stored in cookies          │
└──────────────┬─────────────────┘
               │
┌──────────────▼─────────────────┐
│  2. Request to Todo Endpoint   │
│   - Cookies sent with request  │
│   - accessToken extracted      │
└──────────────┬─────────────────┘
               │
┌──────────────▼─────────────────┐
│3. Authenticate Middleware      │
│   - Verifies JWT token         │
│   - Extracts userId            │
│   - Attaches user to request   │
└──────────────┬─────────────────┘
               │
┌──────────────▼─────────────────┐
│  4. Controller Receives Req    │
│   - req.authenticatedUser set  │
│   - User ID available for ops  │
└────────────────────────────────┘
```

### Authorization (Ownership Verification)

For `GET`, `PUT`, `DELETE`, `PATCH` operations:

```typescript
// In validation/validations.ts
todoOwnershipVerification: async (todoId: string, userId: string) => {
  // 1. Fetch todo from database
  const todo = await query.getTodoById(todoId)
  
  // 2. Check if todo exists
  if (!todo) throw new Error('Todo not found')
  
  // 3. Compare todo owner with authenticated user
  if (todo.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized')
  }
  
  // 4. Return todo if authorized
  return todo
}
```

**Key Point:** Users can **only** access/modify their own todos.

---

## ✅ Validation & Error Handling

### Input Validation (Joi Schemas)

#### Create Todo Schema
```typescript
{
  title: required, string, 3-255 chars
  description: optional, string, max 1000 chars
  priority: optional, enum [low, medium, high]
  dueDate: optional, ISO date format
}
```

#### Update Todo Schema
```typescript
{
  title: optional, string, 3-255 chars
  description: optional, string, max 1000 chars
  status: optional, enum [pending, in_progress, completed]
  priority: optional, enum [low, medium, high]
  dueDate: optional, ISO date or null
}
```

### Error Handling Hierarchy

```
1. Validation Errors (422 Unprocessable Entity)
   - Invalid input format
   - Missing required fields
   - Type mismatches
   ↓
2. Authentication Errors (401 Unauthorized)
   - Missing or invalid token
   ↓
3. Authorization Errors (403 Forbidden)
   - User trying to access another user's todo
   ↓
4. Not Found Errors (404 Not Found)
   - Todo doesn't exist
   ↓
5. Server Errors (500 Internal Server Error)
   - Unexpected exceptions
```

### Error Response Format

```json
{
  "success": false,
  "statusCode": 422,
  "request": {
    "ip": "::1",
    "method": "POST",
    "url": "/v1/todo"
  },
  "message": "Title is required",
  "data": null,
  "trace": {
    "error": "ValidationError..."
  }
}
```

---

## 🔄 Data Flow

### Complete Request-Response Flow for Create Todo

```
1. CLIENT REQUEST
   └─ POST /v1/todo
   └─ Headers: Content-Type: application/json
   └─ Cookies: accessToken
   └─ Body: { title, description, priority, dueDate }

2. ROUTE MATCHING
   └─ router.ts identifies POST /
   └─ Applies authenticate middleware + rateLimiter
   └─ Routes to controller.createTodo

3. MIDDLEWARE PIPELINE
   └─ authenticate: Validates token, attaches user
   └─ rateLimiter: Checks rate limit quota

4. CONTROLLER (todo.controller.ts)
   └─ Extracts req.body
   └─ Extracts req.authenticatedUser._id
   └─ Validates using Joi schema
   └─ Returns error (422) if validation fails
   └─ Calls createTodoService()

5. SERVICE (todo.service.ts)
   └─ Creates todoObj with all fields
   └─ Sets status: 'pending' (default)
   └─ Calls repository.createTodo()
   └─ Returns { success: true, data: newTodo }

6. REPOSITORY (todo.repository.ts)
   └─ Calls todoModel.create(payload)
   └─ MongoDB saves document
   └─ Returns saved todo with _id

7. RESPONSE SENT
   └─ Status: 201 Created
   └─ Body: { success, statusCode, data, message }

8. CLIENT RECEIVES
   └─ Todo created successfully
   └─ Can use returned _id for future operations
```

### Complete Request-Response Flow for Delete Todo

```
1. CLIENT REQUEST
   └─ DELETE /v1/todo/ObjectId
   └─ Cookies: accessToken

2. ROUTE MATCHING
   └─ router.ts identifies DELETE /:id
   └─ Applies authenticate middleware + rateLimiter
   └─ Routes to controller.deleteTodo

3. MIDDLEWARE PIPELINE
   └─ authenticate: Validates token, gets userId
   └─ rateLimiter: Rate limit check

4. CONTROLLER
   └─ Extracts params.id (todoId)
   └─ Extracts authenticatedUser._id (userId)
   └─ Calls deleteTodoService(todoId, userId)

5. SERVICE
   └─ Calls validation.todoOwnershipVerification()
   
6. VALIDATION
   └─ Fetches todo from DB by todoId
   └─ Checks if todo.userId === userId
   └─ If NO match → Throws 403 Unauthorized
   └─ If match → Returns todo

7. SERVICE CONTINUES (if authorized)
   └─ Calls repository.deleteTodoById(todoId)
   └─ MongoDB removes document
   └─ Returns deleted todo

8. RESPONSE SENT
   └─ Status: 200 OK
   └─ Body: { success, data: deletedTodo }

9. CLIENT RECEIVES
   └─ Todo deleted successfully
```

---

## 🎨 Code Examples

### Example 1: Complete Create Todo Flow

**Controller:**
```typescript
createTodo: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
    const req = request as ITodoAuthRequest & ICreateTodo
    const { body } = req
    const userId = req.authenticatedUser._id  // From authenticate middleware
    
    // Validate input
    const { error, payload } = validateSchema<ICreateTodoRequest>(createTodoSchema, body)
    if (error) return httpError(next, error, request, 422)
    
    // Call service
    const result = await createTodoService(payload, userId)
    httpResponse(response, request, 201, responseMessage.SUCCESS, result)
})
```

**Service:**
```typescript
export const createTodoService = async (payload: ICreateTodoRequest, userId: string) => {
    const { title, description, priority = 'medium', dueDate } = payload
    
    const todoObj: ITodo = {
        title,
        description: description || undefined,
        status: ETodoStatus.PENDING,
        priority: (priority as 'low' | 'medium' | 'high') || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
    }
    
    const newTodo = await query.createTodo(todoObj)
    return { success: true, data: newTodo }
}
```

**Repository:**
```typescript
createTodo: (payload: ITodo) => {
    return todoModel.create(payload)  // MongoDB saves to DB
}
```

### Example 2: Delete with Authorization

**Controller Initiates Delete:**
```typescript
deleteTodo: asyncHandler(async (request, response, next) => {
    const req = request as ITodoAuthRequest & IDeleteTodo
    const todoId = req.params.id
    const userId = req.authenticatedUser._id
    
    const result = await deleteTodoService(todoId, userId)
    httpResponse(response, request, 200, responseMessage.SUCCESS, result)
})
```

**Service Calls Validator:**
```typescript
export const deleteTodoService = async (todoId: string, userId: string) => {
    // This will throw 403 if userId doesn't match todo owner
    await validate.todoOwnershipVerification(todoId, userId)
    
    const deletedTodo = await query.deleteTodoById(todoId)
    return { success: true, message: responseMessage.SUCCESS, data: deletedTodo }
}
```

**Validator Checks Ownership:**
```typescript
todoOwnershipVerification: async (todoId: string, userId: string) => {
    const todo = await query.getTodoById(todoId)
    if (!todo) throw new CustomError('Todo not found', 404)
    
    // Convert both to strings for comparison
    if (todo.userId.toString() !== userId.toString()) {
        throw new CustomError('Unauthorized', 403)
    }
    return todo
}
```

---

## 📤 Curl Commands

### 1. Register User
```bash
curl -X POST http://localhost:3000/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "12125551234",
    "password": "Secure@123"
  }'
```

### 2. Confirm Registration
```bash
curl -X PATCH "http://localhost:3000/v1/registeration/confirm/{token}?code={OTP}" \
  -H "Content-Type: application/json"
```

### 3. Login
```bash
curl -X POST http://localhost:3000/v1/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "Secure@123"
  }'
```

### 4. Create Todo
```bash
curl -X POST http://localhost:3000/v1/todo \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "dueDate": "2026-03-15"
  }'
```

### 5. Get All Todos
```bash
curl -X GET "http://localhost:3000/v1/todo?status=pending&priority=high&page=1&limit=10" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### 6. Get Specific Todo
```bash
curl -X GET http://localhost:3000/v1/todo/{todoId} \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### 7. Update Todo
```bash
curl -X PUT http://localhost:3000/v1/todo/{todoId} \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "in_progress",
    "priority": "medium"
  }'
```

### 8. Mark Todo Complete
```bash
curl -X PATCH http://localhost:3000/v1/todo/{todoId}/complete \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### 9. Delete Todo
```bash
curl -X DELETE http://localhost:3000/v1/todo/{todoId} \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 📊 Summary

| Feature | Status | Details |
|---------|--------|---------|
| Authentication | ✅ | JWT-based via cookies |
| Authorization | ✅ | Ownership verification on all ops |
| Validation | ✅ | Joi schemas + custom validators |
| Error Handling | ✅ | Comprehensive with proper status codes |
| Pagination | ✅ | Page/limit support |
| Filtering | ✅ | Status & priority filters |
| Rate Limiting | ✅ | Applied on write operations |
| Timestamps | ✅ | createdAt & updatedAt |
| Type Safety | ✅ | Full TypeScript coverage |
| Database | ✅ | MongoDB with Mongoose |

---

## 🚀 Performance Considerations

1. **Indexing:** userId is indexed for fast queries
2. **Pagination:** Prevents loading large datasets
3. **Rate Limiting:** Protects against abuse
4. **Lazy Loading:** Only fetches required fields
5. **Query Optimization:** Direct DB queries vs N+1

---

## 🔮 Future Enhancements

- [ ] Recurring todos
- [ ] Todo reminders/notifications
- [ ] Collaborative todos (share with other users)
- [ ] Todo categories/tags
- [ ] Statistics/analytics dashboard
- [ ] Export todos (PDF/CSV)
- [ ] Webhook support
- [ ] WebSocket real-time updates

---

**Generated:** March 9, 2026
**API Version:** 1.0
**Framework:** Express.js + TypeScript + MongoDB
