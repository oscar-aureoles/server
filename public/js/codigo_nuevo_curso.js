function validar_curso(){
	if ((document.getElementById('nombre').value)!='' & (document.getElementById('descripcion').value)!='' & document.getElementById('sesiones').value > 0) {
		var fi = new Date(document.getElementById('fecha_inicio').value);
		var ff = new Date(document.getElementById('fecha_fin').value);
	 	//if (fi <= ff) {
	 		return true;	 		
	 	//}else{
		//	swal('Error:', 'La fecha fin no debe ser menor a la fecha inicio','error');
	 	//	return false;
	 	//}
	}else{
		swal('Error:', 'Campos Vacios','error');
		document.getElementById('btRegistrarCurso').value = "Registrar Curso";
		document.getElementById('btRegistrarCurso').enabled = true;
		return false;
	}
}

function cancelar_registro(){
	location.href ="/admin_cursos";
}