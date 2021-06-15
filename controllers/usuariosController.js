//Importo el modelo
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const { body, validationResult } = require('express-validator');//Validacion y Zanitizar
const multer = require('multer');//Vid 159
const shortid = require('shortid');
const e = require('express');

exports.formCrearCuenta = (req, res) => {
    //Render a la vista crear cuenta
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}

exports.validarRegistro = async (req, res, next) => {
    //sanitizar los campos. Esto es diferente a lo que se ve en el curso
    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('El password es obligatorio').escape(),
        body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio').escape(),
        body('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales')
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores => Si errores es distinto de vacio
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea una cuenta en Devjobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash() //Paso los errores
        })
        return;
    } 
    //si toda la validacion es correcta
    next();
}

//VID 136
exports.crearUsuario = async (req, res, next) => {
    //Crear el usuario
    const usuario = new Usuarios(req.body);
    // const nuevoUsuario = await usuario.save();
    // if(!nuevoUsuario) return next();//Si no se crear el nuevo usuario
    //VID 142
    try {
        await usuario.save();  
        res.redirect('/iniciar-sesion'); 
    } catch (error) {
        req.flash('error', error);//El error viene del modelo de Usuarios en usuariosSchema.post
        res.redirect('/crear-cuenta');     
    }
    // res.redirect('/iniciar-sesion'); 
}

//Formulario Iniciar Sesion VID 143
exports.formIniciarSesion = (req, res) => {
    //Llamo la vista
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesión en devJobs'
    })
}

//Form Editar Perfil
exports.formEditarPerfil = (req, res) => {
    //Le digo que vista se va a ver
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil',
        usuario: req.user.toObject(),//Paso los datos de usuario a la vista editar-perfil. UTILIZO toObject solo para que me lo lea la VISTA
        cerrarSesion: true,//Barra de navegacion con cerrar sesion y el nombre del usuario VID 152
        nombre: req.user.nombre,
        imagen: req.user.imagen //Paso la imagen VID 164
    })
}

//Guardar Cambios en EDITAR PERFIL
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);//Como aca no va a la vista no utilizo toObject
    // console.log('-------------------------------Dentro de editarPerfil---------------------------------');
    // console.log(usuario); 
    usuario.nombre = req.body.nombre;//Aca me habia surgido un error, y es que .nombre lo tenia en la vista con n mayus Nombre
    usuario.email =req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password
    }
    // console.log(req.file); // return;  Chequear si se envia la imagen
    if(req.file) { //Si hay imagen.
        usuario.imagen = req.file.filename; //Inserto la ruta de la imagen en usuario.imagen
    }
    await usuario.save();
    req.flash('correcto', 'Cambios Guardados Correctamente')//correcto es la clase del .css
    //Redireccionar
    res.redirect('/administracion');
    
}

//Sanitizar EDITAR PERFIL VID 156
exports.validarPerfil = async (req, res, next) => {
    console.log('---------------------------------usuariosController.validarPerfil---------------------------------')
    console.log('El password es: ',req.body.password);
    if(req.body.password === '') {
        //Sanitizar
        const rules = [
            body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
            body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail()
        ]
        
        await Promise.all(rules.map(validation => validation.run(req)));
        const errores = validationResult(req);
        //si hay errores => Si errores es distinto de vacio
        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));
            res.render('editar-perfil', {
                nombrePagina: 'Edita tu perfil',
                usuario: req.user.toObject(),//Paso los datos de usuario a la vista editar-perfil. UTILIZO toObject solo para que me lo lea la VISTA
                cerrarSesion: true,//Barra de navegacion con cerrar sesion y el nombre del usuario VID 152
                nombre: req.user.nombre,
                imagen: req.user.imagen, //Paso la imagen VID 164
                mensajes: req.flash(),
            })
            return;
        } 
        //si toda la validacion es correcta
        next();
    }else{
        //Sanitizar
        const rules = [
            body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
            body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
            body('password').not().isEmpty().withMessage('El password es obligatorio').escape()
        ]
        
        await Promise.all(rules.map(validation => validation.run(req)));
        const errores = validationResult(req);
        //si hay errores => Si errores es distinto de vacio
        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));
            res.render('editar-perfil', {
                nombrePagina: 'Edita tu perfil',
                usuario: req.user.toObject(),//Paso los datos de usuario a la vista editar-perfil. UTILIZO toObject solo para que me lo lea la VISTA
                cerrarSesion: true,//Barra de navegacion con cerrar sesion y el nombre del usuario VID 152
                nombre: req.user.nombre,
                mensajes: req.flash()
            })
            return;
        } 
        //si toda la validacion es correcta
        next();
    }
}
//V 159/160
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        //Manejando errores de formato de imagen no valido. V 162
        if(error) {
            // console.log(error); ver el error en consola
            if(error instanceof multer.MulterError) { //Si es error de Multer
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El tamaño de la imagen debe ser menor a 100kb');
                } else {
                    req.flash('error', error.message); //Otro tipo de error de molter muestro el mensaje de error
                }
            } else { //Si no es de Multer
                req.flash('error', error.message);//Utilizo la alerta de flash
            }
            //Si existe el error, redirecciono y cancelo la ejecucion de guardar cambios en el servidor. No continuo con la ejecucion de editarPerfil
            res.redirect('/administracion');
            return;
        }else {
            //Si no hay errores
            return next(); //Continuo la ejecucion del siguiente middle que seria editarPerfil, guardaria los cambios en el servidor
        }               
    });
}
//V159.. Multer se puede declarar en el archivo principal o en un controlador individual
//Agregar al formulario de la vista editar-perfil enctype="multipart/form-data"
//Opciones Multer V 160
const configMulter = {
    //Limitar el tamaño
    limits: { fileSize : 100000},
    //Carpeta que almacena las imagenes
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,__dirname+'../../public/uploads/perfiles'); // Parametros del callback (error, destino)//Destino donde se va a almacenar la imagen
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];//Extraigo la extension de las imagenes
            cb(null, `${shortid.generate()}.${extension}`);//Genero una ID unica para la foto junto con la extension
        }
    }),
    //Filtro para que solo suban imagenes (Parametros (req, archivo, callback)) VID 161
    fileFilter (req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') { //Filtro por tipo de imagen
            //Callback => true: cuando la imagen es correcta. false: la imagen es incorrecta, no se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato no Válido'), false);//Lo manejo en subirImagen
        }
    }
}
//funcion que uso en subirImagen
const upload = multer(configMulter).single('imagen'); //imagen es el nombre de la clase de la vista editar-perfil



