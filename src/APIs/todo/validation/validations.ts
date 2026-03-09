import responseMessage from '../../../constant/responseMessage'
import { CustomError } from '../../../utils/errors'
import query from '../repo/todo.repository'

export default {
    todoExists: async (todoId: string) => {
        const todo = await query.getTodoById(todoId)
        if (!todo) {
            throw new CustomError(responseMessage.NOT_FOUND('Todo'), 404)
        }
        return todo
    },

    todoOwnershipVerification: async (todoId: string, userId: string) => {
        const todo = await query.getTodoById(todoId)
        if (!todo) {
            throw new CustomError(responseMessage.NOT_FOUND('Todo'), 404)
        }
        console.log('Verifying ownership for todo:', todo.userId, 'User ID:', userId) // Debug log
        if (todo.userId.toString() !== userId.toString()) {
            throw new CustomError(responseMessage.UNAUTHORIZED, 403)
        }
        return todo
    }
}
