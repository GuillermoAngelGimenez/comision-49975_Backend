import { Router } from "express";
import path from "path";
import fs from "fs";
import __dirname from "../util.js";

let rutaCarrito = path.join(__dirname, "..", "archivos", "carrito.json");

import ProductManager from "../productManager.js";
const pm = new ProductManager("products.json");

function getCarts() {
  if (fs.existsSync(rutaCarrito)) {
    return JSON.parse(fs.readFileSync(rutaCarrito, "utf-8"));
  } else {
    return [];
  }
}

function saveCart(carritos) {
  fs.writeFileSync(rutaCarrito, JSON.stringify(carritos, null, 5));
}

const router = Router();

router.get("/", async (req, res) => {
  let carritos = await getCarts();

  if (req.query.limit) {
    carritos = carritos.slice(0, req.query.limit);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ carritos });
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;

  id = parseInt(id);

  if (isNaN(id)) {
    return res.status(400).send("Error, ingrese un argumento id numérico");
  }

  let resultado = await getCarts();

  resultado = resultado.find((cart) => cart.id === id);

  res.setHeader("Content-Type", "application/json");

  if (!resultado) {
    return res
      .status(404)
      .send("El número ingresado no corresponde a un id de carrito existente.");
  } else {
    res.status(200).json({ resultado });
  }
});

router.post("/", async (req, res) => {
  let carrito = await getCarts();

  let id = 1;
  if (carrito.length > 0) {
    id = carrito[carrito.length - 1].id + 1;
  }

  let newCarrito = {
    id,
    products: []
  };

  carrito.push(newCarrito);

  saveCart(carrito);

  res.setHeader("Content-Type", "application/json");
  return res.status(201).json({ newCarrito });
});

router.post("/:cid/product/:pid", async (req, res) => {
  let cid = req.params.cid;
  cid = parseInt(cid);

  // validar que el id del carrito exista en carrito.json - sino existe no puedo agregar el producto
  let carritos = await getCarts();
  let indexCarrito = carritos.findIndex((carrito) => carrito.id === cid);
  if (indexCarrito === -1) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({
      error: `No existe un carrito con el id: ${cid}.`
    });
  }

  let pid = req.params.pid;
  pid = parseInt(pid);

  let otrosProductos;
  //validar si el producto ya existe en el carrito
  let carritoAModificar = carritos.find((carrito) => carrito.id === cid);
  let indexProducto = carritoAModificar.products.findIndex(
    (prod) => prod.idProducto === pid
  );

  let resultado;
  if (indexProducto !== -1) {
    resultado = carritoAModificar.products[indexProducto].quantity + 1;

    otrosProductos = carritoAModificar.products.filter(
      (prod) => prod.idProducto !== pid
    );

    let prodModificado = {
      idProducto: pid,
      quantity: resultado
    };

    otrosProductos.push(prodModificado);

    let cartModificado = {
      id: cid,
      products: otrosProductos
    };

    carritos[indexCarrito] = cartModificado;
    saveCart(carritos);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ carritos });
  } else {
    let pid = req.params.pid;
    pid = parseInt(pid);

    //validar si el producto existe en el listado de productos
    let products = await pm.getProducts();
    let existeProducto = products.find((product) => product.id === pid);

    if (!existeProducto) {
      // se notifica que no se puede agregar al carrito por no existir en el listado principal de productos
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({
        error: `No se puede agregar el producto porque no existe en el listado principal`
      });
    }

    // se continua el proceso de agregar producto a carrito
    let carritoAModificar = carritos.find((carrito) => carrito.id === cid);

    let otrosProductos;

    otrosProductos = carritoAModificar.products;

    let prodModificado = {
      idProducto: pid,
      quantity: 1
    };

    otrosProductos.push(prodModificado);

    let cartModificado = {
      id: cid,
      products: otrosProductos
    };

    carritos[indexCarrito] = cartModificado;
    saveCart(carritos);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ carritos });
  }
});

export default router;
