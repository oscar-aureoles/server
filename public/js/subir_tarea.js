function cancelar_regresar(id){
	location.href ="/mi_curso/" + id;
}

function subirTarea(){
	if (document.getElementById('archivoS').value != '') {
		return true;
	}else{
		swal('Error: ', 'Carge un archivo antes de continuar','error');
		return false;
	}
}

function redireccionar(id){
	location.href= '/tutor_tarea/' + id;
}