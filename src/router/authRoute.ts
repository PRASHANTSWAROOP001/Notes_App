import { Router } from "express";
import { createUser,loginUser, logoutUser } from "../controller/authController";

const router = Router();


router.post("/create-user", createUser);
router.post("/login", loginUser)
router.post("/logout", logoutUser)

export default router;