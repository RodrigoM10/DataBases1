const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
    // revisamos los errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ msg: errores.array() });
    }

    const { email, password } = req.body;

    try {
        // Revisando q el email sea unico
        let usuarioEncontrado = await Usuario.findOne({ email });

        if (usuarioEncontrado) {
            return res.status(400).json({ msg: 'El Usuario ya existe' });
        }

        let usuario;
        //nuevo usuario
        const bodyUsuario = { ...req.body, role: 'user' };
        usuario = new Usuario(bodyUsuario);

        //hashear el password
        const salt = await bcryptjs.genSalt(10);
        usuario.password = await bcryptjs.hash(password, salt);

        //guardar usuario
        await usuario.save();

        //mensaje de exito
        res.send('Usuario Creado Correctamente');
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
};

exports.login = async (req, res) => {
    try {
        // revisamos los errores
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ msg: errores.array() });
        }

        const { email, password } = req.body;
        //Revisar usuario registrado
        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        //Revisar el password
        const passCorrect = await bcryptjs.compare(password, usuario.password);
        if (!passCorrect) {
            return res.status(400).json({ msg: 'Password incorrecto' });
        }

        // Si todo es correcto Crear y firmar JWT
        const payload = {
            usuario: {
                id: usuario.id,
                role: usuario.role,
            },
        };
        //para llevar info al sing, usamos payload(el objeto de arriba).
        //con el metodo de sing, podemos guardar informacion ( acepta valores alfanumericos)pero la libreria sabe como recuperar la info que guardamos..
        jwt.sign(
            payload,
            process.env.SECRETA,
            {
                expiresIn: 3600, //1 hora
            },
            (error, token) => {
                if (error) throw error;
                res.json({ token });
            }
        );
    } catch (error) {
        console.log('~ error', error);
    }
};

exports.obtenerUsuarioAutenticado = async (req, res) => {
    // Leer token
    const token = req.header('x-auth-token');
    // Revisar Token
    if (!token) {
        return res.status(401).json({ msg: 'No hay Token, permiso no valido' });
    }
    // Validar Token
    try {
        const cifrado = jwt.verify(token, process.env.SECRETA);
        const usuario = await Usuario.findById(cifrado.usuario.id);
        res.send(usuario);
    } catch (error) {
        res.status(401).json({ msg: 'Token no valido' });
    }
};
