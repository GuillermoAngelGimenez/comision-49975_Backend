import { Router } from "express";
import { passportCall, generaToken, verificarToken } from "../util.js";
import passport from "passport";
import { MiRouter } from "./router.js";

// router.get("/errorRegistro", async (req, res) => {
//   return res.redirect("/registro?error=Error en el proceso de registro");
// });

// router.post("/registro", passport.authenticate("registro", {failureRedirect: "/api/sessions/errorRegistro"}),
//   async (req, res) => {
//     let { email } = req.body;
//     res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
//   }
// );

// router.get("/errorGitHub", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   res.status(200).json({
//     error: "Error al autenticar con GitHub"
//   });
// });

export class SessionsRouter extends MiRouter {
  init() {
    this.post("/registro", ["PUBLIC"], passportCall("registro"), (req, res) => { 
      if (req.headers['content-type'] === 'application/json') {
        return res.successAlta("Registro correcto...!!!", req.user);
      } else{
        res.redirect("/login");
      }
    });


    this.post("/login", ["PUBLIC"], passportCall("login"), (req, res) => {
      let token = generaToken(req.user);

      res.cookie("ecommerce", token, {httpOnly: true, maxAge: 1000 * 60 * 60});
      
      if (req.headers['content-type'] === 'application/json') {
        // console.log("hola en la API")
        res.success(`Login correcto para el usuario:${req.user.email}, con rol:${req.user.role}`); 
      } else {
        // console.log("hola en la interfaz")
        res.redirect("/products");
        // res.render("products", {rolUsuario: rolUsuario});
      }

    });

    this.get("/current", ["PUBLIC"], (req, res) => {
      // console.log(req);
      const usuario = verificarToken(req.cookies.ecommerce);
      // res.success(usuario);
      // return;
      // res.status(200).json(usuario);
      // return;

      // modificación en la respuesta
      const { _id, __v, iat, exp, ...usuarioSinCampos } = usuario;

      // Formatear la fecha
      const fechaAlta = new Date(usuario.FechaAlta);
      const fechaFormateada = `${fechaAlta.getDate()}/${fechaAlta.getMonth() + 1}/${fechaAlta.getFullYear()}`;

      const newUsuario = {
        first_name: usuarioSinCampos.first_name,
        last_name: usuarioSinCampos.last_name,
        email: usuarioSinCampos.email,
        age: usuarioSinCampos.age,
        cart: usuarioSinCampos.cart,
        role: usuarioSinCampos.role,
        FechaAlta: fechaFormateada,
        cartId: usuarioSinCampos.cartId
      };

      res.success(newUsuario);

    });

    this.get("/logout", ["PUBLIC"], (req, res) => {
      res.clearCookie("ecommerce");
      res.redirect("/login");
    });

    this.get("/github", ["PUBLIC"], passportCall("github"), (req, res) => {
          
    });
    
    this.get("/callbackGithub", ["PUBLIC"], (req, res) => {
        const token = generaToken(req.user)
        res.cookie("ecommerce", token, {httpOnly: true, maxAge: 1000 * 60 * 60});

        // const usuario = verificarToken(req.cookies.ecommerce);
        // res.success(usuario);
        // console.log(usuario);

        res.redirect("/products");
      }
    );

  }
}
