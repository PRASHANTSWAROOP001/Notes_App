import logger from "./logger";
import {Response} from "express";
import {ZodError} from "zod";
import {Prisma} from "@prisma/client";

const handleZod_PrismaError = (res:Response, error:unknown):void=>{

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`Prisma error: ${error.message}`);
         res.status(500).json({
            success: false,
            message: 'Database error happened. Please try again.',
        });
         return;
    }

    if (error instanceof ZodError) {
        logger.error(`Validation error: ${error.message}`);
        res.status(400).json({
            success: false,
            message: 'Validation error occurred.',
            error: error.errors,
        });
        return;
    }

    logger.error(`Unknown error: ${error}`);
    res.status(500).json({
        success: false,
        message
            : 'An unknown error occurred on our side.',
    });

}


const handlePrismaError= (res:Response, error:unknown):void=>{
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`Prisma error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Database error happened. Please try again.',
        });
        return;
    }
    logger.error(`Unknown error: ${error}`);
    res.status(500).json({
        success: false,
        message
            : 'An unknown error occurred on our side.',
    });

}


export {handleZod_PrismaError, handlePrismaError}