const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SimulacroPregunta = sequelize.define(
    "SimulacroPregunta",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Aquí definimos en qué sesión de ESTE simulacro específico aparece la pregunta
      sesion_asignada: {
        type: DataTypes.INTEGER, 
        defaultValue: 1, // 1 para Sesión 1, 2 para Sesión 2
        allowNull: false
      },
      // Puedes agregar orden para que las preguntas salgan en secuencia específica
      orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      valor_pregunta: {
        type: DataTypes.INTEGER, // Por si algunas valen más que otras
        defaultValue: 1
      }
    },
    { timestamps: false }
  );
  return SimulacroPregunta;
};