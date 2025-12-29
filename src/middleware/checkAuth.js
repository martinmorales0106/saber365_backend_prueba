const jwt = require("jsonwebtoken");
const { Usuario } = require("../db");

const checkAuth = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.usuario = await Usuario.findByPk(decoded.id, {
        attributes: {
          exclude: [
            "password",
            "token",
            "createdAt",
            "updatedAt",
            "deletedAt",
          ],
        },
      });
      
      if (req.usuario) {
        return next();
      } else {
        // CORRECCIÓN: Usamos 404 o 401, nunca 200 para un error
        return res.status(404).json({ msg: "Usuario no encontrado en base de datos" });
      }
    } catch (error) {
      // CORRECCIÓN IMPORTANTE: Cambiado de 204 a 403 (Forbidden) o 401 (Unauthorized)
      // 204 NO permite enviar un mensaje JSON.
      return res.status(401).json({ msg: "Tu sesión ha expirado, por favor inicia sesión nuevamente." });
    }
  }

  // Si no hay token
  return res.status(401).json({ msg: "Token no proporcionado, acceso denegado." });
};

module.exports = checkAuth;