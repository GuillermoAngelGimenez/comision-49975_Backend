import { Router } from "express";
import { productsModelo } from "../dao/models/managerProducts.js";
import { cartsModelo } from "../dao/models/managerCarts.js";
import mongoose from "mongoose";

import { verificarToken } from "../util.js";

export const router = Router();

const authP = (req, res, next) => {
  const usuario = verificarToken(req.cookies.ecommerce);
  if (!usuario) {
    return res.redirect("/login");
  }
  req.usuario = usuario;
  next();
};

// router.get("/registrate", UsuariosController.registroUsuario);
router.get("/registrate", (req, res) =>{
  let { error } = req.query;

  res.setHeader("Content-Type", "text/html");
  res.status(200).render("registrate", { error, login: false });
});

// router.get("/login", UsuariosController.loginUsuario);
router.get("/login", (req, res) => {
  let { error, mensaje } = req.query;

  res.setHeader("Content-Type", "text/html");
  res.status(200).render("login", { error, mensaje, login: false });
});

router.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("login");
  // res.status(200).render("login", { login: req.session.usuario ? true : false });
});

router.get("/realtimeproducts", authP, async (req, res) => {
  let productos = [];
  try {
    productos = await productsModelo.find({ deleted: false }).lean();
  } catch (error) {
    console.log(error.message);
  }

  try {
    productos = await productsModelo.find({ deleted: false }).lean();
  } catch (error) {
    console.log(error.message);
  }

  const io = req.app.get("io");
  io.emit("resultado", productos);

  res.status(200).render("realTimeProducts", { productos });
});

router.get("/chat", authP, (req, res) => {
  res.status(200).render("chat");
});

router.get("/products", authP, async (req, res) => {
  let usuario;
  let login = false;

  if (req.usuario) {
    login = true;
    usuario = req.usuario;
  } 


  let pagina = 1;

  if (req.query.pagina) {
    pagina = req.query.pagina;
  }

  let productos;
  try {
    productos = await productsModelo.paginate(
      {},
      { lean: true, limit: 5, page: pagina }
    );
  } catch (error) {
    console.log(error.message);
    productos = [];
  }

  let { totalPages, hasNextPage, hasPrevPage, prevPage, nextPage } = productos;

  res.status(200).render("products", {
    productos: productos.docs,
    totalPages,
    hasNextPage,
    hasPrevPage,
    prevPage,
    nextPage,
    usuario,
    login
    // administrador,
  });
});

router.get("/carts/:id", async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El id ${id} no corresponde a ningún carrito existente...!!!`,
    });
  }

  let carrito;
  try {
    carrito = await cartsModelo
      .findOne({ _id: id })
      .populate("products.idProducto")
      .lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message,
    });
  }

  let totalAcumulado = 0;
  carrito.products.forEach((producto) => {
    let subtotal = producto.quantity * producto.idProducto.price;
    totalAcumulado += subtotal;
  });

  res.status(200).render("carts", { carrito, totalAcumulado });
});


export default router;
