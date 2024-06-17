const jwt = require("jsonwebtoken") ;
require("dotenv").config();
const { JWT_SECRET } = process.env;

const generarJWT = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generarJWT;
