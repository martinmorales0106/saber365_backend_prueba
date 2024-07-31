const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Pregunta = sequelize.define(
    "Pregunta",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      titulo_texto: {
        type: DataTypes.TEXT,
      },
      contexto: {
        type: DataTypes.TEXT,
      },
      pie_texto: {
        type: DataTypes.TEXT,
      },
      imagen: {
        type: DataTypes.STRING,
      },
      pregunta: {
        type: DataTypes.TEXT,
      },
      opcionA: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      opcionB: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      opcionC: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      opcionD: {
        type: DataTypes.STRING,
      },
      opcionE: {
        type: DataTypes.STRING,
      },
      opcionF: {
        type: DataTypes.STRING,
      },
      opcionG: {
        type: DataTypes.STRING,
      },
      opcionH: {
        type: DataTypes.STRING,
      },
      respuesta_correcta: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      afirmacion: {
        type: DataTypes.TEXT,
      },
      evidencia: {
        type: DataTypes.TEXT,
      },
      justificacion: {
        type: DataTypes.TEXT,
      },
      opcion_invalida: {
        type: DataTypes.TEXT,
      },
      img_Justificacion: {
        type: DataTypes.STRING,
      },
      img_opcion_invalida: {
        type: DataTypes.STRING,
      },
      sesion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      area: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      grado: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      competencia: {
        type: DataTypes.STRING,
      },
      componente: {
        type: DataTypes.STRING,
      },
      nivel: {
        type: DataTypes.STRING,
      },
      tema: {
        type: DataTypes.STRING,
      },
      sub_tema: {
        type: DataTypes.STRING,
      },
      enlace: {
        type: DataTypes.STRING,
      },
    },
    { timestamps: true, paranoid: true }
  );
  return Pregunta;
};
