import mongoose from "mongoose";

export const usuariosModelo = mongoose.model(
  "usuarios", 
  new mongoose.Schema(
    {
      first_name: String,
      last_name: String,
      email: {
        type: String,
        unique: true
      },
      password: String,
      age: Number,
      cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts"
      },
      role: {
        type: String,
        default: "user"
      }
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

