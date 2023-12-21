import { Router } from "express";
import { usuariosModelo } from "../dao/models/managerUsuarios.js";
import crypto from "crypto";
export const router = Router();

// router.post('/login', async(req, res)=>{

//     let {email, password}=req.body
//     if(!email || !password){
//         return res.redirect('/login?error=Complete todos los datos')
//     }

//     password=crypto.createHmac("sha256", "codercoder123").update(password).digest("hex")

//     let usuario=await usuariosModelo.findOne({email, password})
//     if(!usuario){
//         return res.redirect(`/login?error=credenciales incorrectas`)
//     }

//     req.session.usuario={
//         nombre:usuario.nombre, email:usuario.email
//     }

//     res.redirect('/perfil')

// })

router.post("/registro", async (req, res) => {
  let { nombre, apellido, email, pass } = req.body;

  //   if (!nombre || !apellido || !email || !pass) {
  //     return res.redirect("/registro?error=Complete todos los datos");
  //   }

  // se valida en formulario
  // let regMail =
  //   /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
  // console.log(regMail.test(email));
  // if (!regMail.test(email)) {
  //   return res.redirect("/registro?error=Mail con formato incorrecto...!!!");
  // }

  //   let existe = await usuariosModelo.findOne({ email });
  // if (existe) {
  //   return res.redirect(
  //     `/registro?error=Existen usuarios con email ${email} en la BD`
  //   );
  // }

  pass = crypto
    .createHmac("sha256", "codercoder123")
    .update(pass)
    .digest("hex");
  let usuario;
  try {
    usuario = await usuariosModelo.create({
      nombre,
      apellido,
      email,
      password: pass
    });
    res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`);
  } catch (error) {
    res.redirect("/registro?error=Error inesperado. Reintente en unos minutos");
  }
});

// router.get('/logout',(req,res)=>{

//     req.session.destroy(error=>{
//         if(error){
//             res.redirect('/login?error=fallo en el logout')
//         }
//     })

//     res.redirect('/login')

// });
