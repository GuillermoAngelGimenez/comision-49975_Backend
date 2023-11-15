console.log("hola, ws.js script...!!");

const socket = io();

socket.on("connect", () => {
  console.log("Conectado al socket");
});

socket.on("resultado", (productos) => {
  console.log("Resultado: " + productos);
});

// socket.on("Se agrego producto con éxito", (datos) => {
//   console.log(`Producto: ${datos}`);
// });

// socket.on("Se elimino al producto", (datos) => {
//   console.log(`Producto: ${datos}`);
// });
