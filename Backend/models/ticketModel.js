import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  productCategory: { type: String, required: true },
  product: { type: String, required: true },
  subject: { type: String, required: true },
  inquiry: { type: String, required: true },
  image: { type: String }, // Cloudinary URL
  replies: [
    {
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
