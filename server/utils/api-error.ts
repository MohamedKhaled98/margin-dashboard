
const STATUS_CODES = {
    NOT_FOUND: 404,
    UN_AUTHORIZED: 401,
    FORBIDDEN: 403,
    BAD_REQUEST: 400,
    INTERNAL_ERROR: 500,
    CONFLICT: 409
} as const;

type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES]

export class ApiError extends Error {
    status: StatusCode;
    override message: string;
    isOperational: boolean;
    constructor(statusCode: StatusCode, message: string, isOperational: boolean = false) {
        super(message);
        this.status = statusCode;
        this.message = message;
        this.isOperational = isOperational;
    }
}

export class BadRequest extends ApiError {
    constructor(message: string) {
        super(STATUS_CODES.BAD_REQUEST, message, true)
    }
}
export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(STATUS_CODES.NOT_FOUND, message, true)
    }
}
export class ForbiddenError extends ApiError {
    constructor(message: string) {
        super(STATUS_CODES.FORBIDDEN, message, true)
    }
}
export class ConflictError extends ApiError {
    constructor(message: string) {
        super(STATUS_CODES.CONFLICT, message, true)
    }
}
export class UnAuthorizedError extends ApiError {
    constructor(message: string = "Unauthorized") {
        super(STATUS_CODES.UN_AUTHORIZED, message, true)
    }
}