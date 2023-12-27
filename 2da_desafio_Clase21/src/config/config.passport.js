import passport from "passport";
import local from "passport-local";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { creaHash } from "../util.js";

export const inicializarPassport = () => {
  passport.use(
    "registro",
    new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email"
      },
      async (req, username, password, done) => {
        try {
          console.log("Estrategia local registro de Passport...!!!");
          let { nombre, email } = req.body;

          if (!nombre || !email || !password) {
            return res.redirect("/registrate?error=Complete todos los campos");
            // return done(null, false);
          }

          // se valida en formulario
          let regMail =
            /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
          console.log(regMail.test(email));
          if (!regMail.test(email)) {
            // return res.redirect(
            //   "/registro?error=Mail con formato incorrecto...!!!"
            // );
            return done(null, false);
          }

          let existe = await usuariosModelo.findOne({ email });
          if (existe) {
            // return res.redirect(
            //   `/registro?error=Existen usuarios con email ${email} en la BD`
            // );
            return done(null, false);
          }

          pass = creaHash(pass);

          let usuario;
          try {
            usuario = await usuariosModelo.create({
              nombre,
              apellido,
              email,
              password: pass
            });

            // res.redirect(
            //   `/login?mensaje=Usuario ${email} registrado correctamente`
            // );
            return done(null, usuario);
          } catch (error) {
            // res.redirect(
            //   "/registro?error=Error inesperado. Reintente en unos minutos"
            // );
            return done(null, false);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email"
      },
      async (username, password, done) => {
        try {
          console.log("Estrategia local de login de Passport...!!!");
          //   let { email, pass } = req.body;

          if (!username || !password) {
            // return res.redirect("/login?error=Complete todos los datos");
            return done(null, false);
          }

          if (
            username === "adminCoder@coder.com" &&
            password === "adminCod3r123"
          ) {
            req.session.usuario = {
              username: "adminCoder@coder.com"
            };
            res.redirect("/products");
          } else {
            let usuario = await usuariosModelo
              .findOne({ email: username })
              .lean();
            if (!usuario) {
              //   return res.redirect(
              //     `/login?error=Se ingresaron Credenciales Incorrectas`
              //   );
              return done(null, false);
            }

            if (!validaPassword(usuario, pass)) {
              //   return res.redirect(
              //     `/login?error=Se ingresaron Credenciales Incorrectas`
              //   );
              return done(null, false);
            }

            delete usuario.password;
            return done(null, usuario);
          }
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  //   configurar serializador y deserializador
  passport.serializeUser((usuario, done) => {
    return done(null, usuario._id);
  });

  passport.deserializeUser(async (id, done) => {
    let usuario = await usuariosModelository.findById(id);
    return done(null, usuario);
  });
};
