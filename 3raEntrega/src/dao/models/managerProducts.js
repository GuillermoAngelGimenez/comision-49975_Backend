import mongoose from "mongoose";

const productsColeccion = "products";
const productsEsquema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: Boolean,
      required: true,
      default: true
    },
    stock: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    thumbnails: {
      type: [String],
      default: []
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

export const productsModelo = mongoose.model(
  productsColeccion,
  productsEsquema
);
