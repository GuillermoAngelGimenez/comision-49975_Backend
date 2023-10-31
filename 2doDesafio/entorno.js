const ProductManager = require("./productManager");

const pm = new ProductManager("./archivos/products.json");

const entorno = async () => {
  try {
    //prueba 1
    // console.log(await pm.getProducts());
    //---------------------
    //prueba 2
    // await pm.addProduct(
    //   "producto prueba",
    //   "Este es un producto prueba",
    //   200,
    //   "Sin imagen",
    //   "abc123",
    //   25
    // );
    // console.log(await pm.getProducts());
    //---------------------
    //prueba 3 - agregamos nuevo producto para verificar que el id no se repita
    // await pm.addProduct(
    //   "producto prueba 2",
    //   "Este es un producto prueba 2",
    //   300,
    //   "Sin imagen 2",
    //   "abc456",
    //   38
    // );
    // console.log(await pm.getProducts());
    //---------------------
    //prueba 4 - busqueda por ID ok
    // console.log(await pm.getProductById(1));
    //---------------------
    //prueba 5 - busqueda por ID no coincidente
    // console.log(await pm.getProductById(5));
    //---------------------
    //prueba 6 - modificar el campo de un producto sin eliminar el id
    // await pm.updateProduct(1, "code", "ggg789");
    // console.log(await pm.getProducts());
    //---------------------
    //prueba 7 - eliminar un producto
    // await pm.deleteProduct(2);
    // console.log(await pm.getProducts());
    //---------------------
    //prueba 8 - no eliminar producto por no coincidencia en id
    // await pm.deleteProduct(10);
  } catch (error) {
    console.log("Error: " + error.message);
  }
};

entorno();
