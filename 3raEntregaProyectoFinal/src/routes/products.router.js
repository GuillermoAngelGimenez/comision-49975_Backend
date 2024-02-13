import { Router } from "express";
import { io } from "../app.js";
import { productsModelo } from "../dao/models/managerProducts.js";
import { ProductosController } from "../controller/productos.controller.js";
import mongoose from "mongoose";


export const router = Router();

// const auth = (req, res, next) => {
//   if (!req.session.usuario) {
//     return res.redirect("/login");
//   }

//   next();
// };

// router.use(auth);

router.get("/", ProductosController.getProductosValidation);

router.get("/:id", ProductosController.getProductosById);

router.post("/", ProductosController.createProducto);

router.put("/:id", ProductosController.updateProducto);

router.delete("/:id", ProductosController.deleteProducto);

export default router;
