import todoModel from '../models/todo.model'
import { ITodo, ETodoStatus } from '../types/todo.interface'

export default {
    createTodo: (payload: ITodo) => {
        return todoModel.create(payload)
    },

    getTodoById: (id: string) => {
        return todoModel.findById(id)
    },

    getTodosByUserId: (userId: string, query: { status?: ETodoStatus; priority?: string; page?: number; limit?: number } = {}) => {
        const { status, priority, page = 1, limit = 10 } = query
        const skip = (page - 1) * limit

        let filter: any = { userId }

        if (status) {
            filter.status = status
        }
        if (priority) {
            filter.priority = priority
        }

        return todoModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })
    },

    getTodoCountByUserId: (userId: string, query: { status?: ETodoStatus; priority?: string } = {}) => {
        const { status, priority } = query
        let filter: any = { userId }

        if (status) {
            filter.status = status
        }
        if (priority) {
            filter.priority = priority
        }

        return todoModel.countDocuments(filter)
    },

    updateTodoById: (id: string, payload: Partial<ITodo>) => {
        return todoModel.findByIdAndUpdate(id, payload, { new: true })
    },

    deleteTodoById: (id: string) => {
        return todoModel.findByIdAndDelete(id)
    },

    deleteAllTodosByUserId: (userId: string) => {
        return todoModel.deleteMany({ userId })
    }
}
