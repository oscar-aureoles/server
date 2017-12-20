// Inicializamos la clase para el componente select
$(document).ready(function() {
    $('.modal').modal();
    $('select').material_select();
    $('.collapsible').collapsible();
    $('.parallax').parallax();
  });

// Inicializamos la clase datepicker para el componente input typo date
$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    today: 'Hoy',
    clear: 'Limpiar',
    close: 'Elegir',
    labelMonthSelect: 'Selecciona un mes',
    labelYearSelect: 'Selecciona un año',
    //monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic'],
    weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'],
    weekdaysLetter: ['D', 'L', 'M', 'X', 'J', 'V', 'S' ],
    weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mir', 'Jue', 'Vir', 'Sab'],
    labelMonthNext: 'Mes siguiente',
    labelMonthPrev: 'Mes anterior',
    selectYears: 5 // Creates a dropdown of 15 years to control year
});

  $('.button-collapse').sideNav({
      menuWidth: 300, // Default is 300
      edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true // Choose whether you can drag to open on touch screens
    }
  );
   // Show sideNav
  $('.button-collapse').sideNav('show');

//Inicializamos materila box(imagen)
  $(document).ready(function(){
    $('.materialboxed').materialbox();
  });

$('.carousel.carousel-slider').carousel({fullWidth: true});