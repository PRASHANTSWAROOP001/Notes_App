import logger from "../utils/logger";
import z from "zod"
import validateWithSchema from "../utils/validation";
import { handlePrismaError,handleZod_PrismaError } from "../utils/erroHandler";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

interface verifiedRequest extends Request{
    userId?:string
}

const notesSchema = z.object({
    title:z.string().min(5),
    content:z.string().min(5)
})



const notesUpdateSchema = z.object({
    id:z.string(),
    title:z.string().min(5),
    content:z.string().min(5)
})


const addNotes = async (req:verifiedRequest, res:Response):Promise<void>=>{
    logger.info("add notes endpoint is hit.")
    try {

        const validateNotesData = validateWithSchema(notesSchema, req.body);

        const userId = req.userId;

        if(!userId){
            res.status(403).json({
                success:false,
                message:"make verified requests/login."
            })
            return;
        }

        const addedNotesData = await prisma.note.create({
            data:{
                userId:userId,
                ...validateNotesData
            }
        })

        res.json({
            success:true,
            data: addedNotesData
        })
        
    } catch (error) {
        handleZod_PrismaError(res, error);
    }
}


const deleteNotes = async (req:verifiedRequest, res:Response)=>{
    try {
        
        const notesId:string|undefined = req.params.id;
        const userId = req.userId;
        if(!notesId){
            logger.warn("missing params to delete");
            res.status(401).json({
                success:false,
                message:"missing params. Invalid request"
            })
        }

        const search_validate = await prisma.note.findUnique({
            where:{
                id:notesId,
                userId:userId
            }
        })

        if(!search_validate){
            res.status(403).json({
                success:false,
                message:"could not find notes or either notes does not belong to user"
            })
        }

        const deletedData = await prisma.note.delete({
            where:{
                id:notesId
            }
        })

        res.json({
            success:true,
            data:deletedData
        })

    } catch (error) {

        handlePrismaError(res,error)
        
    }
}


const getAllNotes = async(req:verifiedRequest,res:Response)=>{
    logger.info("get all endpoint is hit");
    
    try {

        const userId = req.userId;

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10

        const paginateResponse = await prisma.note.findMany({

            where:{
                userId:userId
            },
            skip:(page -1)*pageSize,
            take:pageSize,
            orderBy:{"createdAt":"desc"}
        })

        const totalNotes = await prisma.note.count({
            where:{
                userId:userId
            }
        })

        res.json({
            success:true,
            data:paginateResponse,
            pagination:{
                page,
                pageSize,
                totalNotes,
                totalPages: Math.ceil(totalNotes/pageSize)
            }

        })


    } catch (error) {

        handlePrismaError(res,error)
        
    }
}


const getOneNote = async(req:Request, res:Response)=>{
    try {
        
        const noteId:string|undefined = req.params.id;

        if(!noteId){
            logger.warn("missing params to delete");
            res.status(401).json({
                success:false,
                message:"missing params. Invalid request"
            })
            return;
        }
        const note = await prisma.note.findUnique({
            where:{
                id:noteId
            }
        })

        res.json({
            success:true,
            data:note
        })

    } catch (error) {

        handlePrismaError(res, error)
        
    }
}

const updateNotes = async (req: verifiedRequest, res: Response) => {
    logger.info("update note endpoint hit.")
  try {
    // Step 1: Validate incoming data
    console.log("req.body", req.body);
    
    const validatedData = validateWithSchema(notesUpdateSchema, req.body);
    const { id, title, content } = validatedData;
    const userId = req.userId;

    // Step 2: Check if the note exists and belongs to the user
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      res.status(404).json({ success: false, message: "Note not found." });
      return;
    }

    if (existingNote.userId !== userId) {
       res.status(403).json({ success: false, message: "You do not own this note." });
       return
    }

  
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    res.status(200).json({ success: true, data: updatedNote });

  } catch (error: unknown) {
    handleZod_PrismaError(res, error);
  }
};


export {addNotes, deleteNotes, getAllNotes, getOneNote, updateNotes}