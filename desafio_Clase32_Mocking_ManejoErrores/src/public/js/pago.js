import {io} from '../../app.js';
const socket = io();

socket.on("connect", () => {
  console.log("Conectado al socket");
});

// Escuchar el evento WebSocket 'ticket-generado'
socket.on('ticket-generado', (ticketData) => {
  // console.log('Ticket generado:', ticketData);
  console.log("ticket leído");
  console.log({ticketData});

  // Aquí debes actualizar la interfaz de usuario con la información del ticket recibido
  const ticketContainer = document.getElementById('ticket-info-container');

  // Crear HTML para mostrar la información del ticket
  const ticketHTML = `
      <h3>Ticket generado</h3>
      <p><b>Fecha de compra:</b> ${ticketData.purchase_datetime}</p>
      <p><b>Monto total:</b> $${ticketData.amount}</p>
      <p><b>Comprador:</b> ${ticketData.purchaser}</p>
  `;

  // Actualizar el contenido del contenedor con la información del ticket
  ticketContainer.innerHTML = ticketHTML;
});


// socket.on("add", (product) => {
//   console.log("me agrego");

//   let ullistaProd = document.querySelector("ul");
//   let lielemProd = document.createElement("li");
//   let lielemhr = document.createElement("hr");

//   lielemProd.setAttribute("data-id", product.id);
//   lielemProd.innerHTML = `Título: <strong>${product.title}</strong> - Descripción: ${product.description} - Precio: ${product.price}`;
//   ullistaProd.innerHTML += lielemProd.outerHTML;
// });

// socket.on("update", (product) => {
//   let ullistaProd = document.querySelector("ul");

//   let lilistaProd = ullistaProd.getElementsByTagName("li");

//   let productId = product._id;

//   for (var i = 0; i < lilistaProd.length; i++) {
//     let li = lilistaProd[i];

//     let dataId = li.getAttribute("data-id");

//     if (dataId === productId) {
//       li.remove();

//       let ullistaProd = document.querySelector("ul");
//       let lielemProd = document.createElement("li");
//       let lielemhr = document.createElement("hr");

//       lielemProd.setAttribute("data-id", productId);
//       lielemProd.innerHTML = `Título: <strong>${product.title}</strong> - Descripción: ${product.description} - Precio: ${product.price}`;
//       ullistaProd.innerHTML += lielemProd.outerHTML;
//     }
//   }
// });

// socket.on("delete", (productId) => {
//   let ullistaProd = document.querySelector("ul");

//   let lilistaProd = ullistaProd.getElementsByTagName("li");

//   for (var i = 0; i < lilistaProd.length; i++) {
//     let li = lilistaProd[i];

//     let dataId = li.getAttribute("data-id");

//     if (dataId === productId) {
//       console.log("Se quito el producto " + productId);
//       li.remove();
//       break;
//     }
//   }
// });
