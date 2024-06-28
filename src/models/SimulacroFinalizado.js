const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SimulacroFinalizado = sequelize.define(
    "SimulacroFinalizado",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      estado_preguntas: {
        type: DataTypes.JSON,
        allowNull: true, // Puede ser null si no se han registrado preguntas
      },
      puntaje_global: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nivel_alcanzado: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser null si no se ha registrado nivel
      },
      puntaje_por_area: {
        type: DataTypes.JSON,
        allowNull: true, // Puede ser null si no se ha registrado puntaje por área
      },
      nivel_por_area: {
        type: DataTypes.JSON,
        allowNull: true, // Puede ser null si no se ha registrado nivel por área
      },
      tiempo_prueba: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sesion_completada: {
        type: DataTypes.STRING,
        defaultValue: "default",
      },
    },
    { timestamps: true, paranoid: true }
  );
  return SimulacroFinalizado;
};
