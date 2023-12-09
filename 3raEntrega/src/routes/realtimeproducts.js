import { Router } from "express";
import path from "path";
import fs from "fs";
import { productsModelo } from "../dao/models/managerProducts.js";

export const router = Router();

import ProductManager from "../productManager.js";
const pm = new ProductManager("products.json");

router.get("/realtimeproducts", async (req, res) => {
  // let productos = await pm.getProducts();
  let productos = await productsModelo.find({ deleted: false });
  res.status(200).render("realTimeProducts", { productos });
});

export default router;
