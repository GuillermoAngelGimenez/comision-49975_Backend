import os from 'os';

// export const errorArgumentos=({name, ...otros})=>{

//     // let {name, ...otros}=usuario

//     return `
// Error en argumentos:
// Argumentos obligatorios:
//     - name: esperado tipo string, recibido ${name}   
// Argumentos opcionales:
//     - powers, alias, team, publisher, recibidos ${JSON.stringify(otros)}

// Fecha: ${new Date().toUTCString()}
// Usuario: ${os.userInfo().username}
// `
// }

export const errorfaltanParam = (requiredFields, inputFields)=>{

    return `Error en argumentos:
    Argumentos obligatorios: ${requiredFields}
    Argumentos ingresados: ${inputFields}

    Fecha: ${new Date().toUTCString()}
    Usuario: ${os.userInfo().username}
    `
}