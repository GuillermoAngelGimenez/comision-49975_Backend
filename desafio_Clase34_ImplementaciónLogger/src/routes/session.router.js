import { Router } from "express";
import { passportCall, generaToken, verificarToken } from "../util.js";
import passport from "passport";
import { MiRouter } from "./router.js";
import usuarioDTO from "../dao/DTOs/usuario.dto.js";
import { Strategy as GitHubStrategy } from 'passport-github2';
import { usuariosService } from "../services/usuarios.service.js";

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
      // if (!req.user) {
      //   const errorMessage = req.authInfo.message; // Captura el mensaje de error
      //   res.render("login", { error: errorMessage });
      //   return;
      // }

      let token = generaToken(req.user);

      res.cookie("ecommerce", token, {httpOnly: true, maxAge: 1000 * 60 * 60});
      
      if (req.headers['content-type'] === 'application/json') {
        // console.log("hola en la API")
        res.success(`Login correcto para el usuario: ${req.user.email}, con rol:${req.user.role}`); 
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

      const { _id, __v, iat, exp, ...usuarioSinCampos } = usuario;
      
      const newUsuario = new usuarioDTO({usuarioSinCampos})

      res.success(newUsuario);

    });

    this.get("/logout", ["PUBLIC"], (req, res) => {
      res.clearCookie("ecommerce");
      res.redirect("/login");
    });

    // this.get("/github", ["PUBLIC"], passportCall("github"), (req, res) => {
     
    // });
    
    // this.get("/callbackGithub", ["PUBLIC"], (req, res) => {
    //     console.log(req.user);
    //     const token = generaToken(req.user)
    //     res.cookie("ecommerce", token, {httpOnly: true, maxAge: 1000 * 60 * 60});

    //     // const usuario = verificarToken(req.cookies.ecommerce);
    //     // res.success(usuario);
    //     // console.log(usuario);

    //     res.redirect("/products");
    //   }
    // );

    passport.use(new GitHubStrategy({
      clientID: "Iv1.38bd9ed162be36e1",
      clientSecret: "c301e75df7203dee2697f43aaf853624deaf6f3f",
      callbackURL: "http://localhost:8080/api/sessions/callbackGithub"
    },
    function(accessToken, refreshToken, profile, done) {
      // Aquí puedes realizar acciones con el perfil del usuario, como recuperar su email
      let usuario = {
        first_name: profile._json.name,
        cart: "",
        role: "user-anonimo"
      };

      // const usuario = profile.emails[0].value;
      return done(null, usuario); // Pasamos el email como usuario autenticado
    }
    // async (accessToken, refreshToken, profile, done) => {
    //   try {
    //     let usuario = await usuariosService.getUsuarioByEmail(profile._json.email); ;
  
    //     if (!usuario) {
    //       let nuevoUsuario = {
    //         first_name: profile._json.name,
    //         email: profile._json.email,
    //         profile
    //       };
  
  
    //       // usuario = await usuariosModelo.create(nuevoUsuario);
    //       usuario = await usuariosService.createUsuario(nuevoUsuario);
    //     }
  
    //     return done(null, usuario);
    //   } catch (error) {
    //     return done(error);
    //   }
    // }
  ));
  
  // Serialización y deserialización de usuario para la sesión
  passport.serializeUser(function(usuario, done) {
    done(null, usuario);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  })
  
  
  // Ruta de inicio de sesión de GitHub
  this.get("/github", ["PUBLIC"], passport.authenticate('github', { scope: ['user:email'] }));
  
  // Ruta de callback de GitHub para manejar la autenticación
  this.get("/callbackGithub", ["PUBLIC"], passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      // Creamos la cookie con el email del usuario
      const token = generaToken(req.user)
      res.cookie("ecommerce", token, {httpOnly: true, maxAge: 1000 * 60 * 60});
      // Redireccionamos a la página de productos
      res.redirect("/products");
    });
    

  }
}