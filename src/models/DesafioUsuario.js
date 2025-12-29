const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DesafioUsuario = sequelize.define(
    "DesafioUsuario",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nivelAlcanzado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      infoExtra: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    { timestamps: true, paranoid: true }
  );

  return DesafioUsuario;
};
