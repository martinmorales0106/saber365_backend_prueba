const server = require("./src/app.js");
const { conn } = require("./src/db.js");

require("dotenv").config();

const { PORT } = process.env;

async function startServer() {
  try {
    // Sincronizar todos los modelos de la base de datos.
    await conn.sync({ force: false });
   
    // Iniciar el servidor para que escuche en el puerto especificado.
    const app = server.listen(PORT, () => {
      console.log(`Server corriendo en el puerto ${PORT}`);
    });

    return app;
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

startServer();
