import { Router } from "express";
import { passportCall, generaToken, verificarToken, validaPassword, creaHash } from "../util.js";
import passport from "passport";
import { MiRouter } from "./router.js";
import usuarioDTO from "../dao/DTOs/usuario.dto.js";
import { Strategy as GitHubStrategy } from 'passport-github2';
import { usuariosService } from "../services/usuarios.service.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js"
import { enviarEmail } from "../mails/mails.js";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import { cartsService } from "../services/carts.service.js";

export class SessionsRouter extends MiRouter {
  init() {
    // this.post("/registro", ["PUBLIC"], passportCall("registro"), async (req, res) => { 
    this.post("/registro", ["PUBLIC"], async (req, res) => { 

      const { first_name, last_name, email, password, age, cart, role} = req.body;
      
      try {
        if(!first_name || !last_name || !email || !password || !age || !cart ){
          // return res.redirect("/login?error=Complete todos los datos")
          return res.redirect(`/registrate?error=Complete todos los datos&first_name=${first_name}&last_name=${last_name}&email=${email}&age=${age}&cart=${cart}&role=${role}`);
        }

        // validar formato de correo
        let regMail =/^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
        console.log(regMail.test(email));
        if (!regMail.test(email)) {
          return res.redirect(`/registrate?error=El formato para email no es correcto. Se ingreso ${email}&first_name=${first_name}&last_name=${last_name}&age=${age}&cart=${cart}&role=${role}`);
        }

        // Busca el usuario en la base de datos por correo electrónico    
        const existe = await usuariosService.getUsuarioByEmail(email);
        if (existe) {
          return res.redirect(`/registrate?error=El email ingresado ya esta registrado&first_name=${first_name}&last_name=${last_name}&age=${age}&cart=${cart}&role=${role}`);
        }
    
        let existeCarrito;
        try {
          existeCarrito = await cartsService.getCartById(cart);
        } catch (error) {
          return res.redirect(`/registrate?error=El carrito ingresado no existe&first_name=${first_name}&last_name=${last_name}&email=${email}&age=${age}&role=${role}`);
        }

        if(role.length == 0)
          role ="user";

        // creamos el nuevo usuario
        let nuevoUsuario = await usuariosService.createUsuario({
          first_name,
          last_name,
          age,
          role,
          email,
          password: creaHash(password),
          cart
        });

      } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res.redirect(`/login?error=Error en el servidor`);
        // res.status(500).json({ error: 'Error en el servidor' });
      }


      if (req.headers['content-type'] === 'application/json') {
        return res.successAlta("Registro correcto...!!!", req.user);
      } else{
        res.redirect("/login?mensaje=El usuario se registro con éxito!!!")
      }
    });

    this.post('/login', ["PUBLIC"], async (req, res) => {
      const { email, password } = req.body;
    
      if(!email || !password){
        // return res.redirect("/login?error=Complete todos los datos")
        return res.redirect(`/login?error=Complete todos los datos&email=${email}`);
      }

      try {
        // Busca el usuario en la base de datos por correo electrónico
        const user = await usuariosService.getUsuarioByEmail(email);
    
        // Verifica si el usuario existe y si la contraseña es válida
        if (!user || !validaPassword(user, password)) {
          // return res.status(401).json({ error: 'Credenciales incorrectas' });
          return res.redirect(`/login?error=Credenciales incorrectas`);
        }
    
        // Genera un token de autenticación para el usuario
        const token = generaToken(user);
    
        res.cookie("ecommerce", token, {httpOnly: true, maxAge: 1000 * 60 * 60});
        
        if (req.headers['content-type'] === 'application/json') {
          // console.log(user)
          res.success(`Login correcto para el usuario: ${user.email}, con rol:${user.role}`); 
        } else {
            res.redirect("/products");
        }
      } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res.redirect(`/login?error=Error en el servidor`);
        // res.status(500).json({ error: 'Error en el servidor' });
      }
    });
    
    this.get("/current", ["PUBLIC"], (req, res) => {
      
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

      return done(null, usuario); // Pasamos el email como usuario autenticado
    }
    
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
    
  this.post("/recupero", ["PUBLIC"], async(req, res) => {
    let {email} = req.body;

    if (!email){
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({error: `No se ingreso un mail para la recuperación` })
    }

    let usuario = await usuariosService.getUsuarioByEmail(email);
    
    if (!usuario){
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({error: `No existe el email ${email}` })
    }

    delete usuario.password;
    let token = jwt.sign({...usuario}, config.SECRETKEY, {expiresIn: "1h"})

    let mensaje = `Solicitaste reiniciar...
    Por favor te pedimos que hagas click en el siguiente link <a href="http://localhost:3000/api/sessions/recupero02?token=${token}">Resetear Contraseña</a>
    Si usted no solicito un reseteo haga caso omiso al mensaje.`

    let respuesta = await enviarEmail(email, "Recupero de password", mensaje);

    if(respuesta.accepted.length > 0) {
      res.redirect("http://localhost:3000/login?mensaje=En breve recibira un mail. \nSiga los pasos para resetear su contraseña..");
    }else{
      res.redirect("http://localhost:3000/login?mensaje=Error al intentar recuperar la contraseña...");
    }
  });

  this.get("/recupero02", ["PUBLIC"], (req, res) => {
    let {token}=req.query;

    try {
        let datosToken=jwt.verify(token, config.SECRETKEY)
        // console.log(datosToken)
        const baseUrl = req.baseUrl.replace("/api/sessions", "");
        const newUrl = `${baseUrl}/recupero02?token=${token}`;
        res.redirect(newUrl);
        // res.render("recupero02", { token }); // Redirigir a la vista de recupero02 con el token
    } catch (error) {
        // res.setHeader('Content-Type','application/json');
        // return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`})
        res.redirect("http://localhost:3000/login?mensaje=Error token:" + error.message)
    }
  });

  this.post("/recupero03", ["PUBLIC"], async(req, res) => {
    let {password1, password2, token} = req.body;

    if(password1 !== password2){
      // res.setHeader('Content-Type','application/json');
      // return res.status(400).json({error:`Las claves ingresadas difieren...!!!`})
      return res.redirect(`/recupero02?token=${token}&error=Las contraseñas son distintas!!!`);
    }

    try {
      let datosToken=jwt.verify(token, config.SECRETKEY)
      // console.log(datosToken)
      // let usuario=await usuariosModelo.findOne({email:datosToken.email}).lean();
      let usuario = await usuariosService.getUsuarioByEmail(datosToken.email);
      // console.log(usuario);

      if(!usuario){
          // res.setHeader('Content-Type','application/json');
          // return res.status(400).json({error:`Error de usuario`})
          return res.redirect(`/recupero02?token=${token}&error=Error de usuario`);
      }


      if(validaPassword(usuario, password1)){
          // res.setHeader('Content-Type','application/json');
          // return res.status(400).json({error:`Ha ingresado una contraseña utilizada antes. No esta permitida la acción.`})
          return res.redirect(`/recupero02?token=${token}&error=Ha ingresado una contraseña utilizada antes. No esta permitida la acción.`);
      }

      let usuarioActualizado = {...usuario, password: creaHash(password1)}
      // let usuarioActualizado = {...usuario, password:bcrypt.hashSync(password1, bcrypt.genSaltSync(10))}

      // console.log(usuarioActualizado)
      await usuariosModelo.updateOne({email:datosToken.email}, usuarioActualizado)

      res.redirect("http://localhost:3000/login?mensaje=Contraseña reseteada...!!!")

    } catch (error) {
        // res.setHeader('Content-Type','application/json');
        // return res.status(500).json({error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`})
        return res.redirect(`/recupero02?token=${token}&error=Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`);
    }

  });

  }
}