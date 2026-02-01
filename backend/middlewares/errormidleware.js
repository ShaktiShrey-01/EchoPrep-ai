// Global error handler: normalizes unknown errors into ApiError
// and returns a consistent JSON shape to the client.
import { ApiError } from "../utils/apierror.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // If the error isn't an instance of our custom ApiError, wrap it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Explicitly construct the response object
    // (Standard Error properties like 'message' are not enumerable in JSON by default)
    const response = {
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors || []
    };

    // Send the JSON response
    return res.status(error.statusCode).json(response);
};

export { errorHandler };