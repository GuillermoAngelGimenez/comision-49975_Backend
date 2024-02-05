import { CartsMongoDAO as DAO } from "../dao/cartsMongoDAO.js";

class CartsService{
    constructor(dao){
        this.dao = new dao();
    }

    async getCarts(){
        return await this.dao.get();
    }

    async getCartByIdPopulate(id){
        return await this.dao.getByPopulate(id);
    }

    async getCartById(id){
        return await this.dao.getBy(id);
    }

    async createCarrito(carrito){
        return await this.dao.create(carrito)
    }

    async deleteCarrito(id){
        return await this.dao.delete(id)
    }


}

export const cartsService = new CartsService(DAO);