import { Router } from "express";
import { deleteNotes, addNotes, getAllNotes, getOneNote, updateNotes } from "../controller/notesController";


const router = Router();

router.post("/add-notes", addNotes);
router.get("/getAll-note", getAllNotes);
router.get("/getNote/:id", getOneNote);
router.delete("/delete-note/:id", deleteNotes);
router.put("/update-note",updateNotes);

export default router;
