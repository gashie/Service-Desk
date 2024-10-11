const { logger } = require("../logs/winston");
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for development
    console.log(err);

    // Extract application-specific file and line number from the stack trace
    const appStackLine = err.stack
        ? err.stack.split('\n').find(line => !line.includes('node_modules') && line.includes(process.cwd()))
        : null;
    const fileName = appStackLine ? appStackLine.match(/\((.*):\d+:\d+\)/)?.[1] : 'Unknown File';
    const lineNumber = appStackLine ? appStackLine.match(/:(\d+):\d+\)/)?.[1] : 'Unknown Line';

    // Database and other specific error handling
    if (err.code === '23505') {
        const message = `Duplicate entry found in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }
    if (err.code === '22P02') {
        const message = `Invalid uuid in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }
    if (err.code === '22007') {
        const message = `Invalid date/timestamp in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }
    if (err.type === "entity.parse.failed") {
        const message = `Sorry, Invalid Json Fields`;
        error = new ErrorResponse(message, 404);
        logger.error(error);
    }
    if (err.code === "ER_DBACCESS_DENIED_ERROR") {
        const message = `Db Access Denied`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }
    if (err.code === "ER_BAD_FIELD_ERROR") {
        const message = `Unknown column in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }
    if (err.code === "ER_TABLE_EXISTS_ERROR") {
        const message = `Table already exist`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }
    if (err.code === "ER_NO_SUCH_TABLE") {
        const message = `Unknown table in request`;
        error = new ErrorResponse(message, 404);
        logger.error(error.code);
    }
    if (err.code === "EHOSTUNREACH") {
        logger.error(error.code);
        const message = `Server Failed to connect`;
        return res.status(500).json({
            status: 0,
            message: message,
        });
    }
    if (err.code === "ENOTFOUND") {
        logger.error(error.code);
        const message = `Server Failed to connect db url ${err.hostname}`;
        return res.status(500).json({
            status: 0,
            message: message,
        });
    }
    if (err.code === "42P01") {
        logger.error(error.code);
        const message = `Table does not exist, please check and try again`;
        return res.status(500).json({
            status: 0,
            message: message,
        });
    }

    // Enhanced logging for errors with file and line numbers
    // logger.error({
    //     message: error.message,
    //     file_name: fileName,  // Log file where the error originated
    //     line_number: lineNumber,  // Log line number where the error originated
    //     stack_trace: err.stack,  // Full stack trace for detailed debugging
    // });

    // Return a generic error response to the client
    res.status(error.statusCode || 500).json({
        status: 0,
        message: error.message || "Server Error",
    });
};

module.exports = errorHandler;
