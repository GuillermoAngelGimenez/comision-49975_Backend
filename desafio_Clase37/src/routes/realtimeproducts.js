import { Router } from "express";
import path from "path";
import fs from "fs";
// import { productsModelo } from "../dao/models/managerProducts.js";

import { ProductosController } from "../controller/productos.controller.js";

export const router = Router();

import ProductManager from "../productManager.js";
const pm = new ProductManager("products.json");

router.get("/realtimeproducts", ProductosController.getProductos);

export default router;
