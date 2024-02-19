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
        console.log(error.message);
      }
    
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(carritos);
    }

    static async getCartsById(req, res){
      let { id } = req.params;
    
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: `El id ${id} no corresponde a ningún carrito existente...!!!`,
        });
      }
    
      let existe;
      try {
        // existe = await cartsModelo.findOne({ _id: id }).populate("products.idProducto").lean();
        existe = await cartsService.getCartByIdPopulate(id);
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          detalle: error.message,
        });
      }
    
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(existe);
    }

    static async createCarrito(req, res){
      let carritos;
      try {
        // carritos = await cartsModelo.find();
        carritos = await cartsService.getCarts();
      } catch (error) {
        console.log(error.message);
      }
    
      const io = req.app.get("io");
    
      let newCarrito = {
        // id,
        products: [],
      };
    
      try {
        let nuevoCarrito = await cartsService.createCarrito(newCarrito);
        console.log(nuevoCarrito);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: nuevoCarrito });
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          detalle: error.message,
        });
      }
    }

    static async deleteProducto(req, res) {
      let cid = req.params.cid;
    
      if (!mongoose.Types.ObjectId.isValid(cid)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `Ingrese un id válido para el carrito...!!!` });
      }
    
      // validar que el id del carrito exista
      let existe;
      try {
        // existe = await cartsModelo.findOne({ _id: cid });
        existe = await cartsService.getCartById(cid);
        console.log(existe);
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          detalle: error.message,
        });
      }
    
      if (!existe) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `No existe un carrito con id ${cid}` });
      }
    
      if (existe.products.length === 0) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `El carrito indicado no contiene productos` });
      }
    
      try {
        // let carritoVaciado = await cartsModelo.updateOne({ _id: cid }, { $set: {products: [], }, });
        let carritoVaciado = await cartsService.deleteCarrito(cid);
    
        if (carritoVaciado.modifiedCount > 0) {
          res.setHeader("Content-Type", "application/json");
          return res
            .status(200)
            .json({ payload: "Productos eliminados correctamente del carrito." });
        } else {
          res.setHeader("Content-Type", "application/json");
          return res
            .status(400)
            .json({ error: `No se concretó la eliminación del producto` });
        }
      } catch (error) {
        console.error("Error al eliminar los productos del carrito:", error);
      }
    }

}