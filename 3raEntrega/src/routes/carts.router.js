import { Router } from "express";
import path from "path";
import fs from "fs";
import __dirname from "../util.js";
import { cartsModelo } from "../dao/models/managerCarts.js";
import { productsModelo } from "../dao/models/managerProducts.js";
import mongoose from "mongoose";

const router = Router();

router.get("/", async (req, res) => {
  let carritos = [];
  try {
    carritos = await cartsModelo.find();

    if (req.query.limit) {
      carritos = carritos.slice(0, req.query.limit);
    }
  } catch (error) {
    console.log(error.message);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(carritos);
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El id ${id} no corresponde a ningún carrito existente...!!!`
    });
  }

  let existe;
  try {
    existe = await cartsModelo.findOne({ _id: id });
    console.log(existe);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }

  // if (!existe) {
  //   res.setHeader("Content-Type", "application/json");
  //   return res.status(400).json({ error: `No existe un carrito con id ${id}` });
  // }

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(existe);
});

router.post("/", async (req, res) => {
  let carritos;
  try {
    carritos = await cartsModelo.find();
  } catch (error) {
    console.log(error.message);
  }

  const io = req.app.get("io");

  // -------------

  // res.setHeader("Content-Type", "application/json");
  // res.status(200).json({ carritos });

  let newCarrito = {
    // id,
    products: []
  };

  try {
    let nuevoCarrito = await cartsModelo.create({ newCarrito });
    console.log(nuevoCarrito);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ payload: nuevoCarrito });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  let cid = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un id válido para el carrito...!!!` });
  }
  // validar que el id del carrito exista
  let existe;
  try {
    existe = await cartsModelo.findOne({ _id: cid });
    console.log(existe);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }

  if (!existe) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe un carrito con id ${cid}` });
  }

  let pid = req.params.pid;

  let otrosProductos;
  //validar si el producto ya existe en el carrito
  let carritoAModificar = existe;

  let indexProducto = carritoAModificar.products.findIndex(
    (prod) => prod.idProducto === pid
  );

  if (indexProducto !== -1) {
    let productoSel = carritoAModificar.products.find(
      (prod) => prod.idProducto === pid
    );

    let cantidad = parseInt(productoSel.quantity) + 1;

    otrosProductos = carritoAModificar.products.filter(
      (prod) => prod.idProducto !== pid
    );

    let prodModificado = {
      idProducto: pid,
      quantity: cantidad
    };

    otrosProductos.push(prodModificado);

    let cartModificado = {
      id: cid,
      products: otrosProductos
    };
    console.log(cartModificado);

    let resultado;
    try {
      resultado = await cartsModelo.updateOne(
        { _id: cid },
        { $set: cartModificado }
      );
      // resultado=await usuariosModelo.deleteOne({_id: id})
      console.log(resultado);
      if (resultado.modifiedCount > 0) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: "Actualización realizada con éxito" });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `No se concretó la actualización` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message
      });
    }
  } else {
    let pid = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `Ingrese un id válido para el producto...!!!` });
    }

    //validar si el producto existe en el listado de productos
    let existe;
    try {
      existe = await productsModelo.findOne({ deleted: false, _id: pid });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message
      });
    }

    if (!existe) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `No existe un producto con id ${pid}. No se puede agregar al carrito`
      });
    }

    // se continua el proceso de agregar producto a carrito
    let otrosProductos;

    otrosProductos = carritoAModificar.products;

    let prodModificado = {
      idProducto: pid,
      quantity: 1
    };

    otrosProductos.push(prodModificado);
    console.log(otrosProductos);

    let cartModificado = {
      id: cid,
      products: otrosProductos
    };

    let resultado;
    try {
      resultado = await cartsModelo.updateOne(
        { _id: cid },
        { $set: cartModificado }
      );
      console.log(resultado);
      if (resultado.modifiedCount > 0) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: "Actualización realizada con éxito" });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `No se concretó la actualización` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message
      });
    }
  }
});

export default router;
