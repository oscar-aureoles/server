function seleccionar_curso(id){
	elementos = document.getElementById('body_tabla_cursos').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('fila'+id).style.background = 'grey';
	document.getElementById('fila'+id).style.color = 'white';
	document.getElementById('cursoSel').value = ''+id;
}

function validar_curso(){
	if ((document.getElementById('cursoSel').value) != '') {
		location.href ='/reportes/cursoID/' + document.getElementById('cursoSel').value;
	}else{
		swal('Error:', 'Seleccione un curso para continuar','error');
	}
}

function seleccionar_grupo(id){
	elementos = document.getElementById('body_tabla_grupos').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('filaG'+id).style.background = 'grey';
	document.getElementById('filaG'+id).style.color = 'white';
	document.getElementById('grupoSel').value = ''+id;
}

function seleccionar_grupoTodos(){
	elementos = document.getElementById('body_tabla_grupos').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('filaGTodos').style.background = 'grey';
	document.getElementById('filaGTodos').style.color = 'white';
	document.getElementById('grupoSel').value = 'Todos';
	document.getElementById('RGTodos').checked = true;
}

function validar_grupo(){
	if ((document.getElementById('grupoSel').value) != '') {
		location.href ='/reportes/grupoID/' + document.getElementById('grupoSel').value;
	}else{
		swal('Error:', 'Seleccione un grupo para continuar','error');
	}
}

function seleccionar_sesion(id){
	elementos = document.getElementById('body_tabla_sesion').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('filaS'+id).style.background = 'grey';
	document.getElementById('filaS'+id).style.color = 'white';
	document.getElementById('sesionSel').value = ''+id;
}

function seleccionar_sesionTodos(){
	elementos = document.getElementById('body_tabla_sesion').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('filaSTodos').style.background = 'grey';
	document.getElementById('filaSTodos').style.color = 'white';
	document.getElementById('sesionSel').value = 'Todos';
	document.getElementById('RSTodos').checked = true;
}

function validar_sesion(){
	if ((document.getElementById('sesionSel').value) != '') {
		location.href ='/reportes/sesionID/' + document.getElementById('sesionSel').value;
	}else{
		swal('Error:', 'Seleccione una semana para continuar','error');
	}
}

function descargarExcel(){
    //Creamos un Elemento Temporal en forma de enlace
    var tmpElemento = document.createElement('a');
    // obtenemos la información desde el div que lo contiene en el html
    // Obtenemos la información de la tabla
    var data_type = 'data:application/vnd.ms-excel';
    var tabla_div = document.getElementById('tabla_resultado');
    var tabla_html = tabla_div.outerHTML.replace(/ /g, '%20');
    tmpElemento.href = data_type + ', ' + tabla_html;
    //Asignamos el nombre a nuestro EXCEL
    tmpElemento.download = 'listaActividadesTutorTutorado.xls';
    // Simulamos el click al elemento creado para descargarlo
    tmpElemento.click();
}