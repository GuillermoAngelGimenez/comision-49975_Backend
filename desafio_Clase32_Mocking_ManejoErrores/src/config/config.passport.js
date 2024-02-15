import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";
import { usuariosService } from "../services/usuarios.service.js";
import { cartsService } from "../services/carts.service.js";
import { creaHash, validaPassword, SECRET, verificarToken } from "../util.js";
import { MiRouter } from "../routes/router.js";
import { config } from "./config.js";

// ---agregado para github
import github from "passport-github2";

const buscarToken = (req) => {
  let token = null;

  if (req.cookies.ecommerce) {
    token = req.cookies.ecommerce;
  }

  return token;
};


export const inicializarPassport = () => {

  passport.use("jwt", new passportJWT.Strategy(
      {
        secretOrKey: config.SECRETKEY,
        jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([buscarToken])
      },
      async (contenidoToken, done) => {
        try {
          return done(null, contenidoToken);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use("login", new local.Strategy(
      {
        passReqToCallback: true, 
        usernameField: "email"
      },
      async (req, username, password, done) => {
        try {
   
          if (!username || !password) {
            return done(null, false);
          }

            let usuario = await usuariosService.getUsuarioByEmail(username);
            if (!usuario) {
              return done(null, false, { message: `Se ingresaron credenciales incorrectas` });
            }
            if (!validaPassword(usuario, password)) {
              return done(null, false, { message: `Se ingresaron credenciales incorrectas` });
            }

            delete usuario.password;
            return done(null, usuario);

        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use("registro", new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email"
      },
      async (req, username, password, done) => {
        try {
          let { first_name, last_name, email, age, role, cart } = req.body;

          if (!first_name || !last_name || !email || !age || !cart || !password) {
            return done(null, false, {
              message: "Complete first_name, last_name, age, email, password y cart"
            });
          }

          if (!first_name || !last_name || !email || !password || !age || !cart) {
            return res.redirect("/registrate?error=Complete todos los campos");
          }

          // se valida en formulario
          let regMail =
            /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
          console.log(regMail.test(email));
          if (!regMail.test(email)) {
            return done(null, false);
          }
          // -----------------------

          // let existe = await usuariosModelo.findOne({ email }).lean();
          let existe = await usuariosService.getUsuarioByEmail(email);
          if (existe) {
            return done(null, false, {
              message: `Ya existe el usuario con email ${email}`
            });
          }

          let existeCarrito;
          try {
            // existeCarrito = await cartsModelo.findOne({ _id: cart }).lean();
            existeCarrito = await cartsService.getCartById(cart).lean();
          } catch (error) {
            return done(null, false, {message: `No existe el carrito con id: ${cart}`});
          }

          if(role.length == 0)
            role ="user";

          // let nuevoUsuario = await usuariosModelo.create({
          let nuevoUsuario = await usuariosService.createUsuario({
            first_name,
            last_name,
            age,
            role,
            email,
            password: creaHash(password),
            cart
          });

          return done(null, nuevoUsuario);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use("github", new github.Strategy(
    {
      clientID: "Iv1.38bd9ed162be36e1",
      clientSecret: "c301e75df7203dee2697f43aaf853624deaf6f3f",
      callbackURL: "http://localhost:8080/api/sessions/callbackGithub"
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);
        // let usuario = await usuariosModelo.findOne({username: profile._json.email});
        let usuario = await usuariosService.getUsuarioByEmail(profile._json.email); ;
        
        if (!usuario) {
          let nuevoUsuario = {
            first_name: profile._json.name,
            email: profile._json.email,
            profile
          };

          // usuario = await usuariosModelo.create(nuevoUsuario);
          usuario = await usuariosService.createUsuario(nuevoUsuario);
        }

        return done(null, usuario);
      } catch (error) {
        return done(error);
      }
    }
  )
);

};