import { Router } from "express";

export const router = Router();

import ProductManager from "../productManager.js";
const pm = new ProductManager("products.json");

router.get("/", async (req, res) => {
  let productos = await pm.getProducts();
  res.status(200).render("home", { productos });
});

router.get("/realtimeproducts", async (req, res) => {
  let productos = await pm.getProducts();
  const io = req.app.get("io");
  io.emit("resultado", productos);
  console.log(productos);
  res.status(200).render("realTimeProducts", { productos });
});

export default router;
