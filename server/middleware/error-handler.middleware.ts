
import type { NextFunction, Request, Response } from "express"
import { ApiError, NotFoundError } from "../utils/api-error.js";

export const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if (err) {
        let message = err.message


        if (err instanceof ApiError) {
            if (err.isOperational) {
                res.status(err.status).json({ success: false, message: err.message, data: null });
            } else {
                console.log(`${new Date()} \n - ${message}}`)


                res.status(err.status).json({
                    success: false,
                    message: message,
                    data: null,
                    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),

                });
            }

            return;

        } else {
            console.log(`${new Date()} \n - ${message}}`)
       
            //process exit // terriablly wrong with flow need restart
        }
        res.status(500).json({
            success: false,
            message: err.message,
        });
        return
    } else {
        next();
    }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    console.log("Route not found:", {
        path: req.path,
        method: req.method,
    });
    next(new NotFoundError("Route not found"));
};