require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
const axios = require("axios");

// Conectar con la base de datos de Railway
// const sequelize = new Sequelize(
//   `postgresql://postgres:lzsyvfuYsFgzstvKnJrOdBIJMgUWwwRQ@viaduct.proxy.rlwy.net:41992/railway`,
//   {
//     logging: false,
//     native: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false, // IMPORTANTE para Railway
//       },
//     },
//   }
// );
const sequelize = new Sequelize(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  logging: false, // Establecer en console.log para ver las consultas SQL sin procesar
  native: false, // Permite que Sequelize sepa que puede usar pg-native para obtener un ~30% más de velocidad
});

// Función para cargar y definir los modelos
function defineModels() {
  const modelDefiners = [];

  fs.readdirSync(path.join(__dirname, "/models"))
    .filter((file) => file.indexOf(".") !== 0 && file.slice(-3) === ".js")
    .forEach((file) => {
      modelDefiners.push(require(path.join(__dirname, "/models", file)));
    });

  // Sequelize se utiliza para interactuar con la base de datos utilizando los modelos definidos
  modelDefiners.forEach((modelDefiner) => modelDefiner(sequelize));
}

// Llamamos a la función para definir los modelos
defineModels();

const {
  Usuario,
  Simulacro,
  Pregunta,
  SimulacroRealizado,
  SimulacroFinalizado,
  ColegioData,
} = sequelize.models;

// Relaciones entre modelos

Simulacro.hasMany(Pregunta, {
  foreignKey: "id_simulacro", // Clave foránea en Pregunta
  sourceKey: "id", // Clave primaria en Simulacro
  as: "preguntas", // Alias para la relación
});

Pregunta.belongsTo(Simulacro, {
  foreignKey: "id_simulacro", // Clave foránea en Pregunta
  targetKey: "id", // Clave primaria en Simulacro
  as: "simulacro", // Alias para la relación
});

Usuario.hasMany(SimulacroRealizado, {
  foreignKey: "id_usuario",
  sourceKey: "id",
  as: "simulacrosRealizados",
});

SimulacroRealizado.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  targetKey: "id",
  as: "usuario",
});

Simulacro.hasMany(SimulacroRealizado, {
  foreignKey: "id_simulacro",
  sourceKey: "id",
  as: "sesionesRealizadas",
});

SimulacroRealizado.belongsTo(Simulacro, {
  foreignKey: "id_simulacro",
  targetKey: "id",
  as: "simulacro",
});

// Relaciones para SimulacroFinalizado
Usuario.hasMany(SimulacroFinalizado, {
  foreignKey: "id_usuario",
  sourceKey: "id",
  as: "simulacrosFinalizados",
});


SimulacroFinalizado.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  targetKey: "id",
  as: "usuario",
});

Simulacro.hasMany(SimulacroFinalizado, {
  foreignKey: "id_simulacro",
  sourceKey: "id",
  as: "finalizaciones",
});

SimulacroFinalizado.belongsTo(Simulacro, {
  foreignKey: "id_simulacro",
  targetKey: "id",
  as: "simulacro",
});

// Insertar colegios en la base de datos
// const apiUrl = "https://www.datos.gov.co/resource/cfw5-qzt5.json";
// const appToken = "0mOA5CbJo9E2GsZwIAMYiqDA0";

// const fetchColegios = async () => {
//   try {
//     const response = await axios.get(apiUrl, {
//       params: {
//         $$app_token: appToken,
//         $limit: 575403, // Reducido para evitar sobrecarga de memoria
//       },
//     });

//     if (!response.data || response.data.length === 0) {
//       console.log("No se recibieron datos de la API");
//       return;
//     }

//     Formatear y filtrar datos únicos
//     const datosFiltrados = response.data.map((colegio) => ({
//       nombre_establecimiento: colegio.nombre_establecimiento || "Desconocido",
//       municipio: colegio.municipio || "Desconocido",
//       departamento: colegio.departamento || "Desconocido",
//       sector: colegio.sector || "Desconocido",
//       codigo_dane: colegio.codigo_dane || "Desconocido",
//     }));

//     Insertar datos en la base de datos
//     await sequelize.sync();
//     await ColegioData.bulkCreate(datosFiltrados, {
//       ignoreDuplicates: true, // Evita insertar registros duplicados
//     });

//     console.log("Datos insertados correctamente en la base de datos");
//   } catch (error) {
//     console.error("Error obteniendo colegios:", error);
//   } finally {
//     await sequelize.close();
//   }
// };

// fetchColegios();

module.exports = {
  Usuario,
  Simulacro,
  Pregunta,
  SimulacroRealizado,
  SimulacroFinalizado,
  ColegioData,
  conn: sequelize,
};
