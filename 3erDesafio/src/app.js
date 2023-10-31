const express = require("express");

const ProductManager = require("./productManager");
const pm = new ProductManager("../archivos/products.json");

const PORT = 8080;

const app = express();

const productos = [
  {
    id: 1,
    title: "Moto E20",
    description:
      "Cámara trasera 13 mpx con flash LED | Dual | Zoom digital 4x, Display 6.52'' HD+, Procesador Octa Core 1.6 GHz",
    price: 78299,
    thumbnail: "Sin imagen",
    code: "AB70009363",
    stock: 25
  },
  {
    id: 2,
    title: "Samsung Galaxy A04 64GB",
    description:
      "Cámara trasera 50 mpx con Flash LED | Dual | Zoom digital 10x, Display 6.5'' HD+, Procesador Octa Core 2.3GHz,1.8GHz ",
    price: 129999,
    thumbnail: "Sin imagen",
    code: "AB70010723",
    stock: 18
  },
  {
    id: 3,
    title: "Daewoo TWS Nova Auriculares Bluetooth",
    description:
      "Modelo Nova, Manos Libres, In Ear, Compatibilidad Android / iOS",
    price: 10499,
    thumbnail: "Sin imagen",
    code: "AB7005669",
    stock: 40
  },
  {
    id: 4,
    title: "Moto E13 64GB",
    description:
      "Cámara trasera 13 mpx con flash LED | Zoom digital 4x, Display 6.5'' HD+ IPS, Procesador Octa Core 1.6 GHz",
    price: 82799,
    thumbnail: "Sin imagen",
    code: "AB70011400",
    stock: 8
  },
  {
    id: 5,
    title: "SanDisk ultra memoria",
    description:
      "Rendimiento de Hasta 100 MBs de velocidad de lectura, Almacenamiento 32 GB, Dimensiones 14,99 x 10,92 x 1,02 mm",
    price: 3679,
    thumbnail: "Sin imagen",
    code: "AB7001534",
    stock: 38
  },
  {
    id: 6,
    title: "SanDisk ultra memoria",
    description:
      "Rendimiento de Hasta 100 MBs de velocidad de lectura, Almacenamiento 128 GB, Dimensiones 14,99 x 10,92 x 1,02 mm",
    price: 13599,
    thumbnail: "Sin imagen",
    code: "AB7003560",
    stock: 41
  },
  {
    id: 7,
    title: "Huawei Band 7",
    description:
      "Resistencia al agua IP67, Pantalla 44.35 x 26 x 9.99 mm, Batería 336 hs",
    price: 39.999,
    thumbnail: "Sin imagen",
    code: "AB7004561",
    stock: 15
  },
  {
    id: 8,
    title: "Samsung Galaxy Z Flip5 5G 256GB",
    description:
      "Cámara trasera 12 mpx con Flash LED | Dual | Zoom digital 10x | Zoom optico 2x, Display 6.7'' FHD+ Super Amoled, Procesador Octa Core 3.36GHz,2.8GHz,2GHz",
    price: 799999,
    thumbnail: "Sin imagen",
    code: "AB70011637",
    stock: 9
  },
  {
    id: 9,
    title: "Maxell Soporte para Escritorio",
    description:
      "Modelo 3POD, Compatibilidad Universal, Tipo de agarre Mecánico, Rotación 360°",
    price: 11999,
    thumbnail: "Sin imagen",
    code: "AB7005836",
    stock: 48
  },
  {
    id: 10,
    title: "Dekkin Cargador de Pared 18W",
    description: "Modelo 2 AC, Material Plástico, Potencia de salida 18W",
    price: 8699,
    thumbnail: "Sin imagen",
    code: "AB7005695",
    stock: 72
  },
  {
    id: 11,
    title: "Dekkin Parlante 012 Bluetooth",
    description:
      "Resistencia al agua IPX5, Batería de 4 a 6 hs, Dimensiones 62 x 95 mm",
    price: 13599,
    thumbnail: "Sin imagen",
    code: "AB7005697",
    stock: 61
  }
];

// const productos = await pm.getProductos();
// const entorno = async () => {
//   try {
//     console.log(await pm.getProducts());
//     resultados = await pm.getProducts();
//   } catch (err) {
//     console.log(err.message);
//   }
// };

// entorno();

app.get("/products", (req, res) => {
  // let resultado = pm.getProducts();
  let resultado = productos;

  if (req.query.limit) {
    resultado = resultado.slice(0, req.query.limit);
  }

  res.setHeader("Content-Type", "application/json");
  // res.status(200).json({ filtros: req.query, resultado });
  res.status(200).json({ resultado });
});

app.get("/products/:pid", (req, res) => {
  let id = req.params.pid;

  id = parseInt(id);

  if (isNaN(id)) {
    return res.send("Error, ingrese un argumento id numérico");
  }

  let resultado = productos.find((prod) => prod.id === id);

  res.setHeader("Content-Type", "application/json");

  if (!resultado) {
    res.send("El número ingresado no corresponde a un id existente");
  } else {
    res.status(200).json({ resultado });
  }
});

const server = app.listen(PORT, () => {
  console.log(`El servidor esta en linea en el puerto ${PORT}`);
});
