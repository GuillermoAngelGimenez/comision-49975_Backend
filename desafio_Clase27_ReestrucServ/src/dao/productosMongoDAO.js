import mongoose from "mongoose"
import { productsModelo } from "./models/managerProducts.js";
// import { config } from "../config/config.js"
// import { Conexion } from "../conexion.js"

// Conexion.conectarDB(config.MONGO_URL, config.DBNAME);

export class ProductosMongoDAO{
    async get(){
        return await productsModelo.find({ deleted: false })
    }

    async getPaginate(){
      return await productsModelo.find({ deleted: false }, { lean: true, limit: 5, page: pagina })
  } 

    async getCategory(valor){
      return await productsModelo.find({deleted: false, category: valor})
  }

  async getStock(valor){
    return await productsModelo.find({deleted: false, stock: valor})
  }

  async getById(id){
    return await productsModelo.findOne({ deleted: false, _id: id })
  }

  async getTodos(){
    return await productsModelo.find()
  }

  async getByCode(code){
    return await productsModelo.findOne({deleted: false, code: code})
  }
  
  async create(producto){
    return await productsModelo.create(producto)
  }

  async update(id, body){
    return await productsModelo.updateOne({ deleted: false, _id: id }, body);
  }

  async delete(id){
    return await productsModelo.updateOne({ deleted: false, _id: id }, { $set: { deleted: true } });
  }

}