import mongoose from "mongoose";

const usuariosEsquema = new mongoose.Schema(
  {
    nombre: String,
    apellido: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    edad: Number,
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carts"
    },
    rol: {
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
);

export const usuariosModelo = mongoose.model("usuarios", usuariosEsquema);

// const usuariosEsquema = new mongoose.Schema(
//   {
//     nombre: String,
//     apellido: String,
//     email: {
//       type: String,
//       unique: true
//     },
//     password: String
//   },
//   {
//     strict: false,
//     timestamps: {
//       updatedAt: "FechaUltMod",
//       createdAt: "FechaAlta"
//     }
//   }
// );
