const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SimulacroRealizado = sequelize.define(
    "SimulacroRealizado",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_sesion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      estado_preguntas_sesion1: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      estado_preguntas_sesion2: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      sesion_completada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tiempo_prueba_sesion1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tiempo_prueba_sesion2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    { timestamps: true, paranoid: true }
  );

  return SimulacroRealizado;
};