import { Router } from "express";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { creaHash, validaPassword } from "../util.js";
import { MiRouter } from "./router.js";
import passport from "passport";
import { passportCall } from "../util.js";
export const router = Router();

// router.get("/errorLogin", (req, res) => {
//   return res.redirect("/login?error=Error en el proceso de login...");
// });

// router.post(
//   "/login",
//   passport.authenticate("login", {
//     failureRedirect: "/api/sessions/errorLogin"
//   }),
//   async (req, res) => {
//     console.log(req.user);

//     if (req.user.id === 0) {
//       req.session.usuario = {
//         email: req.user.username
//       };
//     } else {
//       req.session.usuario = {
//         nombre: req.user.nombre,
//         apellido: req.user.apellido,
//         email: req.user.email
//       };
//     }

//     res.redirect("/products");
//   }
// );

// router.get("/errorRegistro", async (req, res) => {
//   return res.redirect("/registro?error=Error en el proceso de registro");
// });

// router.post(
//   "/registro",
//   passport.authenticate("registro", {
//     failureRedirect: "/api/sessions/errorRegistro"
//   }),
//   async (req, res) => {
//     let { email } = req.body;

//     res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
//   }
// );

// router.get("/logout", async (req, res) => {
//   console.log("---------------");

//   let logueoGit = req.user;

//   try {
//     let nombre, email;
//     if (logueoGit.profile.provider === "github") {
//       nombre = logueoGit.nombre;
//       email = logueoGit.email;
//       console.log(nombre, email);
//     }

//     let usuario = await usuariosModelo.deleteOne({
//       nombre,
//       email
//     });

//     console.log(usuario);
//   } catch (error) {
//     console.log("Ocurrió un error inesperado en la base de datos");
//   }

//   req.session.destroy((error) => {
//     if (error) {
//       res.redirect("/login?error=fallo en el logout");
//     }
//   });

//   res.redirect("/login");
// });

// router.get("/github", passport.authenticate("github", {}), (req, res) => {});

// router.get(
//   "/callbackGithub",
//   passport.authenticate("github", {
//     failureRedirect: "/api/sessions/errorGitHub"
//   }),
//   (req, res) => {
//     console.log(req.user);
//     req.session.usuario = req.user;

//     res.redirect("/products");
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
      return res.successAlta("Registro correcto...!!!", req.user);
    });

    // this.post("/login", ["PUBLIC"], passportCall("login"), (req, res) => {
    //   let token = generaToken(req.user);
    //   res.cookie("coderCookie", token, {
    //     httpOnly: true,
    //     maxAge: 1000 * 60 * 60
    //   });
    //   return res.success(
    //     `Login correcto para el usuario ${req.user.nombre}, con rol: ${req.user.rol}`
    //   );
    // });
  }
}
