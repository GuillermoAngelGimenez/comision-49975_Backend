import passport from "passport";
import local from "passport-local";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { creaHash, validaPassword } from "../util.js";

export const inicializarPassport = () => {
  const admin = {
    id: 0,
    username: "adminCoder@coder.com",
    password: "adminCod3r123"
  };

  passport.use(
    "registro",
    new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email",
        passwordField: "pass"
      },
      async (req, username, password, done) => {
        try {
          console.log("Estrategia local registro de Passport...!!!");
          let { nombre, apellido, email } = req.body;

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

          password = creaHash(password);

          let usuario;
          try {
            usuario = await usuariosModelo.create({
              nombre,
              apellido,
              email,
              password
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
        usernameField: "email",
        passwordField: "pass"
      },
      async (username, password, done) => {
        try {
          console.log("Estrategia local de login de Passport...!!!");
          //   let { email, pass } = req.body;

          if (!username || !password) {
            // return res.redirect("/login?error=Complete todos los datos");
            return done(null, false);
          }

          if (username === admin.username && password === admin.password) {
            // req.session.usuario = {
            //   username: "adminCoder@coder.com"
            // };
            return done(null, admin);
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

            if (!validaPassword(usuario, password)) {
              //   return res.redirect(
              //     `/login?error=Se ingresaron Credenciales Incorrectas`
              //   );
              return done(null, false);
            }

            delete usuario.password;
            return done(null, usuario);
          }
        } catch (error) {
          console.log(password);
          done(error, null);
        }
      }
    )
  );

  //   configurar serializador y deserializador
  passport.serializeUser((usuario, done) => {
    if (usuario.id === 0) {
      return done(null, admin.id);
    } else {
      return done(null, usuario._id);
    }
  });

  passport.deserializeUser(async (id, done) => {
    if (id === 0) {
      done(null, admin);
    } else {
      let usuario = await usuariosModelo.findById(id);
      return done(null, usuario);
    }
  });
};
