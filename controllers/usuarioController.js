const Usuario = require("../models/Usuario");
const bcryptjs = require("bcryptjs");

exports.crearUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Revisando q el email sea unico
    let usuarioEncontrado = await Usuario.findOne({ email });

    if (usuarioEncontrado) {
      return res.status(400).json({ msg: "El Usuario ya existe" });
    }

    let usuario;
    //nuevo usuario
    usuario = new Usuario(req.body);

    //hashear el password
    const salt = await bcryptjs.genSalt(10);
    usuario.password = await bcryptjs.hash(password, salt);
    
    //guardar usuario
    await usuario.save();

    //mensaje de exito
    res.send("Usuario Creado Correctamente");
  } catch (error) {
    console.log(error);
    res.status(400).send("Hubo un error");
  }
};
