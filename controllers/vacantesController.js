// const Vacante = require('../models/Vacantes');//Una forma de importal el modelo
//Otra forma
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require('express-validator');//Sanitizar campos 154
const multer = require('multer'); //Subir CV VID 167
const shortid = require('shortid'); //Subir CV Vid 167

//VID 120
exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'LLeva el formulario y publica tu vacante',
        cerrarSesion: true,//Barra de navegacion con cerrar sesion y nombre de usuario VID 152
        nombre: req.user.nombre,
        imagen: req.user.imagen //Paso la imagen VID 164
    })
}

//Agregar Vacantes a la Base de Datos VID 125
exports.agregarVacante = async (req,res) => {
    const vacante = new Vacante(req.body); //Leo lo que tengo en el formulario y lo inserto en vacante
    //Usuario Autenticado -- Referencia al usuario que creo la vacante. VID 148
    vacante.autor = req.user._id;
    //crear arreglo de skills
    vacante.skills = req.body.skills.split(',');//Divido las Skills y formo el arreglo
    console.log(vacante);

    //Almacenar en la base de datos.
    const nuevaVacante = await vacante.save();
    //Redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

//Mostrar Vacante en detalle VID 127
exports.mostrarVacante = async (req, res, next) => {
    //Modificacion al Select, Inner Join a la tabla usuarios que esta relacionada con vacantes => .populate
    const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor')//Como utilizo .url porque lo defini asi en el router.
    console.log('--------------------Dentro de vacanteController.mostrarVacante--------------------');
    console.log(vacante);
    //Si no hay resultado
    if(!vacante) return next();

    //render a la vista vacante.handlebars
    res.render('vacante', {
        vacante,
        nombrePagina : vacante.titulo,
        barra: true
    })
    // console.log('-------------------------Dentro de vacantesController.mostrarVacante-------------------------')
    // console.log(vacante);
}

//Editar una Vacante VID 128
exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean();
    if(!vacante) return next();
    //Render a la vista editar-vacante.handlebars
    res.render('editar-vacante', {
        vacante: vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,//Barra de navegacion con cerrar sesion y nombre de usuario VID 152
        nombre: req.user.nombre,
        imagen: req.user.imagen //Paso la imagen VID 164
    })
}
//VID 133
exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');//Convierto la lista de skills en un arreglo.
    //Busco en la base de datos por URL la Vacante y la remplazo por vacanteActualizada. Tercer parametro, opaciones
    const vacante = await Vacante.findOneAndUpdate({ url : req.params.url}, vacanteActualizada, {new: true, runValidators: true});//Con new: true, me traigo el registro actualizado a la variable vacante
    res.redirect(`/vacantes/${vacante.url}`);

    console.log('------------------------vancatesController.editarVacante------------------------');
    console.log(vacanteActualizada);
}

//Validar y Sanitizar Campos 154
exports.validarVacante = async (req,res, next) => {
    //Sanitizar
    const rules = [
        body("titulo").not().isEmpty().withMessage("Agregue un Nombre a la Vacante").escape(),
        body("empresa").not().isEmpty().withMessage("Ingrese el nombre de la Empresa").escape(),
        body("ubicacion").not().isEmpty().withMessage("Ingrese la ubicacion").escape(),
        body("contrato").not().isEmpty().withMessage("Indique el tiempo de trabajo").escape(),
        body("skills").not().isEmpty().withMessage("Seleccione al menos una habilidad").escape()
    ];

    await Promise.all(rules.map(validation => validation.run(req)));//Esto medio que se escribe asi por default
    const errores = validationResult(req);
    
    //si hay errores => Si errores es distinto de vacio
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));//Express-Validator accede a los errores con .msg
        res.render('nueva-vacante', {
            nombrePagina: 'Crea una cuenta en Devjobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            cerrarSesion: true, //ESto es parte de la vista nueva-vacante
            nombre: req.user.nombre, //ESto es parte de la vista nueva-vacante
            mensajes: req.flash() //Paso los errores
        })
        return;
    } 
    //si toda la validacion es correcta
    next();    
}

//Eliminar Vacante VID 156 Esto trabaj en conjunto con accionesListado del app.js
exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;
    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        //Si es, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');//Esta respuesta que envio, la toma la funcion accionesListado en app.js
    }else {
        //No eliminar
        res.status(403).send('Error');
    }

    
}

//Verificar si el usuario autenticado es el que creo la vacante V158
const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        //Si vacante.autor no es igual a usuario._id
        return false
    }else{
        return true
    }
}

//Subir CV en PDF V167
exports.subirCV = (req,res, next) => {
    console.log('----------------------Dentro de vacantesController.subirCV----------------------');
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: 100kb Max');
                }else {
                    req.flash('error', error.message);
                }
            }else {
                req.flash('error', error.message);
            }
            res.redirect('back'); //back regresa a la pagina donde se origino el error
            return;
        }else {
            return next();
        }
    });    
}
//Configuracion de Multer
const configMulter = {
    limits: { fileSize : 500000},
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
            //Esto es para comprobar que funciona
            console.log('');
            console.log('---------------Chequeando la funcion configMulter en vacantesController.subirCV---------------');
            console.log(`${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf') {
            cb(null, true);//True cuando el formato es valido
        }else {
            cb(new Error('Formato No Válido'));
        }
    }
}
const upload = multer(configMulter).single('cv');//Single revisa el campo, en este caso el campo de la vista es cv

//Almacenar la informacion de contacto en la Base de Datos V:168 Esto va de la mano con subirCV
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });
    
    //Si no existe la vacante
    if(!vacante) return next();

    //Si existe, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename //Este req.file los genera MULTER
    }

    //Almacenar
    // candidatos al ser un arreglo, nos permite utilizar metodos de arreglo, como .push que colocaria el nuevo candidato al final de la cola
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flash y redirect
    req.flash('correcto', 'Información de contacto enviada correctamente');
    res.redirect('/');//Pagina principal
} 

//Mostrar Candidatos V170
exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean();//Tomo id porque es como tengo definido el routes => :id .lean() para que me muestre los datos en la vista
    console.log(vacante);
    //Validacion si el usuario que esta loguaedo es el que manda la peticion de candidatos
    if(vacante.autor != req.user._id.toString()) {
        return next();
    }
    if(!vacante) return netx();
    //Si pasamos la validacion
    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

//Barra de Busqueda de Vacantes V180. Tengo que crear un indice en el modelo Vacante
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({ //la variable vacantes tiene que ser con s al final porque tiene que ser igual a la que utilizo en la vista
        $text : {
            $search : req.body.q
        }
    }).lean(); //.lean() Para que los datos se impriman en la vista
    
    //Mostrar las Vacantes
    res.render('home', {
        nombrePagina : `Resultados de Búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}