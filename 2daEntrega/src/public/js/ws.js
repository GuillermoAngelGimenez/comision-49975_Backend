const socket = io();

socket.on("connect", () => {
  console.log("Conectado al socket");
});

socket.on("resultado", () => {
  console.log("Resultado:");
});

socket.on("add", (product) => {
  console.log(product);

  let ullistaProd = document.querySelector("ul");
  let lielemProd = document.createElement("li");
  let lielemhr = document.createElement("hr");

  lielemProd.setAttribute("data-id", product.id);
  lielemProd.innerHTML = `Título: <strong>${product.title}</strong> - Descripción: ${product.description} - Precio: ${product.price}`;
  ullistaProd.innerHTML += lielemProd.outerHTML;
});

socket.on("delete", (productId) => {
  let ullistaProd = document.querySelector("ul");

  let lilistaProd = ullistaProd.getElementsByTagName("li");

  for (var i = 0; i < lilistaProd.length; i++) {
    let li = lilistaProd[i];

    let dataId = li.getAttribute("data-id");

    if (parseInt(dataId) === productId) {
      li.remove();
      break;
    }
  }
});
