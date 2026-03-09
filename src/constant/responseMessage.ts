export default {
    SUCCESS: `Operation is completed`,
    SOMETHING_WENT_WRONG: `Something went wrong!`,
    NOT_FOUND: (entity: string) => `${entity} is not found`,
    TOO_MANY_REQUESTS: `So many requests`,
    UNAUTHORIZED: 'You are not allowed to perform this task',

    auth: {
        ALREADY_EXISTS: (entity: string, identifier: string) => `${identifier} already exists for the ${entity}`,
        ALREADY_CONFIRMED: (entity: string) => `${entity} already CONFIRMED`,
        INVALID_PHONE_NUMBER: `Invalid phone number`,
        USER_REGISTERED: `Account has been created successfully.`,
        USER_NOT_EXIST: `Account does not exist`,
        INVALID_EMAIL_OR_PASSWORD: `Invalid email or password`,
        LOGIN_SUCCESSFUL: `Login successful`
    },

    todo: {
        TODO_CREATED: `Todo has been created successfully.`,
        TODO_UPDATED: `Todo has been updated successfully.`,
        TODO_DELETED: `Todo has been deleted successfully.`,
        TODO_COMPLETED: `Todo has been marked as completed.`,
        TODO_NOT_FOUND: `Todo does not exist`,
        INVALID_TODO_ID: `Invalid todo ID`
    }
}
