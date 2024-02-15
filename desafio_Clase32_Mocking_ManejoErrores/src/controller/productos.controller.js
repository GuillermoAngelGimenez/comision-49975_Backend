import {isAdmin} from "../middleware/authadmin.js";
import { productosService } from "../services/productos.service.js";
import mongoose from "mongoose";


export class ProductosController{
    constructor(){}

    static async getProductos(req, res){
      let productos = await productosService.getProductos();
      res.status(200).render("realTimeProducts", { productos });
    }


    static async getProductosValidation(req, res){
      let resultado = [];
      let pagina = 1;
      let sortparam = req.query.sort;
    
      if (req.query.pagina) {
        pagina = req.query.pagina;
    
        try {
          // resultado = await productsModelo.paginate({ deleted: false }, { lean: true, limit: 5, page: pagina });
          resultado = await productosService.getProductosPaginate();
          console.log(resultado);
        } catch (error) {
          console.log(error);
        }
    
        let { totalPages, hasNextPage, hasPrevPage, prevPage, nextPage } =
          resultado;
    
        let prevL =
          hasPrevPage === false
            ? null
            : `http://localhost:8080/api/products?pagina=${prevPage}`;
    
        let nextL =
          hasNextPage === false
            ? null
            : `http://localhost:8080/api/products?pagina=${nextPage}`;
    
        // generacion de objeto
        let objetoMongoDB = {
          status: "success/error",
          payload: resultado,
          // totalPages: totalPages,
          //   prevPage: prevPage,
          //   nextPage: nextPage,
          //   page: pagina,
          //   hasPrevPage: hasPrevPage,
          //   hasNextPage: hasNextPage,
          prevLink: prevL,
          nextLink: nextL,
        };
    
        //------------------
    
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ objetoMongoDB });
      } else if (req.query.limit) {
        resultado = await productosService.getProductos();
        resultado = resultado.slice(0, req.query.limit);
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ resultado });
      } else if (sortparam) {
        if (sortparam === "asc") {
          console.log("ascendente");
          resultado = await productsModelo.aggregate([{ $sort: { price: 1 } }]);
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({ resultado });
        } else if (sortparam === "desc") {
          resultado = await productsModelo.aggregate([{ $sort: { price: -1 } }]);
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({ resultado });
        } else {
          return res
            .status(400)
            .json({ error: "El parámetro sort debe ser asc o desc." });
        }
      } else if (req.query) {
        let paramQuery = req.query;
    
        for (let clave in paramQuery) {
          if (paramQuery.hasOwnProperty(clave)) {
            let valor = paramQuery[clave];
    
            if (clave === "category") {
              // resultado = await productsModelo.find({deleted: false, category: valor});
              resultado = await productosService.getProductosCategory(valor);
              res.setHeader("Content-Type", "application/json");
              res.status(200).json({ resultado });
            }
    
            if (clave === "stock") {
              // resultado = await productsModelo.find({deleted: false, stock: valor});
              resultado = await productosService.getProductosStock(valor);
              res.setHeader("Content-Type", "application/json");
              res.status(200).json({ resultado });
            }
          }
        }
    
        try {
          resultado = await productosService.getProductos();
          resultado = resultado.slice(0, 10);
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({ resultado });
        } catch (error) {
          console.log(error);
        }
      }
    }

    static async getProductosById(req, res){
      let { id } = req.params;
    
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `No existe un producto con el id ${id}!!!` });
      }
    
      let existe;
    
      try {
        // existe = await productsModelo.findOne({ deleted: false, _id: id });
        existe = await productosService.getProductosById(id);
        console.log(existe);
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          detalle: error.message,
        });
      }
    
      // if (!existe) {
      //   res.setHeader("Content-Type", "application/json");
      //   return res.status(400).json({ error: `No existe un usuario con id ${id}` });
      // }
    
      if (existe === null) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(`El producto indicado con id ${id} no existe.`);
      } else {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ producto: existe });
      }
    }

    static async createProducto(req, res){

      isAdmin(req, res, async() => { 
        let products;
        try {
          // products = await productsModelo.find();
          products = await productosService.getProductosTodos();
        } catch (error) {
          console.log(error.message);
        }
        // WebSocket
        const io = req.app.get("io");
      
        const body = req.body;
      
        const thumbnails = body.thumbnails || [];
        body.status = body.status || true;
      
        const requiredFields = [
          "title",
          "description",
          "price",
          "code",
          "stock",
          "category",
        ];
      
        const missingFields = requiredFields.filter((field) => !(field in req.body));
      
        if (missingFields.length > 0) {
          return res
            .status(400)
            .json({ error: `Faltan campos requeridos: ${missingFields.join(", ")}` });
        }
      
        const typeValidation = {
          title: "string",
          description: "string",
          price: "number",
          code: "string",
          stock: "number",
          category: "string",
          status: "boolean",
        };
      
        const invalidFields = Object.entries(typeValidation).reduce(
          (acc, [field, type]) => {
            if (body[field] !== undefined) {
              if (type === "array" && !Array.isArray(body[field])) {
                acc.push(field);
              } else if (typeof body[field] !== type) {
                acc.push(field);
              }
            }
            return acc;
          },
          []
        );
      
        if (!Array.isArray(thumbnails)) {
          return res
            .status(400)
            .json({ error: "Formato inválido para el campo thumbnails" });
        }
      
        if (invalidFields.length > 0) {
          return res.status(400).json({
            error: `Tipos de datos inválidos en los campos: ${invalidFields.join(
              ", "
            )}`,
          });
        }
      
        // validar que no se repita el code
        let existe = false;
        try {
          // existe = await productsModelo.findOne({deleted: false, code: body.code});
          existe = await productosService.getProductosByCode(body.code);
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message,
          });
        }
      
        if (existe) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({
            error: `El producto con código ${body.code} ya existe en la BD...!!!`,
          });
        }
      
        let newProduct = { ...body };
        console.log(newProduct);
      
        try {
          // let nuevoProducto = await productsModelo.create(newProduct);
          let nuevoProducto = await productosService.createProducto(newProduct);
          console.log(nuevoProducto);
          io.emit("add", newProduct);
          res.setHeader("Content-Type", "application/json");
          return res.status(201).json({ payload: nuevoProducto });
        } catch (error) {
          console.log("Error");
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message + "ni idea ",
          });
        }
      })

    }

    static async updateProducto(req, res){

      isAdmin(req, res, async() => { 
        let { id } = req.params;
      
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({ error: `Ingrese un id válido...!!!` });
        }
      
        let existe;
        try {
          // existe = await productsModelo.findOne({ deleted: false, _id: id });
          existe = await productosService.getProductosById(id);
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message,
          });
        }
      
        // WebSocket
        const io = req.app.get("io");
      
        // if (!existe) {
        //   res.setHeader("Content-Type", "application/json");
        //   return res
        //     .status(400)
        //     .json({ error: `No existe un producto con id ${id}` });
        // }
      
        const body = req.body;
      
        if (!body || Object.keys(body).length === 0) {
          return res.status(400).json({
            error:
              "El cuerpo de la solicitud está vacío por lo cual no hay nada para editar en el producto",
          });
        }
      
        const camposPermitidos = [
          "title",
          "description",
          "price",
          "code",
          "stock",
          "category",
          "status",
          "thumbnails",
        ];
      
        // Recorrer las claves y valores del cuerpo del objeto
        let keysInvalidas = [];
        for (const key in body) {
          if (body.hasOwnProperty(key)) {
            if (!camposPermitidos.includes(key)) {
              keysInvalidas.push(key);
            }
          }
        }
      
        if (keysInvalidas.length > 0) {
          return res.status(400).json({
            error:
              "El cuerpo de la solicitud contiene campos invalidos. Campos Invalidos: " +
              keysInvalidas.join(", ") +
              ".",
          });
        }
      
        const typeValidation = {
          title: "string",
          description: "string",
          price: "number",
          code: "string",
          stock: "number",
          category: "string",
          status: "boolean",
        };
      
        const invalidFields = Object.entries(typeValidation).reduce(
          (acc, [field, type]) => {
            if (body[field] !== undefined) {
              if (type === "array" && !Array.isArray(body[field])) {
                acc.push(field);
              } else if (typeof body[field] !== type) {
                acc.push(field);
              }
      
              if (body["thumbnails"]) {
                if (!Array.isArray(body["thumbnails"])) {
                  return res
                    .status(400)
                    .json({ error: "Formato inválido para el campo thumbnails" });
                }
              }
            }
            return acc;
          },
          []
        );
      
        if (invalidFields.length > 0) {
          return res.status(400).json({
            error: `Tipos de datos inválidos en los campos: ${invalidFields.join(
              ", "
            )}`,
          });
        }
      
        // validar que no se repita el code ingresado respecto a existente
        existe = false;
        try {
          // existe = await productsModelo.findOne({deleted: false, code: body.code});
          existe = await productosService.getProductosByCode(body.code);
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message,
          });
        }
      
        if (existe) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({
            error: `El producto con código ${body.code} ya existe en BD...!!!`,
          });
        }
      
        let resultado;
        try {
          // resultado = await productsModelo.updateOne({ deleted: false, _id: id }, body);
          resultado = await productosService.updateProducto(id, body);
      
          // let productActualizado = await productsModelo.findOne({deleted: false, _id: id});
          let productActualizado = await productosService.getProductosById(id);

          io.emit("update", productActualizado);
      
          if (resultado.modifiedCount > 0) {
            res.setHeader("Content-Type", "application/json");
            return res
              .status(200)
              .json({ payload: "Modificacion realizada con éxito." });
          } else {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `No se concretó la modificación` });
          }
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          });
          // return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
        }
      });
      
    }

    static async deleteProducto(req, res){

      isAdmin(req, res, async() => {     
        let { id } = req.params;
      
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({
            error: `El id ingresado no corresponde a un producto existente...!!!`,
          });
        }
      
        let existe;
        try {
          // existe = await productsModelo.findOne({ deleted: false, _id: id });
          existe = productosService.getProductosById(id);
          console.log("producto eliminado");
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message,
          });
        }
      
        const io = req.app.get("io");
      
        // if (!existe) {
        //   res.setHeader("Content-Type", "application/json");
        //   return res
        //     .status(400)
        //     .json({ error: `No existe un producto con id ${id}` });
        // }
      
        let resultado;
        try {
          // resultado = await productsModelo.updateOne({ deleted: false, _id: id }, { $set: { deleted: true } });
          resultado = await productosService.deleteProducto(id);
      
          io.emit("delete", id);
      
          if (resultado.modifiedCount > 0) {
            res.setHeader("Content-Type", "application/json");
            return res
              .status(200)
              .json({ payload: "La Eliminacion se realizó con éxito." });
          } else {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `No se concretó la eliminacion` });
          }
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message,
          });
        }
      
      });

    }

}