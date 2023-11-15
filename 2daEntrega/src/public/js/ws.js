const socket = io();

socket.on("connect", () => {
  console.log("Conectado al socket");
});

socket.on("resultado", () => {
  console.log("Resultado:");
});

socket.on("add", (product) => {
  console.log(product);
  const hr = document.getElementById("test");
  const div = document.createElement("div");

  div.textContent = `${product.title}`;

  hr.innerHTML += div.outerHTML;
});
