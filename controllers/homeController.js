//Importo el modelo
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

//Vid 110
exports.mostrarTrabajos = async (req,res, next) => {

    //Mostrar las Vacantes VID 126
    const vacantes = await Vacante.find().lean();//Traigo todas las Vacantes como SELECT * FROM Vacante. El .lean() soluciona un error que no imprimen los valores en la vista
    if(!vacantes) return next();
    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Publica Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
}