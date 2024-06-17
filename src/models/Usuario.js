const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombreUsuario: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        trim: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      grado: {
        type: DataTypes.ENUM,
        values: ["SÉPTIMO", "NOVENO", "UNDÉCIMO"],
        allowNull: false,
        trim: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        unique: true,
      },
      colegio: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      confirmado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: true, paranoid: true }
  );

  Usuario.beforeCreate(async (usuario) => {
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(usuario.password, salt);
  });

  Usuario.prototype.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
  };

  return Usuario;
};
