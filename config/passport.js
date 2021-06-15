//VID 145
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
    //Primero definir el campo para el usuario
    usernameField : 'email',
    passwordField : 'password'
}, async (email, password, done) => {
    const usuario = await Usuarios.findOne({ email : email });
    //Si no hay usuario
    if(!usuario) return done(null, false, {
        message: 'Usuario Incorrecto'
    });
    //Usuario existe, verificar password
    const verificarPass = usuario.compararPassword(password);
    if(!verificarPass) return done(null, false, {
        message: 'Password Incorrecto'
    });
    //Usuario Existe y Pass correcto
    return done(null, usuario);
}));
passport.serializeUser((usuario, done) => done(null, usuario._id));
passport.deserializeUser(async (id, done) => {
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
})
module.exports = passport;