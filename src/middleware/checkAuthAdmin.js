const checkAuth = require("./checkAuth");

const checkAuthAdmin = async (req, res, next) => {
  // Reutiliza el middleware checkAuth para verificar el token del usuario
  checkAuth(req, res, async () => {
    // Ahora, verifica si el usuario es administrador
    if (req.usuario && req.usuario.admin === true) {
      // El usuario es un administrador, continúa con la solicitud
      return next();
    } else {
      // El usuario no es administrador
      return res
        .status(403)
        .json({ msg: "No tienes permisos de administrador" });
    }
  });
};

module.exports = checkAuthAdmin;
