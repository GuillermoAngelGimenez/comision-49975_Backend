const socket = io();

socket.on("connect", () => {
  console.log("Conectado al socket");
});

socket.on("resultado", () => {
  console.log("Resultado:");
});

socket.on("add", (product) => {
  console.log(product);
  // const hr = document.getElementById("test");
  // const div = document.createElement("div");

  // div.textContent = `${product.title}`;

  // hr.innerHTML += div.outerHTML;

  let ullistaProd = document.querySelector("ul");
  let lielemProd = document.createElement("li");
  // lielemProd.innerHTML = `Título: ${product.title} - Descripción: ${product.description} - Precio: ${product.price}`;
  lielemProd.innerHTML = `Título: ${product.title}`;
  ullistaProd.innerHTML += lielemProd.outerHTML;
});

socket.on("delete", (productId) => {
  let ullistaProd = document.querySelector("ul");
  let liProdDelete = document.querySelector(
    `li[data-product-id"${productId}"]`
  );

  if (liProdDelete) {
    ullistaProd.removeChild(liProdDelete);
  }
});
