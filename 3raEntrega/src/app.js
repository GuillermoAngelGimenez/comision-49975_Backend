import express from "express";
import __dirname from "./util.js";
import path from "path";
import { engine } from "express-handlebars";
import { router as productosRouterVista } from "./routes/productosRouterVista.js";
import routerProductos from "./routes/products.router.js";
import routerCarts from "./routes/carts.router.js";
import { Server } from "socket.io";
import { httpSocket } from "./middleware/socket.js";

import mongoose from "mongoose";

import { messagesModelo } from "./dao/models/managerMessages.js";
// import mongoose from "mongoose";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));

app.use("/api/products", httpSocket, routerProductos);
app.use("/api/carts", routerCarts);
app.use("/", productosRouterVista);

const serverHTTP = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

export const io = new Server(serverHTTP);

let usuarios = [];
let mensajes = [];

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Se ha conectado un cliente con id ${socket.id}`);

  socket.on("id", (nombre) => {
    usuarios.push({ nombre, id: socket.id });
    socket.broadcast.emit("nuevoUsuario", nombre);
    socket.emit("Hola", mensajes);
  });

  socket.on("mensaje", (datos) => {
    usuarios.push(datos);
    io.emit("nuevoMensaje", datos);

    let { emisor, mensaje } = datos;
    let user = emisor;
    let message = mensaje;
    messagesModelo.create({ user, message });
  });

  socket.on("disconnect", () => {
    let usuario = usuarios.find((u) => u.id === socket.id);
    if (usuario) {
      io.emit("usuarioDesconectado", usuario.nombre);
    }
  });
});

try {
  await mongoose.connect(
    "mongodb+srv://angelgag:Tiziana1812@cluster0.wf69a4m.mongodb.net/?retryWrites=true&w=majority",
    { dbName: "ecommerce" }
  );

  console.log("DB Online...!!!");
} catch (error) {
  console.log(error.usuario);
}
