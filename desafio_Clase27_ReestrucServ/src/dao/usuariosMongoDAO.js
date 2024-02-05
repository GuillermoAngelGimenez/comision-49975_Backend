import mongoose from "mongoose"
import { usuariosModelo } from "./models/managerUsuarios.js"
import { config } from "../config/config.js"

try {
  await mongoose.connect(
    config.MONGO_URL, { dbName: config.DBNAME }
  );
  console.log("DB Online...!!!");
} catch (error) {
  // console.log(error.usuario);
  console.log(error.message);
}


export class UsuariosMongoDAO{
    async get(){
        return usuariosModelo.find()
    }

    async getBy(email){
      let usuario;
      return usuario = await usuariosModelo.findOne({email}).lean();
    }

    async create(usuario){
        return await usuariosModelo.create(usuario)
    }
}