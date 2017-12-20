function mostratInfoActividad(id_sesion){
	var tio = document.getElementById('tipo_actividad'+id_sesion);
	var pro = tio.options[tio.selectedIndex];
	if (pro.text === 'Tarea') {
		swal('Información: ', 'Permite crear una tarea para que los tutorados la realicen y suban su tarea, entre las fechas establecidas.','info');
	}else if (pro.text === 'Contenido') {
		swal('Información: ', 'Permite crear diverso contenido para el curso. Texto, Imagenes, Videos, Enlaces, Recursos','info');
	}else{
		//swal('Error: ', pro.value + ':' + pro.text,'error');
		swal('Error: ', 'Seleccione un tipo de actividad','error');
	}
}

function mostrar_tipo_actividad(id_sesion){
	var tio = document.getElementById('tipo_actividad'+id_sesion);
	var pro = tio.options[tio.selectedIndex];
	if (pro.text === 'Tarea') {
		document.getElementById('fechas'+id_sesion).style.display = 'block';
		document.getElementById('textarea'+id_sesion).style.display = 'block';
	}else if (pro.text === 'Contenido') {
		document.getElementById('fechas'+id_sesion).style.display = 'none';
		document.getElementById('textarea'+id_sesion).style.display = 'block';
	}else{
		document.getElementById('fechas'+id_sesion).style.display = 'none';
		document.getElementById('textarea'+id_sesion).style.display = 'none';
	}
}

function agregar_actividad(id_sesion){
	var urs_sel = '';
	$(document).ready(function(){
		$("input[type=checkbox]:checked").each(function(){
			//cada elemento seleccionado
			urs_sel += ($(this).val()) + ',';
		});
		if ((urs_sel === '') || ((document.getElementById('grupo_id_selec').value) === '0')) {
			swal('Error: ', 'Seleccione al menos un tutorado y un grupo','error');
		}else{//validado, mandamos al servidor los tutorados al gruo seleionado  
			//swal('agregar', urs_sel,'info');
			location.href ="/grupo_usuario/" + urs_sel + '/grupoID/' + document.getElementById('grupo_id_selec').value + "/cursoID/" + document.getElementById('id_curso').value;
		}
	});
}

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

function eliminar_actividad(id, id_curso){
	swal({
		title: "Eliminar Actividad",
	    text: "Esta seguro de elimar la actividad?",
	    icon: "warning",
	    buttons:{
	    	cancel: {
	    		text: "Cancelar",
			    value: false,
			    visible: true,
			    className: "",
			    closeModal: true,
			},
			confirm: {
				text: "Si, Eliminar",
			    value: true,
			    visible: true,
			    className: "",
			    closeModal: true
			}
	    }
	}).then((result) => {
		if (result === true) {
			location.href='eliminar_actividad/'+ id +'/curso/' + id_curso;
		}
	})
}