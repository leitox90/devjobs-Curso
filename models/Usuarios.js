//VID 135
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt'); //Hashear pwr

//Creo el Schema
const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: {
        type: String
    },
    expira:{
        type: Date
    },
    imagen:{
        type: String
    }
});

//Metodo para Hashear pwr antes de que se guarde
usuariosSchema.pre('save', async function(next) {
    //Si el pwr esta hasheado no hacemos nada
    if(!this.isModified('password')) {
        return next();//Deten la ejecucion
    }else {//Si no esta hasheado. Hasheo
        const hash = await bcrypt.hash(this.password,12);// Se pasa todo el objeto a este metodo y accedo a cada campo con this.
        this.password = hash;
        next();
    }
});
//Metodo para validar si se repite un email VID 142
usuariosSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoError' && error.code === 11000) {
        next('El correo ya ah sido registrado')//Esto sigue en el middleware de crearUsuario en usuariosController
    }else{
        next(error);
    }
});
//Autenticar USUARIOS -- .methods me permite agregar diferentes funciones
usuariosSchema.methods = {
    compararPassword: function(password) {
        //Comparo el password que recbio del formulario, con el password de la base de datos
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);
//Importar el usuario en /config/db.js