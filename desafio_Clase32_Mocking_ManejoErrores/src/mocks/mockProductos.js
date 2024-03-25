import {fakerES_MX as faker} from '@faker-js/faker'

export const generaProducto=(cantidad)=>{
    const productos = [];

    for(let j=0; j<cantidad; j++){
        const product = {
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            code: faker.string.alphanumeric(10),
            price: faker.commerce.price({ min: 100, max: 400000,  dec: 2}),
            // price: faker.commerce.price({ min: 100, max: 400000, dec: 2, symbol: '$' }),
            status: faker.datatype.boolean(),
            stock: faker.number.int({min:1, max:300}),
            category: faker.commerce.department(),
            // thumbnails: [
            //     faker.image.imageUrl(),
            //     faker.image.imageUrl(),
            //     faker.image.imageUrl()
            // ]
        }

        productos.push(product)
    }
    return productos;

}



