import axios from 'axios';//Alertas V156
import Swal from 'sweetalert2';//Alertas V156

document.addEventListener('DOMContentLoaded', () => {
    const skills =document.querySelector('.lista-conocimientos');//Selecciono la lista de nueva-vacante.handlebars

    //Limpiar alertas
    let alertas = document.querySelector('.alertas') //.alertas es el contenedor padre de todas las alertas
    if(alertas) {
        limpiarAlertas();//La declaro mas abajo
    }
    
    if(skills){
        skills.addEventListener('click', agregarSkills); //Cuando hago click
        //En la ventanda de edicion
        skillsSeleccionados();
    }
    //VID 156. Esto va en conjunto con vacantesController.eliminarVacante
    const vacantesListado = document.querySelector('.panel-administracion'); //Selecciono el elemento clase panel-administracion del html V156
    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado); // Este evento va a escuchar todos los clicks que de el usuario y va a ejecutar accionesListado
    }
})

//Creo un SET
const skills = new Set();

const agregarSkills = (e) => {
    // console.log(e.target);//Chequear que funcion
    //Si el lugar donde estoy haciendo click tiene la etiqueta li (etiqueta de lista)
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            //Quitar del SET y Quitar CLase Activo
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        }else {
            //Agregar al SET y Agregar Clase Activo
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills] //Creo una copia del SET y la convierto en array
    document.querySelector('#skills').value = skillsArray; //Tranajo con el input hidden skills de la vista nueva-vacante
}

//Editar vacante. Funcion para rellenar el input hidden con las skills VID 131
const skillsSeleccionados = () => {
    //Obtengo los valores leyendo la clase de editar-vacantes.handlebars
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo')); //Con Array.from combierto a un ARRAY lo que traigo de la clase.
    console.log(seleccionadas);//Este console.log lo leo en la consola del navegador

    //Limpio de codigo HTML el arreglo. Ej: la etiqueta li
    //Como es un arreglo puedo utilizar forEach
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent); //Reurilizo el SET
    })

    //Inyectarlo en el HIDDEN. #skills es el ID de la clase de editar-vacantes.handlebars
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
}

const limpiarAlertas = () => {
    //Si existen las alertas, si Alertas tiene clases hijas alerta VER VID 141
    const alertas = document.querySelector('.alertas');
    
    const interval = setInterval(() => {
        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0])        
        }else if(alertas.children.length ===0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);//Detengo el intervalo cuando elimino la clase Madre
        }
    },2000); // Cada un segundo elimino las alertas
}

//Eliminar Vacante VID 156 accionesListado = e (evento). Esto trabaja con webpack. y VID 157
//Esto trabaja en conjunto con vancatesController.eliminarVacante
const accionesListado = e => {
    // e.preventDefault();//Previene la ejecucion
    // console.log(e.target); //Cada vez que de click va a aparecer en la consola del navegador el evento click.
    if(e.target.dataset.eliminar) { //*1  --- Si donde hice click es el atributo data-eliminar     
        Swal.fire({
            title: '¿ Esta seguro que desea eliminar ?',
            text: "Una vez eliminada no se peude recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) { //Enviar peticion por medio de axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;//*2
                axios.delete(url, { params: {url} })//*3
                    .then(function(respuesta) {//Si hay respuesta -----//console.log(respuesta)Para testear
                        if(respuesta.status === 200){ //*4
                            Swal.fire(
                                'Eliminado!',
                                respuesta.data,
                                'success'
                            );
                            //TODO Eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)//*5
                        }
                    })
                    .catch(() => {//VID 158
                        Swal.fire({
                            type: 'error',
                            title: 'Error',
                            text: 'Error al eliminar la vacante'
                        })
                    })
            }
          })          
    }else if(e.target.tagName === 'A') { //Si donde hago click es un enlace
        //Si doy click en los otros enlaces, ve a esos enlaces
        window.location.href = e.target.href;
    }
}
//Comentarios de la funcion accionesListado
// 1 - Dataset es un atributo personalizado que agregue en la vista administracion en a href --> data-eliminar="{id}" 
//dataset es el atributo data y .eliminar es =eliminar
// 2 - location.origin me trae el servidor actual
// 3 -Axios para eliminar el registro Parametros (<la url>, <parametros que deseo enviar>)
// 4 - .status===200 Quiere decir que salio todo bien. La respuesta viene enviada de vacantesController.eliminarVacante
// 5 - .removeChild() utilizo dos parent element para que seleccione la clase vacante, lo puedo ver en inspeccionar elemento o en la vista
//En la primera parte uso 3 parentElement para llegar al elemento padre de la vacante desde donde estoy posicionado que es el boton de elimiar VID 157