import mongoose from "mongoose";

const messagesColeccion = "messages";
const messagesEsquema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    message: { type: String }
  },
  {
    timestamps: true,
    strict: true
  }
);

export const messagesModelo = mongoose.model(
  messagesColeccion,
  messagesEsquema
);
