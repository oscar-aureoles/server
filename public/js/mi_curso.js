function agregar_actividad_valores(id){
	var html = document.getElementById('html' + id).value;
	document.getElementById('aaa'+id).innerHTML = '<divider>' + html;
}

function sesion_activa(id, fechaI){
	var hoy = new Date();
	var FI = new Date(fechaI);
	if ((hoy) <= (FI)) {
		document.getElementById('sesion'+id).style.display = 'none';
	}
}

function btn_subir_tarea(id, fechaF){
	var hoy = new Date();
	var FF = new Date(fechaF);
	FF.setDate((FF.getDate()) + 1);
	if ((FF) < (hoy)) {
		document.getElementById('btnSubirTarea'+id).disabled = true;
	}
}

function subirTarea(id){
	location.href ="/subir_tarea/" + id;
}

function actividadRealizada(id_actividad, id_sesion){
	var id_curso = window.location.pathname;
	id_curso = id_curso.substring(10);
	location.href ="/actualizarActividad/" + id_curso + '/id_actividad/' + id_actividad + '/id_sesion/' + id_sesion;
	//swal('Información: ', id_curso +  ' - ' + id_actividad,'info');
}

function verTarea(id){
	location.href ="/ver_tarea/" + id;
}