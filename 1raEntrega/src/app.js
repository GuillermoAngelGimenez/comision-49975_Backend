const express = require("express");
const routerProductos = require("./routes/products.router");
const routerCarts = require("./routes/carts.router");

const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", routerProductos);
app.use("/api/carts", routerCarts);

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h2>Home Page</h2>");
});

const server = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});
