import mongoose from "mongoose";

const cartsColeccion = "carts";
const cartsEsquema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          idProducto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products"
          },
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
