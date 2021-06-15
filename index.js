const mongoose = require('mongoose');//VID 118
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');//Utilidad que permite obtener la URL actual.
const router = require('./routes');
const cookieParser = require('cookie-parser');//VID 118 Guardar Sesion
const session = require('express-session');//VID 118 Guardar Sesion
const MongoStore = require('connect-mongo')(session);//VID 118. Le paso la variable session al paquete
const bodyParser = require('body-parser');//VID 125
const flash = require('connect-flash');//VID 137
const createError = require('http-errors');//Manejo de errores VID 179
const passport = require('./config/passport');//Importo el archivo de configuracion de passport VID 145
const { create } = require('./models/Usuarios');

require('dotenv').config({path: 'variables.env'}); //Paso la rua donde va a estar el archivo de variable con dotenv.

const app = express();

//Habilitar Body Parser. Leer los campos por medio del body y subir archivos VID 125
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Habilitar Handlebars como Vista y Helpers
//Los helpers es una forma de registrar sripts para que se comuniquen direcamente con Handlebars
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')//VID 122
    })
);

app.set('view engine', 'handlebars');

//Archivos Estaticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection : mongoose.connection})
}));

//Inicializar passport VID 145
app.use(passport.initialize());
app.use(passport.session());

//Alertas con connect-flash
app.use(flash());

//Crear nuestro middleware (Mensajes y usuarios autenticados)
app.use((req, res , next) => {
    res.locals.mensajes = req.flash(); //mensajes es una variable local para guardar los alertas.
    next();
});

app.use('/', router());

//Error 404 Pagina no encontrada V179
app.use((req, res, next) => {
    next(createError(404, 'Pagina no encontrada')); //Parametros, el codigo de error y el mensaje a mostrar.
})
//Administracion de errores V179
app.use((error, req, res, next) =>{
    //Creo una variable error404 y paso el mensaje de erro que cree arriba
    res.locals.error404 = error.message;//Cuando paso variables a locals, para leerlas en la vista no necesito mandarlas en el controlador, ya peudo acceder directamente.
    res.render('error');//Vista para el error.
})

//Dejar que Heroku asigne el puerto. Final del programa
const host = '0.0.0.0';
const port = process.env.PORT;
app.listen(port, host, () => {
    console.log('--------------------El servidor esta funcionando--------------------');
});


// app.listen(process.env.PUERTO);