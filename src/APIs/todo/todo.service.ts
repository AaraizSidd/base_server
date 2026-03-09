import responseMessage from '../../constant/responseMessage' // Predefined response messages (like SUCCESS, ERROR)
import { CustomError } from '../../utils/errors' // Custom error class for throwing errors with status codes
import { ICreateTodoRequest, IUpdateTodoRequest, ETodoStatus, ITodo } from './types/todo.interface' // TypeScript interfaces & enums
import query from './repo/todo.repository' // DB repository functions (CRUD operations)
import validate from './validation/validations' // Validation functions (like ownership verification)

// ---------------- CREATE TODO SERVICE ----------------
export const createTodoService = async (payload: ICreateTodoRequest, userId: string) => {
    const { title, description, priority = 'medium', dueDate } = payload

    // Construct a new Todo object
    const todoObj: ITodo = {
        title, // Todo title
        description: description || undefined, // Optional description
        status: ETodoStatus.PENDING, // Default status is PENDING
        priority: (priority as 'low' | 'medium' | 'high') || 'medium', // Default priority medium
        dueDate: dueDate ? new Date(dueDate) : null, // Convert dueDate string to Date object or null
        userId, // Associate Todo with user
        createdAt: new Date(), // Timestamp
        updatedAt: new Date() // Timestamp
    }

    // Save the new Todo in DB
    const newTodo = await query.createTodo(todoObj)

    // Return success response
    return {
        success: true,
        data: newTodo
    }
}

// ---------------- GET SINGLE TODO SERVICE ----------------
export const getTodoService = async (todoId: string, userId: string) => {
    // Check if this user owns the Todo (throws error if not)
    const todo = await validate.todoOwnershipVerification(todoId, userId)
    
    return {
        success: true,
        data: todo
    }
}

// ---------------- GET ALL TODOS SERVICE WITH PAGINATION ----------------
export const getTodosService = async (userId: string, queryParams: { status?: ETodoStatus; priority?: string; page?: string; limit?: string } = {}) => {
    const page = parseInt(queryParams.page || '1', 10) // Default page = 1
    const limit = parseInt(queryParams.limit || '10', 10) // Default limit = 10

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
        throw new CustomError('Invalid pagination parameters', 422)
    }

    // Fetch todos from DB with filters and pagination
    const todos = await query.getTodosByUserId(userId, {
        status: queryParams.status,
        priority: queryParams.priority,
        page,
        limit
    })

    // Fetch total count for pagination info
    const total = await query.getTodoCountByUserId(userId, {
        status: queryParams.status,
        priority: queryParams.priority
    })

    return {
        success: true,
        data: todos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit) // Total pages
        }
    }
}

// ---------------- UPDATE TODO SERVICE ----------------
export const updateTodoService = async (todoId: string, userId: string, payload: IUpdateTodoRequest) => {
    // Verify ownership
    await validate.todoOwnershipVerification(todoId, userId)

    const updateData: Partial<ITodo> = {
        updatedAt: new Date() // Always update timestamp
    }

    // Update only fields that are provided
    if (payload.title !== undefined) updateData.title = payload.title
    if (payload.description !== undefined) updateData.description = payload.description || undefined
    if (payload.status !== undefined) updateData.status = payload.status
    if (payload.priority !== undefined) updateData.priority = payload.priority as 'low' | 'medium' | 'high'
    if (payload.dueDate !== undefined) updateData.dueDate = payload.dueDate ? new Date(payload.dueDate) : null

    // Update the Todo in DB
    const updatedTodo = await query.updateTodoById(todoId, updateData)

    return {
        success: true,
        data: updatedTodo
    }
}

// ---------------- DELETE TODO SERVICE ----------------
export const deleteTodoService = async (todoId: string, userId: string) => {
    // Verify ownership
    await validate.todoOwnershipVerification(todoId, userId)

    // Delete from DB
    const deletedTodo = await query.deleteTodoById(todoId)

    return {
        success: true,
        message: responseMessage.SUCCESS,
        data: deletedTodo
    }
}

// ---------------- MARK TODO AS COMPLETE SERVICE ----------------
export const markTodoCompleteService = async (todoId: string, userId: string) => {
    // Verify ownership
    await validate.todoOwnershipVerification(todoId, userId)

    // Update status to COMPLETED
    const updatedTodo = await query.updateTodoById(todoId, {
        status: ETodoStatus.COMPLETED,
        updatedAt: new Date()
    })

    return {
        success: true,
        data: updatedTodo
    }
}