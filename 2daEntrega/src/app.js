import express from "express";
import __dirname from "./util.js";
import path from "path";
import { engine } from "express-handlebars";
import { router as productosRouterVista } from "./routes/productosRouterVista.js";
import routerProductos from "./routes/products.router.js";
import routerCarts from "./routes/carts.router.js";
import { Server } from "socket.io";
import { httpSocket } from "./middleware/socket.js";

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

const io = new Server(serverHTTP);

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Nuevo Cliente conectado con id ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});
