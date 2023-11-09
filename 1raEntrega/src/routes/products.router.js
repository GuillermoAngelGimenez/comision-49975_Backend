const { Router } = require("express");
const path = require("path");
const fs = require("fs");

const ProductManager = require("../productManager");
const pm = new ProductManager("products.json");

const router = Router();

// function validacionesCamposProd(req, res, products) {
// body = req.body;
// let {
//   title,
//   description,
//   code,
//   price,
//   status = true,
//   stock,
//   category,
//   thumbnails
// } = body;
// // validacion de propiedades permitidas
// let propPermitidas = [
//   "title",
//   "description",
//   "code",
//   "price",
//   "status",
//   "stock",
//   "category",
//   "thumbnails"
// ];
// let propRecibidas = Object.keys(body);
// console.log(propRecibidas);
// let valido = propRecibidas.every((prop) => propPermitidas.includes(prop));
// if (!valido) {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: `No se aceptan algunas propiedades`,
//     propPermitidas
//   });
// }
// // validaciones sobre los tipos de datos permitidos para cada campo
// let exRegString = /[0-9]/;
// if (
//   exRegString.test(title) ||
//   exRegString.test(description) ||
//   exRegString.test(code) ||
//   exRegString.test(category)
// ) {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: `Los campos title, description, code y category deben ser de tipo string`
//   });
// }
// let exRegNum = /\D/;
// if (exRegNum.test(price) || exRegNum.test(stock)) {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: `Se debe ingresar un valor numérico para precio y stock`
//   });
// }
// if (status != "true" && status != "false") {
//   res.setHeader("Content-Type", "application/json");
//   return res
//     .status(400)
//     .json({ error: `El campo status debe ser true o false, ${status}` });
// }
// // valicacion de campos obligatorios
// if (!title || !description || !code || !price || !stock || !category) {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: `Todos los campos a excepción de status y thumbnails son obligatorios`
//   });
// }
// // validar que no se repita el code
// // let products = pm.getProducts();
// let existe = products.find((product) => product.code === code);
// if (existe) {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: `Ya se encuentra registrado un producto con código ${code}`
//   });
// }
// }

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
  let {
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails
  } = req.body;

  let products = await pm.getProducts();

  // validacionesCamposProd(req, res, products);

  ///------------------------El código a continuación entre línea 142 y 213 se repite para el POST y para el PUT pero no pude hacer que
  ///funcione si lo llamo en una función.
  // validacion de propiedades permitidas
  let propPermitidas = [
    "title",
    "description",
    "code",
    "price",
    "status",
    "stock",
    "category",
    "thumbnails"
  ];

  let propRecibidas = Object.keys(req.body);
  let valido = propRecibidas.every((prop) => propPermitidas.includes(prop));
  if (!valido) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `No se aceptan algunas propiedades`,
      propPermitidas
    });
  }

  // validaciones sobre los tipos de datos permitidos para cada campo
  let exRegString = /[0-9]/;
  if (
    exRegString.test(title) ||
    exRegString.test(description) ||
    exRegString.test(code) ||
    exRegString.test(category)
  ) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Los campos title, description, code y category deben ser de tipo string`
    });
  }

  let exRegNum = /\D/;
  if (exRegNum.test(price) || exRegNum.test(stock)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Se debe ingresar un valor numérico para precio y stock`
    });
  }

  if (status.toLowerCase() != "true" && status.toLowerCase() != "false") {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El campo status debe ser true o false, se esta intentando ingresar el valor: ${status}`
    });
  }

  // valicacion de campos obligatorios
  if (!title || !description || !code || !price || !stock || !category) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Todos los campos a excepción de status y thumbnails son obligatorios`
    });
  }

  // validar que no se repita el code
  // let products = pm.getProducts();
  let existe = products.find((product) => product.code === code);
  if (existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Ya se encuentra registrado un producto con código ${code}`
    });
  }

  ///------------------------

  let id = 1;
  if (products.length > 0) {
    id = products[products.length - 1].id + 1;
  }

  let newProduct = {
    id,
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  };

  pm.addProduct(newProduct);

  res.setHeader("Content-Type", "application/json");
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

  let {
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails
  } = req.body;

  ///------------------------El código a continuación entre línea 257 y 328 se repite para el POST y para el PUT pero no pude hacer que
  ///funcione si lo llamo en una función.
  // validacion de propiedades permitidas
  let propPermitidas = [
    "title",
    "description",
    "code",
    "price",
    "status",
    "stock",
    "category",
    "thumbnails"
  ];

  let propRecibidas = Object.keys(req.body);
  let valido = propRecibidas.every((prop) => propPermitidas.includes(prop));
  if (!valido) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `No se aceptan algunas propiedades`,
      propPermitidas
    });
  }

  // validaciones sobre los tipos de datos permitidos para cada campo
  let exRegString = /[0-9]/;
  if (
    exRegString.test(title) ||
    exRegString.test(description) ||
    exRegString.test(code) ||
    exRegString.test(category)
  ) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Los campos title, description, code y category deben ser de tipo string`
    });
  }

  let exRegNum = /\D/;
  if (exRegNum.test(price) || exRegNum.test(stock)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Se debe ingresar un valor numérico para precio y stock`
    });
  }

  if (status.toLowerCase() != "true" && status.toLowerCase() != "false") {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `El campo status debe ser true o false, se esta intentando ingresar el valor: ${status}`
    });
  }

  // valicacion de campos obligatorios
  if (!title || !description || !code || !price || !stock || !category) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Todos los campos a excepción de status y thumbnails son obligatorios`
    });
  }

  // validar que no se repita el code --- NO APLICA AL PUT
  // let products = pm.getProducts();
  let existe = products.find(
    (product) => product.code === code && product.id !== id
  );
  if (existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      error: `Ya se encuentra registrado un producto con código ${code}`
    });
  }

  ///------------------------

  let productoModificado = {
    ...products[indiceProduct],
    ...req.body,
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

  let products = await pm.getProducts();
  let indiceProduct = products.findIndex((product) => product.id === id);
  if (indiceProduct === -1) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el producto con id ${id}` });
  }

  pm.deleteProduct(id);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(`Se eliminó con éxito el producto con id ${id}`);
});

module.exports = router;
