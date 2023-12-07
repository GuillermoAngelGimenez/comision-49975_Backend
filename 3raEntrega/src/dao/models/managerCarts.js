import mongoose from "mongoose";

const cartsColeccion = "carts";
const cartsEsquema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          idProducto: { type: String },
          quantity: { type: Number }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

export const cartsModelo = mongoose.model(cartsColeccion, cartsEsquema);
