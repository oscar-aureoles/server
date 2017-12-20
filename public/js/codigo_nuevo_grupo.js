function seleccionar_tutor(id){
	elementos = document.getElementById('body_tabla').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('fila'+id).style.background = 'grey';
	document.getElementById('fila'+id).style.color = 'white';
	document.getElementById('tutorSel').value = ''+id;
}

function validar_grupo(){
	if ((document.getElementById('nombre').value)!='' & (document.getElementById('tutorSel').value)!='') {
		return true;
	}else{
		swal('Error:', 'Escriba el nombre del Grupo y seleccione un Tutor','error');
		document.getElementById('btRegistrarGrupo').value = "Registrar Grupo";
		document.getElementById('btRegistrarGrupo').enabled = true;
		return false;
	}
}

function cancelar_registro(id){
	location.href ="/curso/" + id;
}