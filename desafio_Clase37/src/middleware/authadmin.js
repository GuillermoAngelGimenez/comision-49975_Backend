import axios from 'axios';
import { config } from "../config/config.js";

export async function isPremiumCreate(req, res, next) {
  try {
    const PORT = config.PORT;
    const URL = 'http://localhost:3000/api/sessions/current';;

    if (PORT === 8080)
      URL = 'http://localhost:8080/api/sessions/current';

    const response = await axios.get(URL, {
        headers: {
            Cookie: req.headers.cookie
        }
    });

    const usuario = response.data.respuesta; // Suponiendo que la información del usuario está en el cuerpo de la respuesta
    req.user = usuario;

      // if (usuario && (usuario.role === 'admin' || usuario.role === 'premium')) {
      if (usuario && usuario.role === 'premium') {
        next();
      } else {
        // return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de usuario PREMIUM.' });
      }

  } catch (error) {
      console.error('Error al obtener la información del usuario:', error);
      return false; 
  }

  }
  
export async function isAdminoPremium(req, res, next) {
    try {
      const PORT = config.PORT;
      const URL = 'http://localhost:3000/api/sessions/current';;
  
      if (PORT === 8080)
        URL = 'http://localhost:8080/api/sessions/current';

        const response = await axios.get(URL, {headers: {Cookie: req.headers.cookie}});

        const usuario = response.data.respuesta; // Suponiendo que la información del usuario está en el cuerpo de la respuesta
        req.user = usuario;
        console.log(req.user);
  
        if (usuario && (usuario.role === 'admin' || usuario.role === 'premium')) {
          next();
        } else {
          return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador o premium.' });
        }
  
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        return false; 
    }
  
}
  