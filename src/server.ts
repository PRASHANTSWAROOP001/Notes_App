import express, {Request, Response} from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import cookie from "cookie-parser"
import logger from "./utils/logger"

import authRouter from './router/authRoute'

import noteRouter from "./router/noteRoute";

import verifyRequest from "./utils/authMiddleware"


dotenv.config();
const PORT = process.env.PORT;
const app = express();


app.use(express.json());
app.use(helmet());
app.use(cors())
app.use(cookie())

app.listen(PORT, ()=>{
    logger.info(`App started listen in port: ${PORT}`);
})

app.use("/health", (req:Request, res:Response)=>{

    console.log(req.body);
    res.json({
        success:true,
        message:"Server is up and running."
    })
})


app.use("/api/auth", authRouter);

app.use("/api/note",verifyRequest,noteRouter)