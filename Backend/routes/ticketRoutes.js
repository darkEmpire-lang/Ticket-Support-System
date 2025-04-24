import express from "express";
import {
  createTicket,
  getAllTickets,
  getUserTickets,
  replyTicket,
  deleteTicket,
  updateTicket
} from "../controllers/ticketController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/create", authUser, upload.single("image"), createTicket);
router.get("/all", getAllTickets); // Admin can protect this route if needed
router.get("/user", authUser, getUserTickets);
router.post("/reply", replyTicket);
router.delete("/delete/:ticketId", authUser, deleteTicket);
router.put("/update/:ticketId", authUser, updateTicket);

export default router;
