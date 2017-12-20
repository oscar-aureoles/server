function eliminar_aviso(id){
	location.href ="/eliminar_aviso/"+id;
}

function validar_aviso(){
	if (document.getElementById('nombre').value !='' & document.getElementById('fecha').value !='' & document.getElementById('descripcion').value !='') {
		return true;
	}else{
		swal('Error:', 'Campos Vacios','error');
		document.getElementById('btAgregarAviso').value = "Agregar Aviso";
		document.getElementById('btAgregarAviso').enabled = true;
		return false;
	}
}