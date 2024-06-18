require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_URL, DB_PORT } = process.env;

// crear una instancia de conexión a una base de datos PostgreSQL
// const sequelize = new Sequelize(
//   `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/saber365`,
//   {
//     logging: false,
//     native: false,
//   }
// );

// Conectar con la DB remota (Railway)
const sequelize = new Sequelize(
  `postgresql://postgres:${DB_USER}@${DB_URL}:${DB_PORT}/railway`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  }
);

// Función para cargar y definir los modelos
function defineModels() {
  const modelDefiners = [];

  fs.readdirSync(path.join(__dirname, "/models"))
    .filter(
      (file) =>
        file.indexOf(".") !== 0 && file.slice(-3) === ".js"
    )
    .forEach((file) => {
      modelDefiners.push(require(path.join(__dirname, "/models", file)));
    });

  // Sequelize se utiliza para interactuar con la base de datos utilizando los modelos definidos
  modelDefiners.forEach((modelDefiner) => modelDefiner(sequelize));


}

// Llamamos a la función para definir los modelos
defineModels();

const { Usuario } = sequelize.models;

// Relaciones entre modelos


module.exports = {
  Usuario,
  conn: sequelize,
};