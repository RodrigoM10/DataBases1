// Importación de módulos de versiones anteriores
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const usuarioRoutes = require('./routes/usuariosRoute');
const memeRoutes = require('./routes/memesRoute');
const authRoutes = require('./routes/authRoute');

// crear el servidor
const app = express();

// Conectar a mongodb
mongoose.connect(process.env.MONGO_URL);

// Habilitar express.json (tambien se puede usar body parser)
app.use(express.json({ extended: true }));
// Habilitar urlencoded, para consultas desde postman en este formato
app.use(express.urlencoded({ extended: true }));

//importar rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/auth', authRoutes);

// puerto y arranque del servidor
app.listen(4000, () => {
    console.log('Servidor Funcionando');
});
