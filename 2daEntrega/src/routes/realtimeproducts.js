import { Router } from "express";
import path from "path";
import fs from "fs";

export const router = Router();

import ProductManager from "../productManager.js";
const pm = new ProductManager("products.json");

router.get("/realtimeproducts", async (req, res) => {
  let productos = await pm.getProducts();
  res.status(200).render("realTimeProducts", {
    productos
  });
});

// router.post("/realtimeproducts", async (req, res) => {
//   let products = await pm.getProducts();

//   const body = req.body;

//   const thumbnails = body.thumbnails || [];
//   body.status = body.status || true;

//   const requiredFields = [
//     "title",
//     "description",
//     "price",
//     "code",
//     "stock",
//     "category"
//   ];

//   const missingFields = requiredFields.filter((field) => !(field in req.body));

//   if (missingFields.length > 0) {
//     return res
//       .status(400)
//       .json({ error: `Faltan campos requeridos: ${missingFields.join(", ")}` });
//   }

//   const typeValidation = {
//     title: "string",
//     description: "string",
//     price: "number",
//     code: "string",
//     stock: "number",
//     category: "string",
//     status: "boolean"
//   };

//   const invalidFields = Object.entries(typeValidation).reduce(
//     (acc, [field, type]) => {
//       if (body[field] !== undefined) {
//         if (type === "array" && !Array.isArray(body[field])) {
//           acc.push(field);
//         } else if (typeof body[field] !== type) {
//           acc.push(field);
//         }
//       }
//       return acc;
//     },
//     []
//   );

//   if (!Array.isArray(thumbnails)) {
//     return res
//       .status(400)
//       .json({ error: "Formato inválido para el campo thumbnails" });
//   }

//   if (invalidFields.length > 0) {
//     return res.status(400).json({
//       error: `Tipos de datos inválidos en los campos: ${invalidFields.join(
//         ", "
//       )}`
//     });
//   }

//   validar que no se repita el code

//   let products = pm.getProducts();

//   let existe = products.find((product) => product.code === body.code);

//   if (existe) {
//     return res.status(400).json({
//       error: `Ya se encuentra registrado un producto con código ${body.code}`
//     });
//   }

//   let id = 1;

//   if (products.length > 0) {
//     id = products[products.length - 1].id + 1;
//   }

//   let newProduct = body;

//   pm.addProduct(newProduct);

//   socket emit por la nueva creación de producto
//   serverSockets.on("connection", (socket) => {
//     console.log(`Se conecto un cliente con id ${socket.id}`);

//     serverSockets.emit("Se agrego producto con éxito", { body });
//   });

//   return res.status(201).json({ newProduct });
// });

// router.delete("/realtimeproducts/:id", async (req, res) => {
//   let { id } = req.params;
//   id = parseInt(id);
//   if (isNaN(id)) {
//     res.setHeader("Content-Type", "application/json");
//     return res.status(400).json({ error: `Indique un id numérico` });
//   }

//   let products = await pm.getProducts();
//   let indiceProduct = products.findIndex((product) => product.id === id);
//   if (indiceProduct === -1) {
//     res.setHeader("Content-Type", "application/json");
//     return res
//       .status(400)
//       .json({ error: `No existe el producto con id ${id}` });
//   }

//   pm.deleteProduct(id);

//   socket emit por la eliminacion de producto
//   serverSockets.on("connection", (socket) => {
//     console.log(`Se conecto un cliente con id ${socket.id}`);

//     serverSockets.emit("Se elimino al producto", { id });
//   });

//   res.setHeader("Content-Type", "application/json");
//   res.status(200).json(`Se eliminó con éxito el producto con id ${id}`);
// });

export default router;
