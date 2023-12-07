import { Router } from "express";
import { productsModelo } from "../dao/models/managerProducts.js";

export const router = Router();

router.get("/", async (req, res) => {
  let productos = [];
  try {
    productos = await productsModelo.find().lean();
  } catch (error) {
    console.log(error.message);
  }

  res.status(200).render("home", { productos });
});

router.get("/realtimeproducts", async (req, res) => {
  let productos = [];
  try {
    productos = await productsModelo.find().lean();
  } catch (error) {
    console.log(error.message);
  }

  const io = req.app.get("io");
  io.emit("resultado", productos);

  res.status(200).render("realTimeProducts", { productos });
});

router.get("/chat", async (req, res) => {
  // let productos = [];
  // try {
  //   productos = await productsModelo.find().lean();
  // } catch (error) {
  //   console.log(error.message);
  // }

  // const io = req.app.get("io");
  // io.emit("resultado", productos);

  // res.status(200).render("realTimeProducts", { productos });
  res.status(200).render("chat");
});

export default router;
