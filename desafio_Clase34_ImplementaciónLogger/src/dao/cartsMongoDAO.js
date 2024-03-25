import mongoose from "mongoose"
import { cartsModelo } from "./models/managerCarts.js";
// import { config } from "../config/config.js"
// import { Conexion } from "../conexion.js"

// Conexion.conectarDB(config.MONGO_URL, config.DBNAME);

export class CartsMongoDAO{
    async get(){
        return await cartsModelo.find().populate("products.idProducto")
    }

    async getByPopulate(id){
      return await cartsModelo.findOne({ _id: id }).populate("products.idProducto").lean()
    }

    async getBy(id){
      return await cartsModelo.findOne({_id: id });
    }

    async create(carrito){
      return await cartsModelo.create(carrito)
    }

    async delete(id){
      return await cartsModelo.updateOne({ _id: id }, { $set: {products: [], }, });
    }

}