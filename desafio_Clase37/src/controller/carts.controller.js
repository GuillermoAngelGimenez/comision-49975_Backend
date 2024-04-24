import mongoose from "mongoose";
import { cartsService } from "../services/carts.service.js";


export class CartsController{
    constructor(){}

    static async getCarts(req, res) {
      let carritos = [];
      try {
        carritos = await cartsService.getCarts();
    
        if (req.query.limit) {
          carritos = carritos.slice(0, req.query.limit);
        }
      } catch (error) {
        req.logger.error(error.message);
        // console.log(error.message);
      }
    
      req.logger.info(carritos);
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(carritos);
    }

    static async getCartsById(req, res){
      let { id } = req.params;
    
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // req.logger.error({error: `El id ${id} no corresponde a ningún carrito existente...!!!`});
        req.logger.error(`El id ${id} no corresponde a ningún carrito existente...!!!`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({error: `EL Ids ${id} no corresponde a ningún carrito existente...!!!`});
      }
    
      let existe;
      try {
        // existe = await cartsModelo.findOne({ _id: id }).populate("products.idProducto").lean();
        existe = await cartsService.getCartByIdPopulate(id);
      } catch (error) {
        req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
      }

      req.logger.info(JSON.stringify(existe));
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(existe);
    }

    static async createCarrito(req, res){
      let carritos;
      try {
        // carritos = await cartsModelo.find();
        carritos = await cartsService.getCarts();
      } catch (error) {
        req.logger.error(error.message);
        // console.log(error.message);
      }
    
      const io = req.app.get("io");
    
      let newCarrito = {
        // id,
        products: [],
      };
    
      try {
        let nuevoCarrito = await cartsService.createCarrito(newCarrito);

        req.logger.info(JSON.stringify(nuevoCarrito));
        // console.log(nuevoCarrito);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: nuevoCarrito });
      } catch (error) {
        req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
      }
    }

    static async deleteProducto(req, res) {
      let cid = req.params.cid;
    
      if (!mongoose.Types.ObjectId.isValid(cid)) {
        req.logger.debug(`El Id ${cid} no corresponde a un valor válido para el carrito...!!!`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `Ingrese un id válido para el carrito...!!!` });
      }
    
      // validar que el id del carrito exista
      let existe;
      try {
        // existe = await cartsModelo.findOne({ _id: cid });
        existe = await cartsService.getCartById(cid);
        // console.log(existe);
      } catch (error) {
        req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
      }
    
      if (!existe) {
        req.logger.debug(`No existe un carrito con id ${cid}`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No existe un carrito con id ${cid}` });
      }
    
      if (existe.products.length === 0) {
        req.logger.warning(`El carrito ${cid} no contiene productos`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `El carrito indicado no contiene productos` });
      }
    
      try {
        // let carritoVaciado = await cartsModelo.updateOne({ _id: cid }, { $set: {products: [], }, });
        let carritoVaciado = await cartsService.deleteCarrito(cid);
    
        if (carritoVaciado.modifiedCount > 0) {
          req.logger.info(`Productos eliminados correctamente del carrito ${cid}.`);
          res.setHeader("Content-Type", "application/json");
          return res.status(200).json({ payload: "Productos eliminados correctamente del carrito." });
        } else {
          req.logger.error(`No se concretó la eliminación del producto en el carrito ${cid}.`);
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({ error: `No se concretó la eliminación del producto` });
        }
      } catch (error) {
        req.logger.error(`Error al eliminar los productos del carrito ${cid}`, error);
        // console.error("Error al eliminar los productos del carrito:", error);
      }
    }

}