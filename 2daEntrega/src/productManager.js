import path from "path";
import fs from "fs";
import __dirname from "./util.js";

class ProductManager {
  constructor(archivoJson) {
    this.products = [];
    this.path = path.join(__dirname, "archivos", archivoJson);
  }

  async getProducts() {
    if (fs.existsSync(this.path)) {
      return JSON.parse(await fs.promises.readFile(this.path, "utf8"));
    } else {
      return [];
    }
  }

  async addProduct(newProduct) {
    let { title, description, price, thumbnail, code, stock } = newProduct;

    //Validar Code
    let products = await this.getProducts();

    let id = 1;
    if (products.length > 0) {
      id = products[products.length - 1].id + 1;

      //Se valida que el código no se repita
      let existe = products.find((u) => u.code === code);
      if (existe) {
        console.log(
          `No se puede agregar el producto "${title} - ${description}" porque el código "${code}" ya se encuentra registrado`
        );
        return;
      }

      //Se valida que se ingresen todos los campos requeridos para el producto
      if (
        title === undefined ||
        description === undefined ||
        price === undefined ||
        // thumbnail === undefined ||
        code === undefined ||
        stock === undefined
      ) {
        console.log(
          `No se ingresaron todos los valores requeridos para el producto. \nValores ingresados: \n\ttitle: ${title}, description: ${description}, price: ${price}, thumbnail: ${thumbnail}, code: ${code}, stock: ${stock}`
        );
        return;
      }
    }

    products.push(newProduct);

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));
  }

  async getProductById(id) {
    let producto = await this.getProducts();
    let existe = producto.find((p) => p.id === id);

    if (existe) {
      ////Retorna el objeto en el caso que el id exista
      return existe;
    } else {
      console.log(`El id ${id} no corresponde a ningún producto registrado.`);
      return;
    }
  }

  async updateProduct(id, prodModificado) {
    let products = await this.getProducts();

    const indexProduct = products.findIndex((product) => product.id === id);
    if (indexProduct === -1) {
      console.error(
        `El producto con id ${id} no se encuentra registrado. No es posible actualizar el producto.`
      );
      return;
    }

    products[id] = prodModificado;
    fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));
  }

  async deleteProduct(id) {
    try {
      let products = await this.getProducts();
      let indexProduct = products.findIndex((prod) => prod.id === id);
      if (indexProduct === -1) {
        console.log(
          `El producto con id ${id} no se encuentra registrado. No es posible eliminar un producto no existente.`
        );
        return;
      }
      products.splice(indexProduct, 1);
      fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));
      console.log(`Ha sido eliminado el producto con id: ${id}`);
    } catch (error) {
      console.log("Error al borrar el producto: ", error.message);
    }
  }
}

export default ProductManager;
