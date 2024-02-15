export default class usuarioDTO{
    constructor(usuario){  

        // Formatear la fecha
        const fechaAlta = new Date(usuario.usuarioSinCampos.FechaAlta);
        const fechaFormateada = `${fechaAlta.getDate()}/${fechaAlta.getMonth() + 1}/${fechaAlta.getFullYear()}`;

        // const newUsuario = {
        //     first_name: usuarioSinCampos.first_name,
        //     last_name: usuarioSinCampos.last_name,
        //     email: usuarioSinCampos.email,
        //     age: usuarioSinCampos.age,
        //     cart: usuarioSinCampos.cart,
        //     role: usuarioSinCampos.role,
        //     FechaAlta: fechaFormateada,
        //     cartId: usuarioSinCampos.cartId
        // };


        this.first_name= usuario.usuarioSinCampos.first_name,
        this.last_name= usuario.usuarioSinCampos.last_name,
        this.email= usuario.usuarioSinCampos.email,
        this.age= usuario.usuarioSinCampos.age,
        this.cart= usuario.usuarioSinCampos.cart,
        this.role= usuario.usuarioSinCampos.role,
        this.FechaAlta= fechaFormateada,
        this.cartId= usuario.usuarioSinCampos.cartId

    }

}