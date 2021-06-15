//VID 119
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortId = require('shortid');
const shortid = require('shortid');

//Defino los campos de la BD
const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true //Limpia espacion en blanco al principio y al final
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicacion es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String], //Arreglo de string
    candidatos: [{//Arreglo de objetos
        nombre: String,
        email: String,
        cv: String
    }],
    autor : {//Referencia al modelo usuarios. Quien creo la Vacante VID 148
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El auto es obligatorio'
    }
});

//Antes de que se guarde en la base de datos. Middleware de mongoose
//Creo mediante Slug y ShortID la URL que identifica cada puesto de Vacante
vacantesSchema.pre('save', function(next) {
    //Crear la URL
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`; 
    next();
})

//Crear un Indice para Busqueda V180
vacantesSchema.index({ titulo : 'text'});


module.exports = mongoose.model('Vacante', vacantesSchema); //Defino nombre del modelo y le paso el Schema que define las Vacantes