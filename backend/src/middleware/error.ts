// src/middleware/error.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware.
 * Catches errors thrown in request processing and sends a generic 500 response.
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Caught by error middleware:", err.stack);

    // Only send a response if headers haven't been sent yet
    if (!res.headersSent) {
        res.status(500).send('Something broke!');
    }
};

export default errorHandler;

