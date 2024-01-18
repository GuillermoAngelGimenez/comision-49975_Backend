import passport from "passport";
import local from "passport-local";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { creaHash, validaPassword } from "../util.js";
// import { passportJWT } from "passport-jwt";

// export const inicializarPassport = () => {
//   const admin = {
//     id: 0,
//     username: "adminCoder@coder.com",
//     password: "adminCod3r123"
//   };

//   passport.use(
//     "registro",
//     new local.Strategy(
//       {
//         passReqToCallback: true,
//         usernameField: "email",
//         passwordField: "pass"
//       },
//       async (req, username, password, done) => {
//         try {
//           console.log("Estrategia local registro de Passport...!!!");
//           let { nombre, apellido, email } = req.body;

//           if (!nombre || !email || !password) {
//             return res.redirect("/registrate?error=Complete todos los campos");
//             // return done(null, false);
//           }

//           // se valida en formulario
//           let regMail =
//             /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
//           console.log(regMail.test(email));
//           if (!regMail.test(email)) {
//             return done(null, false);
//           }

//           let existe = await usuariosModelo.findOne({ email });
//           if (existe) {
//             return done(null, false);
//           }

//           password = creaHash(password);

//           let usuario;
//           try {
//             usuario = await usuariosModelo.create({
//               nombre,
//               apellido,
//               email,
//               password
//             });

//             return done(null, usuario);
//           } catch (error) {
//             return done(null, false);
//           }
//         } catch (error) {
//           done(error);
//         }
//       }
//     )
//   );

//   passport.use(
//     "login",
//     new local.Strategy(
//       {
//         usernameField: "email",
//         passwordField: "pass"
//       },
//       async (username, password, done) => {
//         try {
//           console.log("Estrategia local de login de Passport...!!!");

//           if (!username || !password) {
//             return done(null, false);
//           }

//           if (username === admin.username && password === admin.password) {
//             return done(null, admin);
//           } else {
//             let usuario = await usuariosModelo
//               .findOne({ email: username })
//               .lean();
//             if (!usuario) {
//               return done(null, false);
//             }

//             if (!validaPassword(usuario, password)) {
//               return done(null, false);
//             }

//             delete usuario.password;
//             return done(null, usuario);
//           }
//         } catch (error) {
//           console.log(password);
//           done(error, null);
//         }
//       }
//     )
//   );

//   //   configurar serializador y deserializador
//   passport.serializeUser((usuario, done) => {
//     if (usuario.id === 0) {
//       return done(null, admin.id);
//     } else {
//       return done(null, usuario._id);
//     }
//   });

//   passport.deserializeUser(async (id, done) => {
//     if (id === 0) {
//       done(null, admin);
//     } else {
//       let usuario = await usuariosModelo.findById(id);
//       return done(null, usuario);
//     }
//   });
// };

// verificar
// const buscarToken = (req) => {
//   let token = null;

//   if (req.cookies.coderCookie) {
//     token = req.cookies.coderCookie;
//   }

//   return token;
// };

export const inicializarPassport = () => {
  // passport.use(
  //   "jwt",
  //   new passportJWT.Strategy(
  //     {
  //       secretOrKey: SECRET,
  //       jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([buscarToken])
  //     },
  //     async (contenidoToken, done) => {
  //       try {
  //         return done(null, contenidoToken);
  //       } catch (error) {
  //         return done(error);
  //       }
  //     }
  //   )
  // );

  // passport.use(
  //   "login",
  //   new local.Strategy(
  //     {
  //       usernameField: "email"
  //     },
  //     async (username, password, done) => {
  //       try {
  //         let usuario = await usuariosModelo
  //           .findOne({ email: username })
  //           .lean();
  //         if (!usuario) {
  //           return done(null, false, { message: `Credenciales incorrectas` });
  //         }
  //         if (!validaPassword(usuario, password)) {
  //           return done(null, false, { message: `Credenciales incorrectas` });
  //         }

  //         delete usuario.password;
  //         return done(null, usuario);
  //       } catch (error) {
  //         return done(error);
  //       }
  //     }
  //   )
  // );

  passport.use("registro", new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email"
      },
      async (req, username, password, done) => {
        try {
          let { nombre, apellido, email, edad, rol } = req.body;
          if (!nombre || !apellido || !email || !edad ) {
            return done(null, false, {
              message: "Complete nombre, apellido, edad, email, y password"
            });
          }

          let existe = await usuariosModelo.findOne({ email }).lean();
          if (existe) {
            return done(null, false, {
              message: `Ya existe el usuario con email ${email}`
            });
          }

          let nuevoUsuario = await usuariosModelo.create({
            nombre,
            apellido,
            edad,
            rol,
            email,
            password: creaHash(password)
          });

          return done(null, nuevoUsuario);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
