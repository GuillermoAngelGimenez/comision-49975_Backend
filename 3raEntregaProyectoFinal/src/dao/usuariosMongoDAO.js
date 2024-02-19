import mongoose from "mongoose"
import { usuariosModelo } from "./models/managerUsuarios.js"
import { cartsModelo } from "./models/managerCarts.js"
import { config } from "../config/config.js"
import { Conexion } from "../conexion.js"

// try {
//   await mongoose.connect(
//     config.MONGO_URL, { dbName: config.DBNAME }
//   );
//   console.log("DB Online...!!!");
// } catch (error) {
//   // console.log(error.usuario);
//   console.log(error.message);
// }

Conexion.conectarDB(config.MONGO_URL, config.DBNAME);


export class UsuariosMongoDAO{
    async get(){
        return usuariosModelo.find()
    }

    async getByEmail(email){
      let usuario;
      usuario = await usuariosModelo.findOne({email}).lean();

      if (usuario  === null)
        return null;

      let cartId;
      if (usuario.cart) {
        cartId = usuario.cart.toString();
      } else {
        // Si usuario.cart es undefined o null, asigna un valor por defecto o maneja la situación según tus requerimientos
        cartId = ''; // O cualquier valor por defecto que desees
      }

      let nuevoUsuario = {
        ...usuario,
        cartId
      }
    //   console.log(nuevoUsuario);
      return nuevoUsuario;
    }

    async getById(id){
      let usuario;
      usuario = await usuariosModelo.findOne({_id: id });

      if (usuario  === null)
        return null;

      return nuevoUsuario;
    }

    async create(usuario){
        return await usuariosModelo.create(usuario)
    }
}