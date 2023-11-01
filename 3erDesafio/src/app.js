const express = require("express");

const ProductManager = require("./productManager");
const pm = new ProductManager("../archivos/products.json");

const PORT = 8080;

const app = express();

app.get("/products", async (req, res) => {
  let resultado = await pm.getProducts();

  console.log(resultado);

  // if (req.query.limit) {
  //   resultado = resultado.slice(0, req.query.limit);
  // }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ resultado });
});

app.get("/products/:pid", (req, res) => {
  let id = req.params.pid;

  id = parseInt(id);

  if (isNaN(id)) {
    return res.send("Error, ingrese un argumento id numérico");
  }

  let resultado = Products.find((prod) => prod.id === id);

  res.setHeader("Content-Type", "application/json");

  if (!resultado) {
    res.send("El número ingresado no corresponde a un id existente");
  } else {
    res.status(200).json({ resultado });
  }
});

const server = app.listen(PORT, () => {
  console.log(`El servidor esta en linea en el puerto ${PORT}`);
});
