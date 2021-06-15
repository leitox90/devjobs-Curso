const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');//VID 110
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');//VID 134
const authController = require('../controllers/authController');//VID 144

//Rutas
module.exports = () => {
    // GET es cuando entramos a la pagina.
    // Autentico con authController.verificarUsuario V147
    //Main. 
    router.get('/', homeController.mostrarTrabajos);//VID 110
    
    //VACANTES
    //Ruta de Crear Vacantes. //VID 120. --- Autentico con authController.verificarUsuario V147
    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', authController.verificarUsuario,//Valido el usuario
        vacantesController.validarVacante,//Valido la vacante
        vacantesController.agregarVacante);//Agrego la vacnate a la base de datos    
    //Ruta Mostrat detalle de vacante VID 127
    router.get('/vacantes/:url', vacantesController.mostrarVacante);    
    //Editar Vacante VID 128. --- Autentico con authController.verificarUsuario V147
    router.get('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url', authController.verificarUsuario,//Verifico que el usuario este registrado
    vacantesController.validarVacante,//VALIDO LA VACANTE VID 154. El orden es importante, primero tengo que verficiar que el usuario este registrado
    vacantesController.editarVacante);//VID 133 POST de la vista editar-vacante 
    //Eliminar Vacantes
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);
    
    //Crear Cuentas VID 134, 136
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro, //Validacion VID 137
        usuariosController.crearUsuario
    );

    //Autenticar Usuarios VID 143
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    //Cerrar Sesion ruta VID 153
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);
    //Recetear Contraseña Ruta V172
    router.get('/restablecer-password', authController.formRestablecerPassword);
    router.post('/restablecer-password', authController.enviarToken);
    //Resetear Contraseña, almacenar en la base de datos despues de recibir el mail de restauracion V177
    router.get('/restablecer-password/:token', authController.restablecerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);

    //Panel de administracion VID 146 --- authController.verificarUsuario,
    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);

    //Editar Perfil V150
    router.get('/editar-perfil', authController.verificarUsuario, usuariosController.formEditarPerfil);
    router.post('/editar-perfil', 
        authController.verificarUsuario,
        // usuariosController.validarPerfil,//Valido el perfil editado VID 155
        usuariosController.subirImagen,
        usuariosController.editarPerfil);//POST de la vista editar-perfil. VID 151

    //Enviar formulario de Curriculum VID 167
    router.post('/vacantes/:url', 
        vacantesController.subirCV,
        vacantesController.contactar
    );

    //Mostrar Candidatos de Cada Vacante V170
    router.get(
        '/candidatos/:id',
        vacantesController.mostrarCandidatos
    )

    //Buscador de Vacantes V 180
    router.post('/buscador', vacantesController.buscarVacantes);

    return router;
}