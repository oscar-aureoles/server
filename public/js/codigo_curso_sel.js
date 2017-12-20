function seleccionar_fila(id){
	location.href ="/grupo/" + id + '/cursoID/' + document.getElementById('id_curso').value;
}

function seleccionar_tutorado(id){
	elementos = document.getElementById('body_tabla_tutorados').getElementsByTagName('tr');
	if (document.getElementById(id).checked === false) {
		document.getElementById('fila'+id).style.background = 'white';
		document.getElementById('fila'+id).style.color = 'black';
	}else{
		document.getElementById('fila'+id).style.background = 'grey';
		document.getElementById('fila'+id).style.color = 'white';
	}	
}

function agregarAlGrupo(){
	var urs_sel = '';
	var contador = 0;
	var idGrupo = document.getElementById('grupo_id_selec').value;
	var miembrosActuales = parseInt(document.getElementById('miembros' + idGrupo).getElementsByTagName('td')[3].innerHTML);
	var maxMiembros = parseInt(document.getElementById('maxMiembros').value);
	$(document).ready(function(){
		$("input[type=checkbox]:checked").each(function(){
			//cada elemento seleccionado
			contador ++;
			urs_sel += ($(this).val()) + ',';
		});
		if ((urs_sel === '') || ((document.getElementById('grupo_id_selec').value) === '0')) {
			swal('Error: ', 'Seleccione al menos un tutorado y un grupo','error');
		}else{//validado, mandamos al servidor los tutorados al gruo seleionado  
			if ( (contador + miembrosActuales) <= maxMiembros) {
				//swal('agregar', 'Max - ' + maxMiembros + ' ,miembrosActuales - ' + miembrosActuales + ' ,NumSel - ' + contador,'info');
				location.href ="/grupo_usuario/" + urs_sel + '/grupoID/' + document.getElementById('grupo_id_selec').value + "/cursoID/" + document.getElementById('id_curso').value;
			}else{
				swal('Error: ', 'El número de miembros sobrepasa el máximo permitido','error');
			}
		}
	});
}

function validar_modifSesiones(){
	return true;
}

function validar_modifCurso(){
	if ( (document.getElementById('nombre').value) != '' & (document.getElementById('descripcion').value) != '' & (document.getElementById('descripcion').value).length <= 125) {
		return true;
	}else{
		swal('Error:', 'Campos Vacios/No Validos','error');
		document.getElementById('btModificarCurso').value = "Modificar Curso";
		document.getElementById('btModificarCurso').enabled = true;
		return false;
	}
}

function nuevoGrupo(id){
	location.href ="/nuevo_grupo/curso/" + id;
}