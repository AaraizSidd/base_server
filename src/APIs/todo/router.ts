import { Router } from 'express'
import todoController from './todo.controller'
import authenticate from '../../middlewares/authenticate'
import rateLimiter from '../../middlewares/rateLimiter'

const router = Router()

// All todo routes require authentication
router.use(authenticate)

// Create a new todo
router.route('/').post(rateLimiter, todoController.createTodo)

// Get all todos for authenticated user
router.route('/').get(todoController.getTodos)

// Get a specific todo
router.route('/:id').get(todoController.getTodo)

// Update a todo
router.route('/:id').put(rateLimiter, todoController.updateTodo)

// Delete a todo
router.route('/:id').delete(rateLimiter, todoController.deleteTodo)

// Mark a todo as complete
router.route('/:id/complete').patch(rateLimiter, todoController.markTodoComplete)

export default router
