import { Router } from "express";
import path from "path";
import fs from "fs";
import __dirname from "../util.js";
import { cartsModelo } from "../dao/models/managerCarts.js";
import { productsModelo } from "../dao/models/managerProducts.js";
import mongoose from "mongoose";
import { CartsController } from "../controller/carts.controller.js";

const router = Router();

const auth = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  next();
};

router.use(auth);

router.get("/", CartsController.getCarts);

router.get("/:id", CartsController.getCartsById);

router.post("/", CartsController.createCarrito);

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
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message,
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

  let indexProducto = carritoAModificar.products.findIndex((prod) =>
    prod.idProducto.equals(pid)
  );

  if (indexProducto !== -1) {
    let productoSel = carritoAModificar.products.find((prod) =>
      prod.idProducto.equals(pid)
    );

    let cantidad = parseInt(productoSel.quantity) + 1;

    let otrosProductos = existe.products.filter(
      (producto) => producto.idProducto.toString() !== pid
    );

    let prodModificado = {
      idProducto: pid,
      quantity: cantidad,
    };

    otrosProductos.push(prodModificado);

    let cartModificado = {
      id: cid,
      products: otrosProductos,
    };
    console.log(cartModificado);

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
        detalle: error.message,
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
        detalle: error.message,
      });
    }

    if (!existe) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `No existe un producto con id ${pid}. No se puede agregar al carrito`,
      });
    }

    // se continua el proceso de agregar producto a carrito
    let otrosProductos;

    otrosProductos = carritoAModificar.products;

    let prodModificado = {
      idProducto: pid,
      quantity: 1,
    };

    otrosProductos.push(prodModificado);
    console.log(otrosProductos);

    let cartModificado = {
      id: cid,
      products: otrosProductos,
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
        detalle: error.message,
      });
    }
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
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
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message,
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

  let indexProducto = carritoAModificar.products.findIndex((prod) =>
    prod.idProducto.equals(pid)
  );

  let cantNueva;

  if (indexProducto !== -1) {
    const requestBody = req.body;
    const clavesPermitidas = ["quantity"];

    // Verificar si el cuerpo del JSON no está vacío
    if (Object.keys(requestBody).length !== 1) {
      res
        .status(400)
        .send("Se debe enviar la cantidad del producto a modificar (quantity)");
      return;
    }

    for (const key in requestBody) {
      if (clavesPermitidas.includes(key)) {
        cantNueva = parseInt(requestBody[key]);
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `La única clave aceptada es quantity...!!!` });
      }
    }

    let otrosProductos = existe.products.filter(
      (producto) => producto.idProducto.toString() !== pid
    );

    let prodModificado = {
      idProducto: pid,
      quantity: cantNueva,
    };

    otrosProductos.push(prodModificado);
    let cartModificado = {
      id: cid,
      products: otrosProductos,
    };

    let resultado;
    try {
      resultado = await cartsModelo.updateOne(
        { _id: cid },
        { $set: cartModificado }
      );
      if (resultado.modifiedCount > 0) {
        console.log(resultado);
        console.log(cartModificado);
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
        detalle: error.message,
      });
    }
  } else {
    let pid = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `Ingrese un producto existente en el carrito...!!!` });
    }
  }
});

router.put("/:cid", async (req, res) => {
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
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message,
    });
  }

  if (!existe) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe un carrito con id ${cid}` });
  }

  //-------------------------
  let body = req.body;
  let arrayProductos = [];
  arrayProductos = await productsModelo.find({}, "_id");

  arrayProductos = arrayProductos.map((objeto) => objeto._id.toHexString());
  let noExisten = [];
  let siExisten = [];
  let siExistenV = [];
  let nuevoProd;
  let prodOri;
  let agregar;

  for (let i = 0; i < body.length; i++) {
    agregar = 0;
    nuevoProd = body[i].idProducto.toString();
    for (let j = 0; j < arrayProductos.length; j++) {
      prodOri = arrayProductos[j].toString();

      if (nuevoProd === prodOri) {
        agregar = 1;
      }
    }

    if (agregar == 1) {
      siExisten.push({
        idProducto: body[i].idProducto,
        quantity: body[i].quantity,
      });
      siExistenV.push(body[i].idProducto);
    } else {
      noExisten.push(body[i].idProducto);
    }
  }

  console.log(noExisten);
  console.log(siExisten);

  if (siExisten.length === 0) {
    res
      .status(400)
      .send(
        "Ninguno de los productos existen. No se pueden agregar al carrito"
      );
  } else {
    await cartsModelo.updateOne(
      { _id: cid },
      {
        $set: {
          products: siExisten,
        },
      }
    );

    if (noExisten.length !== 0) {
      res
        .status(200)
        .send(
          `Se agregaron al carrito los productos: ${siExistenV}. Los productos ${noExisten} no se pueden agregar al carrito.`
        );
    } else {
      res
        .status(200)
        .send(`Se agregaron al carrito los productos: ${siExistenV}.`);
    }
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
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
      detalle: error.message,
    });
  }

  if (!existe) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe un carrito con id ${cid}` });
  }

  let pid = req.params.pid;

  //validar si el producto ya existe en el carrito
  let carritoAModificar = existe;

  let indexProducto = carritoAModificar.products.findIndex((prod) =>
    prod.idProducto.equals(pid)
  );

  if (indexProducto !== -1) {
    try {
      let carritoModificado = await cartsModelo.updateOne(
        { _id: cid },
        {
          $pull: {
            products: {
              idProducto: pid,
            },
          },
        }
      );

      // let carritoModificado = await cartsModelo.findById({ _id: id });
      if (carritoModificado.modifiedCount > 0) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: "Elemento eliminado correctamente." });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `No se concretó la eliminación del producto` });
      }
    } catch (error) {
      console.error("Error al eliminar el elemento:", error);
    }
  } else {
    let pid = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `Ingrese un id válido para el producto...!!!` });
    }
  }
});

router.delete("/:cid", CartsController.deleteProducto);

export default router;
