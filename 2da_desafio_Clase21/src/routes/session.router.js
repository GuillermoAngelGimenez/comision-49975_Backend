import { Router } from "express";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { creaHash, validaPassword } from "../util.js";
import passport from "passport";
// import crypto from "crypto";
export const router = Router();

router.get("/errorLogin", (req, res) => {
  return res.redirect("/login?error=Error en el proceso de login...");
});

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/errorLogin"
  }),
  async (req, res) => {
    // let { email, pass } = req.body;
    // if (!email || !pass) {
    //   return res.redirect("/login?error=Complete todos los datos");
    // }
    // if (email === "adminCoder@coder.com" && pass === "adminCod3r123") {
    //   req.session.usuario = {
    //     email: "adminCoder@coder.com"
    //   };
    //   res.redirect("/products");
    // } else {
    //   // let password = crypto
    //   //   .createHmac("sha256", "codercoder123")
    //   //   .update(pass)
    //   //   .digest("hex");
    //   let usuario = await usuariosModelo.findOne({ email });
    //   if (!usuario) {
    //     return res.redirect(
    //       `/login?error=Se ingresaron Credenciales Incorrectas`
    //     );
    //   }
    //   if (!validaPassword(usuario, pass)) {
    //     return res.redirect(
    //       `/login?error=Se ingresaron Credenciales Incorrectas`
    //     );
    //   }

    console.log(req.user);

    if (req.user.id === 0) {
      req.session.usuario = {
        email: req.user.username
      };
    } else {
      req.session.usuario = {
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        email: req.user.email
      };
    }

    res.redirect("/products");
    // }
  }
);

router.get("/errorRegistro", async (req, res) => {
  return res.redirect("/registro?error=Error en el proceso de registro");
});

router.post(
  "/registro",
  passport.authenticate("registro", {
    failureRedirect: "/api/sessions/errorRegistro"
  }),
  async (req, res) => {
    let { email } = req.body;

    // let { nombre, apellido, email, pass } = req.body;
    // if (!nombre || !apellido || !email || !pass) {
    //   return res.redirect("/registrate?error=Complete todos los campos");
    // }
    // // se valida en formulario
    // let regMail =
    //   /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
    // console.log(regMail.test(email));
    // if (!regMail.test(email)) {
    //   return res.redirect("/registro?error=Mail con formato incorrecto...!!!");
    // }
    // let existe = await usuariosModelo.findOne({ email });
    // if (existe) {
    //   return res.redirect(
    //     `/registro?error=Existen usuarios con email ${email} en la BD`
    //   );
    // }
    // // pass = crypto
    // //   .createHmac("sha256", "codercoder123")
    // //   .update(pass)
    // //   .digest("hex");
    // pass = creaHash(pass);
    // let usuario;
    // try {
    //   usuario = await usuariosModelo.create({
    //     nombre,
    //     apellido,
    //     email,
    //     password: pass
    //   });
    //   res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
    // } catch (error) {
    //   res.redirect("/registro?error=Error inesperado. Reintente en unos minutos");
    // }

    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
  }
);

router.get("/logout", (req, res) => {
  console.log(req.user);
  req.session.destroy((error) => {
    if (error) {
      res.redirect("/login?error=fallo en el logout");
    }
  });

  res.redirect("/login");
});

router.get("/github", passport.authenticate("github", {}), (req, res) => {});

router.get(
  "/callbackGithub",
  passport.authenticate("github", {
    failureRedirect: "/api/sessions/errorGitHub"
  }),
  (req, res) => {
    console.log(req.user);
    req.session.usuario = req.user;

    // res.setHeader("Content-Type", "application/json");
    // res.status(200).json({
    //   message: "Acceso OK...!!!",
    //   usuario: req.user
    // });

    res.redirect("/products");
  }
);

router.get("/errorGitHub", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    error: "Error al autenticar con GitHub"
  });
});
