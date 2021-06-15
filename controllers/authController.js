const passport = require('passport');
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante');//VID 149
const Usuarios = mongoose.model('Usuarios');//Importo modelo usuarios para resetear password V 173
const crypto = require('crypto');//Genera un token que utilizo para restablecer la contraseña
const enviarEmail = require('../handlers/email'); //Importo la configuracion para enviar email de restauracion V175

//VID 144
exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son requeridos'
})

//Revisar si el usuario esta autenticado VID 147
exports.verificarUsuario = (req, res, next) => {
    //revisar usuario. Metodo de passport que almacena y devulevte true o false si el usuario esta autenticado
    if(req.isAuthenticated()){
        return next();//Esta autenticado
    }else{
        res.redirect('/iniciar-sesion');
    }
}

//VID 146. Mostrar Panel Administracion
exports.mostrarPanel = async (req, res) => {
    //Consultar el usuario autenticado VID 149
    const vacantes = await Vacante.find({ autor : req.user._id }).lean();
    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra tus Vacantes desde aquí',
        cerrarSesion: true,//Barra de navegacion y nombre de usuario VID 152
        nombre: req.user.nombre,//Le mando el nombre a la vista, desconosco porque no tuve que usar .toObject() como en usuariosController.js
        imagen: req.user.imagen,//Imagen de perfil VID 164. Agrego una clase para mostrar la imagen en la vista layout principal creo .admin-perfil en el .css
        vacantes//VID 149Le paso la vacante a la vista administracion
    })
}

//Cerrar Sesion
exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Sesión finalizada Correctamente');
    //Redirecciono
    return res.redirect('/iniciar-sesion');
}

/*Restablecer Contraseñá 172*/
exports.formRestablecerPassword = (req, res) => {
    //Render a la vista restablecer-password
    res.render('restablecer-password', {
        nombrePagina: 'Restablecer Contraseña',
        tagline: 'Ingresa tu E-Mail'
    })
}

//Generar Token en la tabla usuario V 173
exports.enviarToken = async (req, res) => {
    //Verificar si el usuario existe con su email
    const usuario = await Usuarios.findOne({email : req.body.email});
    //Si el usuario no existe
    if(!usuario) {
        req.flash('error', 'Correo electronico no registrado');
        return res.redirect('/iniciar-sesion'); //Utilizo return para que no se ejecute nada mas
    }
    //El usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;
    console.log(resetUrl);

    //Enviar email de restauracion de pw V175   
    await enviarEmail.enviar({
        //Mando las opciones
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('correcto', 'Mail de restauración enviado, revisa tu dirección de correo electronico');
    res.redirect('/iniciar-sesion');
}

//V 177 Validar si el token es valido y el usuario existe, Mostrar la VISTA
exports.restablecerPassword = async(req, res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token, //token viene del router :token
        expira: {
            $gt: Date.now() //Operador $gt (greater than)
        }
    });

    //Si no existe el usuario o no coinciden el token o la fecha de expiracion caduco
    if(!usuario) {
        req.flash('error', 'El formulario expiró');
        return res.redirect('/restablecer-password');
    }

    //Si todo bien, mostrar el formulario de restauracion V177
    res.render('nuevo-password', {
        nombrePagina: 'Restablece tu Contraseña'
    })
}

//V 178 Guardar el nuevo password en la base de datos
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token, //token viene del router :token
        expira: {
            $gt: Date.now() //Operador $gt (greater than)
        }
    });

    //Si hay error
    if(!usuario) {
        req.flash('error', 'El formulario expiró');
        return res.redirect('/restablecer-password');
    }

    //Asignar nuevo password y limpiar valores de verificacion
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //Guardar en la base de datos
    await usuario.save();
    //redirigir
    req.flash('correcto', 'Su contraseña se modifico satisfactoriamente');
    res.redirect('/iniciar-sesion');
}