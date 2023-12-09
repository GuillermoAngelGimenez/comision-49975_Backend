const socket = io();

socket.on("connect", () => {
  console.log("Conectado al socket");
});

socket.on("resultado", () => {
  console.log("Resultado:");
});

socket.on("add", (product) => {
  console.log(product);
  console.log("me agrego");

  let ullistaProd = document.querySelector("ul");
  let lielemProd = document.createElement("li");
  let lielemhr = document.createElement("hr");

  lielemProd.setAttribute("data-id", product.id);
  lielemProd.innerHTML = `Título: <strong>${product.title}</strong> - Descripción: ${product.description} - Precio: ${product.price}`;
  ullistaProd.innerHTML += lielemProd.outerHTML;
});

socket.on("delete", (productId) => {
  console.log("llegue aca");
  let ullistaProd = document.querySelector("ul");

  let lilistaProd = ullistaProd.getElementsByTagName("li");

  for (var i = 0; i < lilistaProd.length; i++) {
    let li = lilistaProd[i];

    let dataId = li.getAttribute("data-id");

    console.log(dataId);
    console.log(productId);
    if (dataId === productId) {
      console.log("es igual");
      li.remove();
      break;
    }
  }
});
