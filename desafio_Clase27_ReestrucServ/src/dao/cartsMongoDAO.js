import mongoose from "mongoose"
import { cartsModelo } from "./models/managerCarts.js";

export class CartsMongoDAO{
    async get(){
        return cartsModelo.find()
    }

    async getBy(id){
      let cart;
      return cart = await cartsModelo.findOne({id})
    }
}