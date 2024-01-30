import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { cartsModelo } from "../dao/models/managerCarts.js";
import { creaHash, validaPassword, SECRET, verificarToken } from "../util.js";
import { MiRouter } from "../routes/router.js";


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

  // const admin = {
  //   id: 0,
  //   username: "adminCoder@coder.com",
  //   password: "adminCod3r123"
  // };

  passport.use("jwt", new passportJWT.Strategy(
      {
        secretOrKey: SECRET,
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

          // if (username === admin.username && password === admin.password) {
          //   return done(null, admin);
          // } else {

            let usuario = await usuariosModelo.findOne({ email: username }).lean();
            if (!usuario) {
              return done(null, false, { message: `Se ingresaron credenciales incorrectas` });
            }
            if (!validaPassword(usuario, password)) {
              return done(null, false, { message: `Se ingresaron credenciales incorrectas` });
            }

            // console.log(req.body);

            delete usuario.password;
            return done(null, usuario);
          // }

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
          let { nombre, apellido, email, edad, rol, cart } = req.body;

          if (!nombre || !apellido || !email || !edad || !cart || !password) {
            return done(null, false, {
              message: "Complete nombre, apellido, edad, email, password y cart"
            });
          }

          // de la versión anterior del endpoint de registro -----------------------    
          if (!nombre || !apellido || !email || !password || !edad || !cart) {
            return res.redirect("/registrate?error=Complete todos los campos");
            // return done(null, false);
          }

          // se valida en formulario
          let regMail =
            /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
          console.log(regMail.test(email));
          if (!regMail.test(email)) {
            return done(null, false);
          }
          // -----------------------

          let existe = await usuariosModelo.findOne({ email }).lean();
          if (existe) {
            return done(null, false, {
              message: `Ya existe el usuario con email ${email}`
            });
          }

          let existeCarrito;
          try {
            existeCarrito = await cartsModelo.findOne({ _id: cart }).lean();
          } catch (error) {
            return done(null, false, {message: `No existe el carrito con id: ${cart}`});
          }

          if(rol.length == 0)
            rol ="user";

          let nuevoUsuario = await usuariosModelo.create({
            nombre,
            apellido,
            edad,
            rol,
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
        let usuario = await usuariosModelo.findOne({username: profile._json.email});
        
        if (!usuario) {
          let nuevoUsuario = {
            nombre: profile._json.name,
            email: profile._json.email,
            profile
          };

          usuario = await usuariosModelo.create(nuevoUsuario);
        }

        return done(null, usuario);
      } catch (error) {
        return done(error);
      }
    }
  )
);

};