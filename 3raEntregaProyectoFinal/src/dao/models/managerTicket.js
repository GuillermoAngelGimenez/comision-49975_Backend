import mongoose from "mongoose";

export const usuariosModelo = mongoose.model(
  "usuarios", 
  new mongoose.Schema(
    {
      code: { 
        type: String, 
        required: true, 
        unique: true 
      },
      purchase_datetime: { 
        type: Date, 
        default: Date.now 
      },
      amount: { 
        type: Number, 
        required: true 
      },
      purchaser: { 
        type: String, 
        required: true 
      },
      // cart: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "carts"
      // },
    },
    {
      strict: false,
      timestamps: {
        updatedAt: "FechaUltMod",
        createdAt: "FechaAlta"
      }
    }
  )
);

