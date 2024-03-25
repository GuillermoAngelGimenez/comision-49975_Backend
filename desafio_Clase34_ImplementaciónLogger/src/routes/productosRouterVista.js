import { Router } from "express";
import { productsModelo } from "../dao/models/managerProducts.js";
import { cartsModelo } from "../dao/models/managerCarts.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

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

router.get("/registrate", (req, res) =>{
  let { error } = req.query;

  res.setHeader("Content-Type", "text/html");
  res.status(200).render("registrate", { error, login: false });
});

router.get("/login", (req, res) => {
  let { error, mensaje } = req.query;

  res.setHeader("Content-Type", "text/html");
  res.status(200).render("login", { error, mensaje, login: false });
});

router.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("login");
});

router.get("/realtimeproducts", authP, async (req, res) => {
  let productos = [];
  try {
    productos = await productsModelo.find({ deleted: false }).lean();
  } catch (error) {
    req.logger.error("Error en la búsqueda de productos: ", error.message);
    // console.log(error.message);
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
    req.logger.error("Error en la búsqueda de productos páginado: ", error.message);

    // console.log(error.message);
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
  });
});

router.get("/carts/:id", async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.logger.info("El id ingresado no existe: " + id);

    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({error: `El id ${id} no corresponde a ningún carrito existente...!!!`});
  }

  let carrito;
  try {
    carrito = await cartsModelo
      .findOne({ _id: id })
      .populate("products.idProducto")
      .lean();
  } catch (error) {
    req.logger.fatal("Error inesperado en el servidor")

    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
  }

  let totalAcumulado = 0;
  carrito.products.forEach((producto) => {
    let subtotal = producto.quantity * producto.idProducto.price;
    totalAcumulado += subtotal;
  });

  res.status(200).render("carts", { carrito, totalAcumulado });
});

router.get('/loggerTest', async (req, res)=> {
  const filePath = "./src/logs/errors.log";
  // const fullPath = path.join(process.cwd(), 'archivo.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      req.logger.fatal('Error al leer el archivo de logs', err);
      return res.status(500).json({ error: 'Error al leer el archivo de logs', err });
    }
    
    const logArray = data.trim().split('\r\n');

    req.logger.info(JSON.stringify(logArray));
    res.status(200).json({ logContent: logArray });
  });

});

export default router;
