import { Request, Response } from "express";
import validateWithSchema from "../utils/validation";
import z from "zod"
import { PrismaClient, User, RefreshToken, Prisma} from "@prisma/client";
import logger from "../utils/logger";
import {handleZod_PrismaError, handlePrismaError} from "../utils/erroHandler";
import {hashPassword, verifyPassword} from "../utils/jwtUtils";
import jwt from "jsonwebtoken"

import dotenv from "dotenv";

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET!;

const NODE_ENV = process.env.NODE_ENV!;

const prisma = new PrismaClient();

const userSchema = z.object({
    name:z.string().min(3,"name must be greater than three letters"),
    email:z.string().email(),
    password:z.string().min(6,"password must be at least 6 characters long"),
})


const userLoginSchema =z.object({
    email:z.string().email(),
    password:z.string().min(6,"password must be at least 6 characters long"),
})


const createUser = async(req:Request, res:Response):Promise<void>=>{
    logger.info("create user endpoint is hit")
    try {
        const validatedUserData = validateWithSchema(userSchema, req.body);

        
        const searchUser = await prisma.user.findUnique({
            where:{
                email:validatedUserData.email
            }
        })

        if(searchUser){
            res.status(403).json({
                success:false,
                message:"email already exists"
            })
            return;
        }

        const userHashedPw = await hashPassword(validatedUserData.password);


       const newUser = await prisma.user.create({
           data:{
               ...validatedUserData,
               password:userHashedPw

           }
       })

        res.status(200).json({
            success:true,
            message:"account created successfully",
            id:newUser.id
        })


    } 
    catch (error:unknown) {
        handleZod_PrismaError(res,error);
}
}

const loginUser = async(req:Request, res:Response):Promise<void>=>{
    logger.info("login user endpoint is hit")
    try {
        const validatedUserData = validateWithSchema(userLoginSchema, req.body);

        const searchUser = await prisma.user.findUnique({where:{
            email:validatedUserData.email
            }})

        if(!searchUser){
            res.status(403).json({
                success:false,
                message:"email does not exists"
            })
            return;
        }

        const comparePassword = await verifyPassword(validatedUserData.password, searchUser.password)

        if(!comparePassword){
            res.status(403).json({
                success:false,
                message:"invalid credentials"
            })
            return;
        }

        const {accessToken, refreshToken} = await generateTokens(searchUser)

            res.cookie("refreshToken", refreshToken.id, {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
     })


        res.status(200).json({
            success:true,
            accessToken
        })


    }
    catch (error:unknown) {

        handleZod_PrismaError(res, error);

    }
}


const generateTokens = async (userDetails: User): Promise<{ accessToken: string; refreshToken: RefreshToken }> => {
    try {
        const accessToken = jwt.sign(
            {
                userId: userDetails.id,
                email: userDetails.email,
            },
            JWT_SECRET,
            { algorithm: "HS256", expiresIn: "15m" }
        );

        const refreshToken = await prisma.refreshToken.create({
            data: {
                userId: userDetails.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error: unknown) {
        logger.error(`Error while creating tokens: ${error}`);
        throw new Error(`Error while creating tokens: ${error}`);
    }
};


const logoutUser = async(req:Request, res:Response)=>{
    logger.info("logout endpoint is hit.")
    try {

            const refreshToken:string|undefined = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "No refresh cookie could be found"
      })
      logger.warn("trying to logout without the refreshToken cookie.")
      return;
    }

    const validateRefreshToken = await prisma.refreshToken.findUnique({
      where: {
        id: refreshToken
      }
    })

    if (!validateRefreshToken) {
      res.status(400).json({
        success: false,
        message: "Invalid refresh token!"
      })
      logger.warn("Invalid Refresh token provided by user")
      return;
    }
    else if (validateRefreshToken.revoked == true || validateRefreshToken.expiresAt <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Expired or already used refresh tokens"
      })
      logger.error("Expired/Used refreshToken provided by user.")
      return;
    }

    const updateRefreshToken = await prisma.refreshToken.update({
        where:{
            id:refreshToken
        },
        data:{
            revoked:true
        }
    })

    res.clearCookie("refreshToken");

    res.json({
        success:true,
        message:"logged out successfully"
    })

    } catch (error) {
        handlePrismaError(res, error)
    }
}


export {createUser, loginUser, logoutUser}
