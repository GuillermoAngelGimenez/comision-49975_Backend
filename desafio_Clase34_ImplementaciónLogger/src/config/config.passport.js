import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";
import cookieParser from "cookie-parser";
import { usuariosService } from "../services/usuarios.service.js";
import { cartsService } from "../services/carts.service.js";
import { creaHash, validaPassword, SECRET, verificarToken } from "../util.js";
import { config } from "./config.js";

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
            // return done(null, false);
            return done(null, false, { message: `No se ingreso el mail y la password` });
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
            existeCarrito = await cartsService.getCartById(cart);
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

};