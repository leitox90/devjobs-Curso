//VID 122
module.exports = {
    //Dos parametros, seleccionadas por defauls vacio, para permitir que venga un arreglo vacio y no tire error. Y opciones, las opciones se explica en el video 130
    seleccionarSkills: (seleccionadas = [], opciones) => {
        
        console.log('------------------------- DESDE helpers/handlebars.js-------------------------')
        console.log(seleccionadas)
        
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery',
        'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL',
        'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize',
        'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];//Arreglo con diferentes tecnologias

        let html = '';
        //Por cada uno de ellos
        skills.forEach(skill => {
            //Se contruye un template que concatena VER DIDEO 130 de nuevo
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>
            `;
        });
        return opciones.fn().html = html;
    },
    //VID 132. Helper para Iyectar el contrato en la vista editar-vacante
    //seleccionado me devuelve que contrato fue seleccionado
    //Las opciones son el HTML, se pasan automaticamente. Ej: en este caso <option value="Freelance">Freelance</option>
    tipoContrato : (seleccionado, opciones) => {
        return opciones.fn(this).replace(
            //Recorro las opaciones del HTML, una vez encuentra la que coincide con el varlo que viene de la base de datos, cambia su estado, la marca como seleccionada.
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },
    //VID 140. Esto lo uso en layout.handlebars. Las alertas son el HTML
    mostrarAlertas: (errores = {}, alertas) => {
        //Primero extraigo el tipo de alerta, extraigo la clave del parametro errores.
        const categoria = Object.keys(errores); //En categoria almaceno el tipo de error que es.Ej: error, alerta o correcto.
        let html = ''
        if(categoria.length) {
            errores[categoria].forEach(error => {
                //construllo el HTML. Creo una alerta por cada error.
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`
            })
        }
        return alertas.fn().html = html;
    }
}