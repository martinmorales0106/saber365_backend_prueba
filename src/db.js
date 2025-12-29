require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
const axios = require("axios");

// Conectar con la base de datos de Railway
const DATABASE_URL = `postgresql://postgres:lzsyvfuYsFgzstvKnJrOdBIJMgUWwwRQ@viaduct.proxy.rlwy.net:41992/railway`;

const sequelize = new Sequelize(DATABASE_URL, {
  logging: false, 
  native: false, 
  dialect: 'postgres', // Importante especificar el dialecto
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // CRUCIAL para conectar a Railway desde fuera
    },
    keepAlive: true, // Ayuda a evitar cortes de conexión intermitentes
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// const sequelize = new Sequelize(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
//   logging: false, // Establecer en console.log para ver las consultas SQL sin procesar
//   native: false, // Permite que Sequelize sepa que puede usar pg-native para obtener un ~30% más de velocidad
// });

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
  DesafioUsuario,
  SimulacroPregunta,
} = sequelize.models;

// Relaciones entre modelos

// Una Pregunta puede estar en muchos Simulacros

Pregunta.belongsToMany(Simulacro, {
  through: SimulacroPregunta,
  foreignKey: "id_pregunta",
  otherKey: "id_simulacro",
  as: "simulacros",
});

Simulacro.belongsToMany(Pregunta, {
  through: SimulacroPregunta,
  foreignKey: "id_simulacro",
  otherKey: "id_pregunta",
  as: "preguntas", // Al traer un simulacro, incluye sus preguntas
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

// Relaciones entre Usuario y PreguntaNivel

// Usuario tiene muchos DesafioUsuario
Usuario.hasMany(DesafioUsuario, {
  foreignKey: "usuarioId",  // Clave foránea en DesafioUsuario
  sourceKey: "id",          // Clave primaria en Usuario
  as: "progresos",          // Alias para acceder desde Usuario a sus progresos
});

// DesafioUsuario pertenece a un Usuario
DesafioUsuario.belongsTo(Usuario, {
  foreignKey: "usuarioId",  // Clave foránea que apunta a Usuario
  targetKey: "id",          // Clave primaria de Usuario
  as: "usuario",            // Alias para acceder al usuario desde DesafioUsuario
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
  DesafioUsuario,
  conn: sequelize,
};
