import { UsuariosMongoDAO as DAO } from "../dao/usuariosMongoDAO.js";

class UsuariosService{
    constructor(dao){
        this.dao = new dao();
    }

    async getUsuarios(){
        return await this.dao.get();
    }

    async getUsuarioByEmail(email){
        return await this.dao.getByEmail(email);
    }

    async getUsuarioById(id){
        return await this.dao.getById(id);
    }

    async createUsuario(usuario){
        return await this.dao.create(usuario);
    }

}

export const usuariosService = new UsuariosService(DAO);