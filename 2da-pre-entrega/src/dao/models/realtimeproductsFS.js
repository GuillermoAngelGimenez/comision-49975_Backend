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

export default router;
