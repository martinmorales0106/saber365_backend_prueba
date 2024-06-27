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
        return res.status(200).json({ msg: "Usuario no encontrado" });
      }
    } catch (error) {
      return res.status(204).json({ msg: "Token no válido" });
    }
  }

  return res.status(401).json({ msg: "Token no proporcionado" });
};

module.exports = checkAuth;

