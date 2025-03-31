const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ColegioData = sequelize.define(
    "ColegioData",
    {
      codigo_dane: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      nombre_establecimiento: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departamento: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      municipio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sector: {
        type: DataTypes.STRING,
      },
    },
    { timestamps: true, paranoid: true }
  );
  return ColegioData;
};
