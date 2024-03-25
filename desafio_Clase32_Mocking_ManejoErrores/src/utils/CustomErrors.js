
export class CustomError{
    static CustomError(nombre, mensaje, statusCode, codigoInterno, descripcion=""){
        let error = new Error(mensaje)
        error.name = nombre
        error.codigo = statusCode
        error.codigoInterno = codigoInterno
        error.descripcion = descripcion

        return error    
    }
}

export class OtroCustomError extends Error{
    constructor(nombre, mensaje, statusCode, descripcion){
        super(mensaje)
        this.name = nombre
        this.codigo = statusCode
        this.descripcion = descripcion
    }
}
