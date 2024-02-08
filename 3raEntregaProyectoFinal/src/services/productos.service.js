import { ProductosMongoDAO as DAO} from "../dao/productosMongoDAO.js";

class ProductosService{
    constructor(dao){
        this.dao = new dao();
    }

    async getProductos(){
        return await this.dao.get();
    }

    async getProductosPaginate(){
        return await this.dao.getPaginate();
    }

    async getProductosCategory(valor){
        return await this.dao.getCategory(valor);
    }

    async getProductosStock(valor){
        return await this.dao.getStock(valor);
    }

    async getProductosById(id){
        return await this.dao.getById(id)
    }

    async getProductosTodos(){
        return await this.dao.getTodos();
    }

    async getProductosByCode(code){
        return await this.dao.getByCode(code)
    }
    
    async createProducto(producto){
        return await this.dao.create(producto)
    }

    async updateProducto(id, body){
        return await this.dao.update(id, body)
    }

    async deleteProducto(id){
        return await this.dao.delete(id)
    }

}

export const productosService = new ProductosService(DAO);