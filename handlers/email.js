//Manejador de email, para restablecer contraseñá V174
const emailConfig = require('../config/email'); //Importo la configuracion
const nodemailer = require('nodemailer'); //Dependencias a instalar
const hbs = require('nodemailer-express-handlebars');//Dependencias a instalar
const util = require('util'); //Para el callback una vez que se envia el correo

let transport = nodemailer.createTransport({
    //Esto se setea asi por sintaxis de nodemailer
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
})

//Utilizar template de handlebars V176
transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: __dirname+'/../views/emails',
        layoutsDir: __dirname+'/../views/emails',
        defaultLayout: 'reset.handlebars'
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars'
}));

//Metodo para enviar el email de restauracion. Ah esta funcion le paso los parametros de opciones en authController.enviarToken V175
exports.enviar = async (opciones) => {
    const opcionesEmail = {
        from: 'devJobs <noreply@debjovs.com',
        to: opciones.usuario.email, //Recorro el objeto opciones, que dentro de las propiedades le paso el usuario y obtengo el email
        subject: opciones.subject,
        template: opciones.archivo,//El template sale de la configuracion transport.use, el nombre del archivo del controlador, que seria 'reset'
        context: {
            resetUrl: opciones.resetUrl //Variables que mando a la vista views/emails/reset.handlebars
        }
    }
    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}
