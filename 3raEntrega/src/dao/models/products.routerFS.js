import { Router } from "express";
import { io } from "../app.js";

export const router = Router();

import ProductManager from "../productManager.js";
const pm = new ProductManager("products.json");

router.get("/", async (req, res) => {
  let resultado = await pm.getProducts();

  if (req.query.limit) {
    resultado = resultado.slice(0, req.query.limit);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ resultado });
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;

  id = parseInt(id);

  if (isNaN(id)) {
    return res.status(400).send("Error, ingrese un argumento id numérico");
  }

  pm.getProductById(id);

  let resultado = await pm.getProducts();

  resultado = resultado.find((prod) => prod.id === id);

  res.setHeader("Content-Type", "application/json");

  if (!resultado) {
    return res
      .status(404)
      .send(
        "El número ingresado no corresponde a un id de producto existente."
      );
  } else {
    res.status(200).json({ resultado });
  }
});

router.post("/", async (req, res) => {
  let products = await pm.getProducts();

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
  let existe = products.find((product) => product.code === body.code);

  if (existe) {
    return res.status(400).json({
      error: `Ya se encuentra registrado un producto con código ${body.code}`
    });
  }

  let id = 1;

  if (products.length > 0) {
    id = products[products.length - 1].id + 1;
  }

  let newProduct = {
    id,
    ...body
  };

  await pm.addProduct(newProduct);

  io.emit("add", newProduct);

  return res.status(201).json({ newProduct });
});

router.put("/:id", async (req, res) => {
  let { id } = req.params;

  id = parseInt(id);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Indique un id numérico` });
  }

  let products = await pm.getProducts();
  console.log(products);
  let indiceProduct = products.findIndex((product) => product.id === id);
  if (indiceProduct === -1) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existen un producto con id ${id}` });
  }

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
  let existe = products.find(
    (product) => product.code === body.code && product.id !== id
  );
  if (existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Ya se encuentra registrado un producto con código ${body.code}`
    });
  }

  let productoModificado = {
    ...products[indiceProduct],
    ...body,
    id
  };

  pm.updateProduct(indiceProduct, productoModificado);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(`El producto con id ${id} se modifico con éxito`);
});

router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  id = parseInt(id);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Indique un id numérico` });
  }

  const io = req.app.get("io");

  let products = await pm.getProducts();
  let indiceProduct = products.findIndex((product) => product.id === id);
  if (indiceProduct === -1) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el producto con id ${id}` });
  }

  pm.deleteProduct(id);

  io.emit("delete", id);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(`Se eliminó con éxito el producto con id ${id}`);
});

export default router;
