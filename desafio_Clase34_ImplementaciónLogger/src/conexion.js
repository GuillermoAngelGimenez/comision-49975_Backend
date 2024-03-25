import mongoose from "mongoose";

export class Conexion{
    static #instancia
    constructor(url, dbname){
        mongoose.connect(url, { dbName: dbname })
    }

    static conectarDB(url, dbname){
        if(this.#instancia){
            console.log(`La conexión ya fue establecida con anterioridad...!!!`)
            return this.#instancia
        }
        this.#instancia=new Conexion(url, dbname)
        console.log(`DB Online...!!!`)
        return this.#instancia

    }
}

