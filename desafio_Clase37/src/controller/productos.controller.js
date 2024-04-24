import {isPremiumCreate, isAdminoPremium} from "../middleware/authadmin.js";
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
          resultado = await productosService.getProductosPaginate();
        } catch (error) {
          req.logger.error("Error al obtener los productos paginados: " + error);
          // console.log(error);
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
          prevLink: prevL,
          nextLink: nextL,
        };
    
        //------------------
        req.logger.info(JSON.stringify(objetoMongoDB));
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ objetoMongoDB });
      } else if (req.query.limit) {
        resultado = await productosService.getProductos();
        resultado = resultado.slice(0, req.query.limit);

        req.logger.info(JSON.stringify(resultado));
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ resultado });
      } else if (sortparam) {
        if (sortparam === "asc") {
          req.logger.info("Ordenamiento de productos de forma ascendente");
          // console.log("ascendente");
          resultado = await productsModelo.aggregate([{ $sort: { price: 1 } }]);

          req.logger.info(JSON.stringify(resultado));
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({ resultado });
        } else if (sortparam === "desc") {
          req.logger.info("Ordenamiento de productos de forma descendente");
          resultado = await productsModelo.aggregate([{ $sort: { price: -1 } }]);

          req.logger.info(JSON.stringify(resultado));
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({ resultado });
        } else {
          req.logger.error("El parámetro sort debe ser asc o desc.");
          return res.status(400).json({ error: "El parámetro sort debe ser asc o desc." });
        }
      } else if (req.query) {
        let paramQuery = req.query;
    
        for (let clave in paramQuery) {
          if (paramQuery.hasOwnProperty(clave)) {
            let valor = paramQuery[clave];
    
            if (clave === "category") {
              resultado = await productosService.getProductosCategory(valor);

              req.logger.info(JSON.stringify(resultado));
              res.setHeader("Content-Type", "application/json");
              res.status(200).json({ resultado });
            }
    
            if (clave === "stock") {
              resultado = await productosService.getProductosStock(valor);

              req.logger.info(JSON.stringify(resultado));
              res.setHeader("Content-Type", "application/json");
              res.status(200).json({ resultado });
            }
          }
        }
    
        try {
          resultado = await productosService.getProductos();
          resultado = resultado.slice(0, 10);
          req.logger.info(JSON.stringify(resultado ));

          res.setHeader("Content-Type", "application/json");
          res.status(200).json({ resultado });
        } catch (error) {
          req.logger.error("Error en la obtención de productos: " + error);
          // console.log(error);
        }
      }
    }

    static async getProductosById(req, res){
      let { id } = req.params;
    
      if (!mongoose.Types.ObjectId.isValid(id)) {

        req.logger.debug(`No existe un producto con el id ${id}!!!`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `No existe un producto con el id ${id}!!!` });
      }
    
      let existe;
    
      try {
        existe = await productosService.getProductosById(id);
      } catch (error) {
        req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          detalle: error.message});
      }
    
      if (existe === null) {
        req.logger.debug(`El producto indicado con id ${id} no existe.`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(`El producto indicado con id ${id} no existe.`);
      } else {
        req.logger.info(JSON.stringify(existe));
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ producto: existe });
      }
    }

    static async createProducto(req, res){

      isPremiumCreate(req, res, async() => { 
        let products;
        try {
          products = await productosService.getProductosTodos();

        } catch (error) {
          req.logger.error("Error al obtener todos los productos: " + error.message);
          // console.log(error.message);
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
          req.logger.debug(`Faltan campos requeridos: ${missingFields.join(", ")}`);
          return res.status(400).json({ error: `Faltan campos requeridos: ${missingFields.join(", ")}` });
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
          req.logger.error("Formato inválido para el campo thumbnails");
          return res.status(400).json({ error: "Formato inválido para el campo thumbnails" });
        }
      
        if (invalidFields.length > 0) {
          req.logger.error(`Tipos de datos inválidos en los campos: ${invalidFields.join(", ")}`);
          return res.status(400).json({error: `Tipos de datos inválidos en los campos: ${invalidFields.join(", ")}`, });
        }
      
        // validar que no se repita el code
        let existe = false;
        try {
          existe = await productosService.getProductosByCode(body.code);
        } catch (error) {
          req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message});
        }
      
        if (existe) {
          req.logger.debug(`El producto con código ${body.code} ya existe en la BD...!!!`);
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({error: `El producto con código ${body.code} ya existe en la BD...!!!`});
        }
      
        let newProduct = { ...body, owner: req.user.email };

        // req.logger.info("Nuevo producto generado: ", newProduct);
        // console.log(newProduct);
      
        try {
          let nuevoProducto = await productosService.createProducto(newProduct);

          // console.log(nuevoProducto);
          io.emit("add", newProduct);

          req.logger.info(JSON.stringify(nuevoProducto));
          res.setHeader("Content-Type", "application/json");
          return res.status(201).json({ payload: nuevoProducto });
        } catch (error) {

          req.logger.error("Error al obtener el nuevo producto: " + error);
          // console.log("Error");

          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message + "ni idea "});
        }
      })

    }

    static async updateProducto(req, res){

      isAdminoPremium(req, res, async() => { 
        let { id } = req.params;
      
        if (!mongoose.Types.ObjectId.isValid(id)) {
          req.logger.debug(`El id ${id} no es un id válido...!!!`);
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({ error: `Ingrese un id válido...!!!` });
        }
      
        let existe;
        try {
          existe = await productosService.getProductosById(id);
        } catch (error) {
          
          req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message});
        }
      
        // WebSocket
        const io = req.app.get("io");
      
        const body = req.body;
      
        if (!body || Object.keys(body).length === 0) {
          req.logger.http("El cuerpo de la solicitud está vacío por lo cual no hay nada para editar en el producto");
          return res.status(400).json({error: "El cuerpo de la solicitud está vacío por lo cual no hay nada para editar en el producto"});
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
          req.logger.debug("El cuerpo de la solicitud contiene campos invalidos. Campos Invalidos: " + keysInvalidas.join(", ") + ".");
          return res.status(400).json({error: "El cuerpo de la solicitud contiene campos invalidos. Campos Invalidos: " + keysInvalidas.join(", ") + "." });
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
                  req.logger.debug("Formato inválido para el campo thumbnails");
                  return res.status(400).json({ error: "Formato inválido para el campo thumbnails" });
                }
              }
            }
            return acc;
          },
          []
        );
      
        if (invalidFields.length > 0) {
          req.logger.debug(`Tipos de datos inválidos en los campos: ${invalidFields.join(", ")}`);
          return res.status(400).json({error: `Tipos de datos inválidos en los campos: ${invalidFields.join(", ")}`});
        }
      
        // validar que no se repita el code ingresado respecto a existente
        existe = false;
        try {
          existe = await productosService.getProductosByCode(body.code);
        } catch (error) {
          
          req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message});
        }
      
        if (existe) {
          req.logger.debug(`El producto con código ${body.code} ya existe en BD...!!!`);
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({error: `El producto con código ${body.code} ya existe en BD...!!!`});
        }
      
        let resultado;
        try {
          resultado = await productosService.updateProducto(id, body);
      
          let productActualizado = await productosService.getProductosById(id);

          io.emit("update", productActualizado);
      
          if (resultado.modifiedCount > 0) {
            req.logger.info(`Modificacion realizada con éxito en el producto ${id}.`);
            res.setHeader("Content-Type", "application/json");
            return res.status(200).json({ payload: "Modificacion realizada con éxito." });
          } else {
            req.logger.warning(`No se concretó la modificación`);
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `No se concretó la modificación` });
          }
        } catch (error) {
          req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`});
        }
      });


      
    }

    static async deleteProducto(req, res){

      isAdminoPremium(req, res, async() => {     
        let { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
          req.logger.debug(`El id ${id} no corresponde a un producto existente...!!!`);
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({error: `El id ingresado no corresponde a un producto existente...!!!`});
        }
      
        let existe;
        try {
          existe = await productosService.getProductosById(id);

          if(req.user.role === 'premium'){
            if(req.user.email === existe.owner)
            console.log("soy premium y es mi producto");
          else
            console.log("soy premium pero no es mi producto");
          }
          if(req.user.role === 'admin')
            console.log("soy admin y puedo eliminar cualquier producto");
        
          // req.logger.info(`El producto con id ${id} fue eliminado`)
          // console.log("producto eliminado");
        } catch (error) {
          req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: error.message});
        }
      
        const io = req.app.get("io");
       
        let resultado;
        try {
          resultado = await productosService.deleteProducto(id);
      
          io.emit("delete", id);
      
          if (resultado.modifiedCount > 0) {
            req.logger.info(`La Eliminacion del producto con id ${id} se realizó con éxito.`);
            res.setHeader("Content-Type", "application/json");
            return res.status(200).json({ payload: "La Eliminacion se realizó con éxito." });
          } else {
            req.logger.warning(`No se concretó la eliminacion del producto ${id}`);
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ error: `No se concretó la eliminacion` });
          }
        } catch (error) {
          req.logger.fatal(`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, error.message);
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message});
        }
      
      });

    }

}