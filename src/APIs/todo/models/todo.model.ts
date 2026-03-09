import mongoose from 'mongoose'
import { ITodo, ETodoStatus } from '../types/todo.interface'

const todoSchema = new mongoose.Schema<ITodo>(
    {
        title: {
            type: String,
            minlength: 3,
            maxlength: 255,
            required: true
        },
        description: {
            type: String,
            maxlength: 1000,
            default: null
        },
        status: {
            type: String,
            enum: Object.values(ETodoStatus),
            default: ETodoStatus.PENDING,
            required: true
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        dueDate: {
            type: Date,
            default: null
        },
        userId: {
            type: String,
            required: true,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'todos'
    }
)

const todoModel = mongoose.model<ITodo>('Todo', todoSchema)

export default todoModel
