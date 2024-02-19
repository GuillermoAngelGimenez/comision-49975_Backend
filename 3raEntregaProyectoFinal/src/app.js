import express from "express";
import __dirname from "./util.js";
import path from "path";
import { engine } from "express-handlebars";

import routerProductos from "./routes/products.router.js";
import routerCarts from "./routes/carts.router.js";
import { router as productosRouterVista } from "./routes/productosRouterVista.js";

import sessions from "express-session";
import mongoose from "mongoose";
import mongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";

// import { router as sessionRouter } from "./routes/session.router.js";
import { SessionsRouter } from "./routes/session.router.js";

import { inicializarPassport } from "./config/config.passport.js" ;
// import { initPassport } from "./config/config.passport.git.js";
          
import { Server } from "socket.io";
import { httpSocket } from "./middleware/socket.js";

import { messagesModelo } from "./dao/models/managerMessages.js";

import { config } from "./config/config.js";

import handlebarsHelpers from 'handlebars-helpers' 

const PORT = config.PORT;
const app = express();

handlebarsHelpers();

app.use(
  sessions({
    secret: "codercoder123",
    resave: true,
    saveUninitialized: true,
    store: mongoStore.create({mongoUrl: config.MONGO_URL}),
    mongoOptions: { dbName: config.DBNAME },
    // store: mongoStore.create({mongoUrl: "mongodb+srv://angelgag:Tiziana1812@cluster0.wf69a4m.mongodb.net/?retryWrites=true&w=majority",
    //   mongoOptions: { dbName: "ecommerce" },
      ttl: 3600
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(cookieParser());
inicializarPassport();
// initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.engine("handlebars", engine());
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));

app.use("/api/products", httpSocket, routerProductos);
app.use("/api/carts", routerCarts);
app.use("/", productosRouterVista);  

const sessionsRouter = new SessionsRouter();
// app.use("/api/sessions", sessionRouter);
app.use("/api/sessions", sessionsRouter.getRouter());

const serverHTTP = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});


// agregado para ticket 
// import { Server } from 'socket.io';
// import { httpSocket } from './middleware/socket.js';

// const serverHTTP = httpSocket.listen(PORT);
// const io = new Server(server);
// -----------


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