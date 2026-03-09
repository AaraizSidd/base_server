import { NextFunction, Request, Response } from 'express' // Express ke request, response aur next types
import httpResponse from '../../handlers/httpResponse' // Standard response bhejne ka helper
import responseMessage from '../../constant/responseMessage' // Response messages constants
import httpError from '../../handlers/errorHandler/httpError' // Error handle karne ka function
import asyncHandler from '../../handlers/async' // Async errors ko automatically catch karta hai
import { CustomError } from '../../utils/errors' // Custom error class
import { validateSchema } from '../../utils/joi-validate' // Joi validation helper
import { createTodoSchema, updateTodoSchema } from './validation/validation.schema' // Todo validation schemas

// Service functions jo actual business logic run karte hain
import {
    createTodoService,
    getTodoService,
    getTodosService,
    updateTodoService,
    deleteTodoService,
    markTodoCompleteService
} from './todo.service'

// Todo related interfaces (TypeScript types)
import { ICreateTodo, IUpdateTodo, IDeleteTodo, IGetTodo, ITodoListQuery, ICreateTodoRequest, IUpdateTodoRequest } from './types/todo.interface'

// Authenticated user ka interface
import { IUserWithId } from '../user/_shared/types/users.interface'

// Request ko extend kar rahe hain taake authenticatedUser mil sake
interface ITodoAuthRequest extends Request {
    authenticatedUser: IUserWithId
}

export default {

    // =========================
    // CREATE TODO
    // =========================
    createTodo: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {

            // Request ko type cast kar rahe hain taake authenticated User access ho
            const req = request as ITodoAuthRequest & ICreateTodo

            const { body } = req // request body se data le rahe hain

            // Logged in user ka ID nikal rahe hain
            const userId = req.authenticatedUser._id

            // Body ko validation schema ke against check kar rahe hain
            const { error, payload } = validateSchema<ICreateTodoRequest>(createTodoSchema, body)

            // Agar validation error aaye
            if (error) {
                return httpError(next, error, request, 422)
            }

            // Service ko call kar rahe hain todo create karne ke liye
            const result = await createTodoService(payload, userId)

            // Success response bhej rahe hain
            httpResponse(response, request, 201, responseMessage.SUCCESS, result)

        } catch (error) {

            // Agar custom error hai
            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                // Unknown error
                httpError(next, error, request, 500)
            }
        }
    }),

    // =========================
    // GET SINGLE TODO
    // =========================
    getTodo: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {

            const req = request as ITodoAuthRequest & IGetTodo

            const { params } = req
            const { id } = params // URL params se todo id le rahe hain

            const userId = req.authenticatedUser._id // logged in user id

            // Service ko call kar rahe hain todo fetch karne ke liye
            const result = await getTodoService(id, userId)

            // Response bhej rahe hain
            httpResponse(response, request, 200, responseMessage.SUCCESS, result)

        } catch (error) {

            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    }),

    // =========================
    // GET ALL TODOS
    // =========================
    getTodos: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {

            const req = request as ITodoAuthRequest

            const userId = req.authenticatedUser._id // current user id

            const query = req.query as ITodoListQuery // query params (page, status, priority etc)

            // Service call karke todos fetch kar rahe hain
            const result = await getTodosService(userId, query)

            // Response bhej rahe hain
            httpResponse(response, request, 200, responseMessage.SUCCESS, result)

        } catch (error) {

            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    }),

    // =========================
    // UPDATE TODO
    // =========================
    updateTodo: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {

            const req = request as ITodoAuthRequest & IUpdateTodo

            const { params, body } = req
            const { id } = params // todo id

            const userId = req.authenticatedUser._id // user id

            // Update payload ko validate kar rahe hain
            const { error, payload } = validateSchema<IUpdateTodoRequest>(updateTodoSchema, body)

            if (error) {
                return httpError(next, error, request, 422)
            }

            // Service ko call kar rahe hain todo update karne ke liye
            const result = await updateTodoService(id, userId, payload)

            // Response bhej rahe hain
            httpResponse(response, request, 200, responseMessage.SUCCESS, result)

        } catch (error) {

            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    }),

    // =========================
    // DELETE TODO
    // =========================
    deleteTodo: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {

            const req = request as ITodoAuthRequest & IDeleteTodo

            const { params } = req
            const { id } = params // delete karne wala todo id

            // Debug logs (testing ke liye)
            console.log('Deleting todo with ID:', id)

            const userId = req.authenticatedUser._id

            console.log('Authenticated user ID:', userId)

            // Service ko call kar rahe hain delete ke liye
            const result = await deleteTodoService(id, userId)

            // Success response
            httpResponse(response, request, 200, responseMessage.SUCCESS, result)

        } catch (error) {

            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    }),

    // =========================
    // MARK TODO COMPLETE
    // =========================
    markTodoComplete: asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        try {

            const req = request as ITodoAuthRequest & IGetTodo

            const { params } = req
            const { id } = params // todo id

            const userId = req.authenticatedUser._id

            // Service call jo todo ko complete mark karegi
            const result = await markTodoCompleteService(id, userId)

            // Response bhejna
            httpResponse(response, request, 200, responseMessage.SUCCESS, result)

        } catch (error) {

            if (error instanceof CustomError) {
                httpError(next, error, request, error.statusCode)
            } else {
                httpError(next, error, request, 500)
            }
        }
    })
}