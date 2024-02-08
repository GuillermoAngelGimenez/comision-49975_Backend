import passport from "passport";
import github from "passport-github2";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";

export const initPassport = () => {
  // passport.use("github", new github.Strategy(
  //     {
  //       clientID: "Iv1.38bd9ed162be36e1",
  //       clientSecret: "c301e75df7203dee2697f43aaf853624deaf6f3f",
  //       callbackURL: "http://localhost:8080/api/sessions/callbackGithub"
  //     },

  //     async (accessToken, refreshToken, profile, done) => {
  //       try {
  //         // console.log(profile);
  //         let usuario = await usuariosModelo.findOne({
  //           username: profile._json.email
  //         });



  //         if (!usuario) {
  //           let nuevoUsuario = {
  //             first_name: profile._json.name,
  //             email: profile._json.email,
  //             profile
  //           };

  //           usuario = await usuariosModelo.create(nuevoUsuario);
  //         }
  //         console.log(usuario);
  //         return done(null, usuario);
  //       } catch (error) {
  //         console.log(error);
  //         return done(error);
  //       }
  //     }
  //   )
  // );

  // //   configurar serializador y deserializador
  // passport.serializeUser((usuario, done) => {
  //   if (usuario.id === 0) {
  //     return done(null, admin.id);
  //   } else {
  //     return done(null, usuario._id);
  //   }
  // });

  // passport.deserializeUser(async (id, done) => {
  //   if (id === 0) {
  //     done(null, admin);
  //   } else {
  //     let usuario = await usuariosModelo.findById(id);
  //     return done(null, usuario);
  //   }
  // });
};
