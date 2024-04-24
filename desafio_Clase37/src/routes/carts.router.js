import { Router } from "express";
import { io } from "../app.js";
import __dirname from "../util.js";
import { cartsModelo } from "../dao/models/managerCarts.js";
import { productsModelo } from "../dao/models/managerProducts.js";
import mongoose from 'mongoose';
import { CartsController } from "../controller/carts.controller.js";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { ticketsModelo } from "../dao/models/managerTicket.js";
import axios from 'axios';
import { config } from "../config/config.js";

export const router = Router();


router.get("/", CartsController.getCarts);

router.get("/:id", CartsController.getCartsById);

router.post("/", CartsController.createCarrito);

router.post("/:cid/product/:pid", async (req, res) => {
  let usuario;
  try {
    const PORT = config.PORT;
    const URL = 'http://localhost:3000/api/sessions/current';;

    if (PORT === 8080)
      URL = 'http://localhost:8080/api/sessions/current';

    const response = await axios.get(URL, {
        headers: {
            Cookie: req.headers.cookie
        }
    });

    usuario = response.data.respuesta; // Suponiendo que la información del usuario está en el cuerpo de la respuesta

  } catch (error) {
      console.error('Error al obtener la información del usuario:', error);
      return false; 
  }

  let cid = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    req.logger.debug(`El ${cid} no corresponde a un id válido para el carrito...!!!`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido para el carrito...!!!` });
  }

  // validar que el id del carrito exista
  let existe;
  try {
    existe = await cartsModelo.findOne({ _id: cid });
  } catch (error) {
    req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message});
  }

  if (!existe) {
    req.logger.error(`No existe un carrito con id ${cid}`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe un carrito con id ${cid}` });
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

    let resultado;
    try {
      resultado = await cartsModelo.updateOne(
        { _id: cid },
        { $set: cartModificado }
      );

      if (resultado.modifiedCount > 0) {
        req.logger.info(`El carrito con ${cid} se modificó con éxito`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Actualización realizada con éxito" });
      } else {
        req.logger.warning(`No se concretó la actualización del carrito ${cid}.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la actualización` });
      }
    } catch (error) {
      req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message});
    }
  } else {
    let pid = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      req.logger.debug(`El id ${pid} no es válido para el producto...!!!`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Ingrese un id válido para el producto...!!!` });
    }

    //validar si el producto existe en el listado de productos
    let existe;
    try {
      existe = await productsModelo.findOne({ deleted: false, _id: pid });
    } catch (error) {
      req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message});
    }

    if (!existe) {
      req.logger.debug(`No existe un producto con id ${pid}. No se puede agregar al carrito`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({error: `No existe un producto con id ${pid}. No se puede agregar al carrito`});
    }

    if(usuario.role == "premium" && usuario.email == existe.owner) {
      req.logger.debug(`El producto ${pid} no se puede agregar al carrito porque fue creado por el usuario logueado y el mismo es premium`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({error: `El producto ${pid} no se puede agregar al carrito porque fue creado por el usuario logueado y el mismo es premium`});
    }

    // se continua el proceso de agregar producto a carrito
    let otrosProductos;

    otrosProductos = carritoAModificar.products;

    let prodModificado = {
      idProducto: pid,
      quantity: 1,
    };

    otrosProductos.push(prodModificado);
    // console.log(otrosProductos);
    // req.logger.info(otrosProductos);

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
      // req.logger.info(resultado);
      // console.log(resultado);
      if (resultado.modifiedCount > 0) {
        req.logger.info(`Actualización realizada con éxito en el carrito ${cid}.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Actualización realizada con éxito" });
      } else {
        req.logger.error(`No se concretó la actualización del carrito ${cid}`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la actualización` });
      }
    } catch (error) {
      req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message});
    }
  }
});

router.post("/:cid/purchase", async (req, res) => {
  let cid = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    req.logger.debug(`No se ingreso un id valido para el carrito`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido para el carrito...!!!` });
  }


  try {
    const existe = await cartsModelo.findOne({ _id: cid });

    if (!existe) {
      req.logger.debug(`No existe un carrito con id ${cid}`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No existe un carrito con id ${cid}` });
    }

    // validar si el carrito contiene productos
    const productosArray = existe.products;

    if(productosArray.length<1){
      req.logger.fatal(`No se generó el ticket dado que el carrito se encuentra vacío`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No es posible generar el ticket dado que el carrito se encuentra vacío` });
    }

    let productosTicket = [];
    let productosCarrito = [];
    let productosCarritoV = [];

    // Verificar el stock y guardar los IDs de productos en los arrays correspondientes
    for (const product of productosArray) {
        const productData = await productsModelo.findById(product.idProducto);

        if (!productData) {
          req.logger.debug(`el Producto con ID ${product.idProducto} no se encontró`)
          return res.status(404).json({ message: `el Producto con ID ${product.idProducto} no se encontró` });
        }

        if (productData.stock >= product.quantity) {
          productosTicket.push(product);

          // Reducir el stock del producto en la base de datos
          await productsModelo.findByIdAndUpdate(product.idProducto, { $inc: { stock: -product.quantity } });
        } else {
          productosCarrito.push(product.idProducto.toString());
          productosCarritoV.push({ idProducto: product.idProducto, quantity: product.quantity });
        }
    }

    let usuario = [];
    if (productosTicket.length > 0) {
      usuario = await usuariosModelo.findOne({cart : cid}).lean();

      if (!usuario) {         
        req.logger.fatal("Usuario no encontrado");
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Calcular el monto total de la compra
      let amountTotal = 0;

      for (const product of productosTicket) {
        const productData = await productsModelo.findOne({_id: product.idProducto.toString()});
        amountTotal = amountTotal + (productData.price * product.quantity);
      }

      const newTicket = new ticketsModelo({
          purchase_datetime: new Date(),
          amount: amountTotal,
          purchaser: usuario.email
      });

    await newTicket.save();

    let promiseTicket = await ticketsModelo.findOne({purchaser: usuario.email, purchase_datetime: newTicket.purchase_datetime}).lean();
      
    cartsModelo.findByIdAndUpdate({_id: cid}, { products: productosCarritoV }, { new: true })
    .then(carritoActualizado => {
      req.logger.info("Carrito actualizado:", carritoActualizado);
      // console.log("Carrito actualizado:", carritoActualizado);
    })
    .catch(error => {

      console.error("Error al actualizar el carrito:", error);
    });

      if(productosCarrito.length > 0){
        promiseTicket = {
          compra: "parcial",
          ...promiseTicket
        }    
        // console.log(promiseTicket);
        req.logger.info(JSON.stringify(promiseTicket));
        return res.status(200).json(promiseTicket);
      }else{
        promiseTicket = {
          compra: "total",
          ...promiseTicket
        }    
        req.logger.info(JSON.stringify(promiseTicket));
        return res.status(200).json(promiseTicket);
      } 
    }else {
      let promiseTicket = {
        compra: "sinStock"
      }    
      req.logger.info(JSON.stringify(promiseTicket));
      return res.status(200).json(promiseTicket);
    }   
    }
  catch(error) {
    req.logger.fatal("Error interno del servidor");
    // console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
  
});

router.put("/:cid/products/:pid", async (req, res) => {
  let cid = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    req.logger.error(`El id ${cid } no es válido para el carrito...!!!`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido para el carrito...!!!` });
  }
  // validar que el id del carrito exista
  let existe;
  try {
    existe = await cartsModelo.findOne({ _id: cid });
  } catch (error) {
    req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      detalle: error.message});
  }

  if (!existe) {
    req.logger.error(`No existe un carrito con id ${cid}`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe un carrito con id ${cid}` });
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
      req.logger.fatal("Se debe enviar la cantidad del producto a modificar (quantity)");
      res.status(400).send("Se debe enviar la cantidad del producto a modificar (quantity)");
      return;
    }

    for (const key in requestBody) {
      if (clavesPermitidas.includes(key)) {
        cantNueva = parseInt(requestBody[key]);
      } else {
        req.logger.error(`La única clave aceptada es quantity...!!!`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `La única clave aceptada es quantity...!!!` });
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
        req.logger.info(`La Actualización del carrito ${cid} fue realizada con éxito.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Actualización realizada con éxito" });
      } else {
        req.logger.error(`No se concretó la actualización del carrito ${cid}.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la actualización` });
      }
    } catch (error) {
      req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message});
    }
  } else {
    let pid = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      req.logger.error(`El id ${pid} no es un producto existente en el carrito...!!!`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Ingrese un producto existente en el carrito...!!!` });
    }
  }
});

router.put("/:cid", async (req, res) => {
  let cid = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    req.logger.error(`El id ${cid} no es válido para el carrito...!!!`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido para el carrito...!!!` });
  }
  // validar que el id del carrito exista
  let existe;
  try {
    existe = await cartsModelo.findOne({ _id: cid });
  } catch (error) {
    req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
  }

  if (!existe) {
    req.logger.debug(`No existe un carrito con id ${cid}`)
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe un carrito con id ${cid}` });
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

  // console.log(noExisten);
  // console.log(siExisten);

  if (siExisten.length === 0) {
    req.logger.debug("Ninguno de los productos existen. No se pueden agregar al carrito")
    res.status(400).send("Ninguno de los productos existen. No se pueden agregar al carrito");
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
      req.logger.info(`Se agregaron al carrito los productos: ${siExistenV}. Los productos ${noExisten} no se pueden agregar al carrito.`);
      res.status(200).send(`Se agregaron al carrito los productos: ${siExistenV}. Los productos ${noExisten} no se pueden agregar al carrito.`);
    } else {
      req.logger.info(`Se agregaron al carrito los productos: ${siExistenV}.`);
      res.status(200).send(`Se agregaron al carrito los productos: ${siExistenV}.`);
    }
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  let cid = req.params.cid;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    req.logger.fatal(`El id ${cid} no es válido para el carrito`);
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido para el carrito...!!!` });
  }

  // validar que el id del carrito exista
  let existe;
  try {
    existe = await cartsModelo.findOne({ _id: cid });
  } catch (error) {
    req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
  }

  if (!existe) {
    req.logger.debug(`No existe un carrito con id ${cid}`)
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe un carrito con id ${cid}` });
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
        req.logger.info(`El producto ${pid} fue eliminado correctamente del carrito ${cid}.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Elemento eliminado correctamente." });
      } else {
        req.logger.error(`No se concretó la eliminación del producto`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la eliminación del producto` });
      }
    } catch (error) {
      req.logger.error("Error al eliminar el elemento:", error);
      // console.error("Error al eliminar el elemento:", error);
    }
  } else {
    let pid = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      req.logger.fatal(`Ingrese un id válido para el producto...!!!`);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Ingrese un id válido para el producto...!!!` });
    }
  }
});

router.delete("/:cid", CartsController.deleteProducto);

export {io};
export default router;
