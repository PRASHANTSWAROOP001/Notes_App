import { Request, Response,  NextFunction } from "express";
import jwt, {JwtPayload} from "jsonwebtoken"
import logger from "./logger"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET:string = process.env.JWT_SECRET!;


interface JwtUserPayload extends JwtPayload {
    userId: string;
    email: string;
}

interface verifiedRequest extends Request{
    userId?:string
}



const verifyRequest = async(req:verifiedRequest, res:Response, next:NextFunction):Promise<void>=>{
    try {

        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            logger.warn("Missing auth token");
            res.status(401).json({
                success: false,
                message: "Auth token is missing"
            });
            return;
        }

        const verifiedToken = jwt.verify(token, JWT_SECRET) as JwtUserPayload;

        req.userId = verifiedToken.userId

        next()

    } catch (error:any) {
        
          logger.error("Token verification failed", error);
         res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
        });
        return;


    }
}

export default verifyRequest;