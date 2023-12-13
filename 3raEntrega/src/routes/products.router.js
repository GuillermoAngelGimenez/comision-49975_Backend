import { Router } from "express";
import { io } from "../app.js";
import { productsModelo } from "../dao/models/managerProducts.js";
import mongoose from "mongoose";

export const router = Router();

router.get("/", async (req, res) => {
  let resultado = [];
  try {
    resultado = await productsModelo.find({ deleted: false });

    console.log(req.query.limit);
    if (req.query.limit) {
      resultado = resultado.slice(0, req.query.limit);
    }
  } catch (error) {
    console.log(error.message);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ resultado });
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe un producto con el id ${id}!!!` });
  }

  let existe;

  try {
    existe = await productsModelo.findOne({ deleted: false, _id: id });
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
  //   return res.status(400).json({ error: `No existe un usuario con id ${id}` });
  // }

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ usuario: existe });
});

router.post("/", async (req, res) => {
  let products;
  try {
    products = await productsModelo.find();
  } catch (error) {
    console.log(error.message);
  }
  // WebSocket
  const io = req.app.get("io");

  const body = req.body;

  const thumbnails = body.thumbnails || [];
  body.status = body.status || true;

  const requiredFields = [
    "title",
    "description",
    "price",
    "code",
    "stock",
    "category"
  ];

  const missingFields = requiredFields.filter((field) => !(field in req.body));

  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ error: `Faltan campos requeridos: ${missingFields.join(", ")}` });
  }

  const typeValidation = {
    title: "string",
    description: "string",
    price: "number",
    code: "string",
    stock: "number",
    category: "string",
    status: "boolean"
  };

  const invalidFields = Object.entries(typeValidation).reduce(
    (acc, [field, type]) => {
      if (body[field] !== undefined) {
        if (type === "array" && !Array.isArray(body[field])) {
          acc.push(field);
        } else if (typeof body[field] !== type) {
          acc.push(field);
        }
      }
      return acc;
    },
    []
  );

  if (!Array.isArray(thumbnails)) {
    return res
      .status(400)
      .json({ error: "Formato inválido para el campo thumbnails" });
  }

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: `Tipos de datos inválidos en los campos: ${invalidFields.join(
        ", "
      )}`
    });
  }

  // validar que no se repita el code
  let existe = false;
  try {
    existe = await productsModelo.findOne({
      deleted: false,
      _code: body.code
    });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }

  if (existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El producto con código ${code} ya existe en la BD...!!!`
    });
  }

  let newProduct = { ...body };

  console.log(newProduct);

  try {
    let nuevoProducto = await productsModelo.create(newProduct);
    io.emit("add", newProduct);
    res.setHeader("Content-Type", "application/json");
    return res.status(201).json({ payload: nuevoProducto });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido...!!!` });
  }

  let existe;
  try {
    existe = await productsModelo.findOne({ deleted: false, _id: id });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }

  // WebSocket
  const io = req.app.get("io");

  // if (!existe) {
  //   res.setHeader("Content-Type", "application/json");
  //   return res
  //     .status(400)
  //     .json({ error: `No existe un producto con id ${id}` });
  // }

  const body = req.body;

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({
      error:
        "El cuerpo de la solicitud está vacío por lo cual no hay nada para editar en el producto"
    });
  }

  const camposPermitidos = [
    "title",
    "description",
    "price",
    "code",
    "stock",
    "category",
    "status",
    "thumbnails"
  ];

  // Recorrer las claves y valores del cuerpo del objeto
  let keysInvalidas = [];
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      if (!camposPermitidos.includes(key)) {
        keysInvalidas.push(key);
      }
    }
  }

  if (keysInvalidas.length > 0) {
    return res.status(400).json({
      error:
        "El cuerpo de la solicitud contiene campos invalidos. Campos Invalidos: " +
        keysInvalidas.join(", ") +
        "."
    });
  }

  const typeValidation = {
    title: "string",
    description: "string",
    price: "number",
    code: "string",
    stock: "number",
    category: "string",
    status: "boolean"
  };

  const invalidFields = Object.entries(typeValidation).reduce(
    (acc, [field, type]) => {
      if (body[field] !== undefined) {
        if (type === "array" && !Array.isArray(body[field])) {
          acc.push(field);
        } else if (typeof body[field] !== type) {
          acc.push(field);
        }

        if (body["thumbnails"]) {
          if (!Array.isArray(body["thumbnails"])) {
            return res
              .status(400)
              .json({ error: "Formato inválido para el campo thumbnails" });
          }
        }
      }
      return acc;
    },
    []
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: `Tipos de datos inválidos en los campos: ${invalidFields.join(
        ", "
      )}`
    });
  }

  // validar que no se repita el code ingresado respecto a existente
  existe = false;
  try {
    existe = await productsModelo.findOne({
      deleted: false,
      code: body.code
    });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }

  if (existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El producto con código ${body.code} ya existe en BD...!!!`
    });
  }

  let resultado;
  try {
    resultado = await productsModelo.updateOne(
      { deleted: false, _id: id },
      body
    );

    let productActualizado = await productsModelo.findOne({
      deleted: false,
      _id: id
    });
    io.emit("update", productActualizado);

    if (resultado.modifiedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ payload: "Modificacion realizada con éxito" });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No se concretó la modificación` });
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El id ingresado no corresponde a un producto existente...!!!`
    });
  }

  let existe;
  try {
    existe = await productsModelo.findOne({ deleted: false, _id: id });
    console.log("producto eliminado");
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }

  const io = req.app.get("io");

  // if (!existe) {
  //   res.setHeader("Content-Type", "application/json");
  //   return res
  //     .status(400)
  //     .json({ error: `No existe un producto con id ${id}` });
  // }

  let resultado;
  try {
    resultado = await productsModelo.updateOne(
      { deleted: false, _id: id },
      { $set: { deleted: true } }
    );

    io.emit("delete", id);

    if (resultado.modifiedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ payload: "La Eliminacion se realizó con éxito" });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No se concretó la eliminacion` });
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message
    });
  }
});

export default router;
