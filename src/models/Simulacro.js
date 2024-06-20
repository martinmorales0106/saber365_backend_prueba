const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Simulacro = sequelize.define(
    "Simulacro",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      imagen: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cantidad_preguntas: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tiempo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numero_sesiones: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      puntaje_maximo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    { timestamps: true, paranoid: true }
  );
  return Simulacro;
};
