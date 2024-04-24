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

