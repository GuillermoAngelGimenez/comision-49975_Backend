import { CartsMongoDAO as DAO } from "../dao/cartsMongoDAO.js";

class CartsService{
    constructor(dao){
        this.dao = new dao();
    }

    async getCarts(){
        return await this.dao.get();
    }

    async getCartById(id){
        return await this.dao.getBy(id);
    }

}

export const cartsService = new CartsService(DAO);