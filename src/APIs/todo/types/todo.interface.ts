export enum ETodoStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

export interface ITodo {
    title: string
    description?: string
    status: ETodoStatus
    priority?: 'low' | 'medium' | 'high'
    dueDate?: Date | null
    userId: string
    createdAt: Date
    updatedAt: Date
}

export interface ITodoWithId extends ITodo {
    _id: string
}

export interface ICreateTodoRequest {
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string
}

export interface IUpdateTodoRequest {
    title?: string
    description?: string
    status?: ETodoStatus
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string | null
}

export interface ICreateTodo {
    body: ICreateTodoRequest
}

export interface IUpdateTodo {
    params: {
        id: string
    }
    body: IUpdateTodoRequest
}

export interface IDeleteTodo {
    params: {
        id: string
    }
}

export interface IGetTodo {
    params: {
        id: string
    }
}

export interface ITodoListQuery {
    status?: ETodoStatus
    priority?: string
    page?: string
    limit?: string
}
