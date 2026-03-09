import Joi from 'joi'
import { ICreateTodoRequest, IUpdateTodoRequest } from '../types/todo.interface'

export const createTodoSchema = Joi.object<ICreateTodoRequest>({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional().allow(null, ''),
    priority: Joi.string().valid('low', 'medium', 'high').optional().default('medium'),
    dueDate: Joi.date().iso().optional().allow(null)
})

export const updateTodoSchema = Joi.object<IUpdateTodoRequest>({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).optional().allow(null, ''),
    status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    dueDate: Joi.date().iso().optional().allow(null)
})
