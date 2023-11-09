const { Router } = require("express");
const path = require("path");
const fs = require("fs");

let rutaCarrito = path.join(__dirname, "..", "archivos", "carrito.json");

const ProductManager = require("../productManager");
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
    let productos = resultado.products;

    let idproductos = productos.map((product) => ({
      idProducto: product.idProducto
    }));
    res.status(200).json({ idproductos });
  }
});

router.post("/", async (req, res) => {
  let propPermitidas = ["idProducto", "quantity"];
  let products = await pm.getProducts();

  let arrayProductos = req.body;

  //validacion de propiedades permitidas
  for (let objeto of arrayProductos) {
    for (let propiedad in objeto) {
      if (
        !objeto.hasOwnProperty("idProducto") ||
        !objeto.hasOwnProperty("quantity")
      ) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: `No se aceptan algunas propiedades. Propiedades permitidas: ${propPermitidas}`
        });
      }
    }
  }

  let exRegNum = /\D/;
  //validar que los campos sean de tipo numerico y que el o los productos existan en el listado de produtos
  for (let objeto of arrayProductos) {
    // return res.send(`datos ${objeto.idProducto} - ${objeto.quantity}`);
    if (exRegNum.test(objeto.idProducto) || exRegNum.test(objeto.quantity)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `Se debe ingresar un valor numérico para el id de producto y para la cantidad`
      });
    }

    let existeProducto = products.find(
      (product) => product.id === objeto.idProducto
    );

    if (!existeProducto) {
      // se notifica que no se puede agregar al carrito por no existir en el listado principal de productos
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({
        error: `No se puede agregar el producto porque no existe en el listado principal`
      });
    }
  }

  let carrito = await getCarts();

  let id = 1;
  if (carrito.length > 0) {
    id = carrito[carrito.length - 1].id + 1;
  }

  let newCarrito = {
    id,
    products: arrayProductos
  };

  carrito.push(newCarrito);

  saveCart(carrito);

  res.setHeader("Content-Type", "application/json");
  return res.status(201).json({ newCarrito });
});

router.post("/:cid/product/:pid", async (req, res) => {
  let cid = req.params.cid;
  cid = parseInt(cid);

  //validaciones sobre los tipos de datos permitidos para cada campo
  let exRegCantidad = /\D/;
  let cantidad = parseInt(req.body);
  if (exRegCantidad.test(cantidad)) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Se debe ingresar un valor numérico para cantidad` });
  }

  // validar que el id del carrito exista en carrito.json
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
    resultado = carritoAModificar.products[indexProducto].quantity + cantidad;

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
      quantity: cantidad
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

module.exports = router;
