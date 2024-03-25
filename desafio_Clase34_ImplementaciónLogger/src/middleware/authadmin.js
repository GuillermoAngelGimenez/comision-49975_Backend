import axios from 'axios';

export async function isAdmin(req, res, next) {
  try {
    const response = await axios.get('http://localhost:8080/api/sessions/current', {
        headers: {
            Cookie: req.headers.cookie
        }
    });

    const usuario = response.data.respuesta; // Suponiendo que la información del usuario está en el cuerpo de la respuesta

    // console.log(usuario);
    // return;

      if (usuario && usuario.role === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
      }

  } catch (error) {
      console.error('Error al obtener la información del usuario:', error);
      return false; 
  }

  }
  
  