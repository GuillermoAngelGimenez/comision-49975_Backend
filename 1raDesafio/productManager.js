class ProductManager {
  constructor() {
    this.products = [];
  }

  addProduct(title, description, price, thumbnail, code, stock) {
    //Validar Code
    let indexCode = this.products.findIndex((product) => product.code === code);

    if (indexCode !== -1) {
      console.log(
        `No se puede agregar el producto "${title} - ${description}" porque el código "${code}" ya existe.`
      );
      return;
    }

    if (
      title === undefined ||
      description === undefined ||
      price === undefined ||
      thumbnail === undefined ||
      code === undefined ||
      stock === undefined
    ) {
      console.log(
        `No se ingresaron todos los valores requeridos para el producto. \nValores ingresados: \n\ttitle: ${title}, description: ${description}, price: ${price}, thumbnail: ${thumbnail}, code: ${code}, stock: ${stock}`
      );
      return;
    }

    let id = 1;
    if (this.products.length > 0) {
      id = this.products[this.products.length - 1].id + 1;
    }

    let newProduct = {
      id,
      title,
      description,
      price,
      thumbnail,
      code,
      stock
    };

    this.products.push(newProduct);
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    let indice = this.products.findIndex((product) => product.id === id);

    if (indice === -1) {
      console.log("Not found");
      return;
    } else {
      return this.products[indice];
    }
  }
}

//Proceso de Testing
// 1-
// let prodTecno = new ProductManager();
// console.log(prodTecno.getProducts());

// 2-
// prodTecno.addProduct(
//   "producto prueba",
//   "Este es un producto prueba",
//   200,
//   "Sin imagen",
//   "abc123",
//   25
// );
// console.log(prodTecno.getProducts());

//3-
// let prodTecno = new ProductManager();
// prodTecno.addProduct(
//   "producto prueba",
//   "Este es un producto prueba",
//   200,
//   "Sin imagen",
//   "abc123",
//   25
// );
// // entiendo que se agrega la primera vez

// prodTecno.addProduct(
//   "producto prueba",
//   "Este es un producto prueba",
//   200,
//   "Sin imagen",
//   "abc123",
//   25
// );
// console.log(prodTecno.getProducts());

// 4-
// busqueda de producto con id que no existe en el array
// let prodTecno = new ProductManager();
// console.log(prodTecno.getProductById(0));

// 5-
// busqueda de producto con id existente en el array
let prodTecno = new ProductManager();
prodTecno.addProduct(
  "notebook",
  "lenovo thinkpad",
  390000,
  "imagen_not_lenovo",
  "A0001",
  10
);

prodTecno.addProduct("tablet", "philips", 70000, "imagen_tablet", "A0002", 28);

prodTecno.addProduct(
  "mouse",
  "genius inalambrico",
  9000,
  "imagen_mouse",
  "A0003",
  37
);

console.log(prodTecno.getProductById(2));

// console.log(prodTecno.getProducts());

// prodTecno.addProduct(
//   "celular",
//   "samsung s20",
//   210000,
//   "imagen_s20",
//   57
// );
