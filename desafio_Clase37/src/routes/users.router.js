import { Router } from "express";
import { io } from "../app.js";
import path from "path";
import fs from "fs";
import __dirname from "../util.js";
import mongoose from 'mongoose';
import { usuariosService } from "../services/usuarios.service.js";

export const router = Router();

router.put("/premium/:uid", async (req, res) => {
    let uid = req.params.uid;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
        req.logger.debug(`El id ${uid} no corresponde a un usuario existente...!!!`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({error: `El id ingresado no corresponde a un usuario existente...!!!`});
    }

    let existe;
    try {
        existe = await usuariosService.getUsuarioById(uid);
    } catch (error) {
        req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message});
    }

    if (!existe) {
        req.logger.error(`No existe un usuario con id ${uid}`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No existe un usuario con id ${uid}` });
    }


    if (existe.role !== "user" && existe.role !== "premium"){
        req.logger.error(`No se puede cambiar el rol del usuario (el rol debe ser user o premium)`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se puede cambiar el rol del usuario (el rol debe ser user o premium)` });
    }

    // console.log(existe);

    let nuevoRol;
    if(existe.role === "user")
        nuevoRol = "premium";
    else
        nuevoRol = "user";

    let resultado;
    try {
        resultado = await usuariosService.updateUsuario(uid, nuevoRol);

    if (resultado.modifiedCount > 0) {
        req.logger.info(`El usuario con ${uid} cambio su estado a ${nuevoRol}`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ payload: "Actualización de rol de usuario realizada con éxito" });
    } else {
        req.logger.warning(`No se concretó la actualización del usuario ${uid}.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No se concretó la actualización` });
    }
    } catch (error) {
        req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
        detalle: error.message});
    }

});

export default router;
