function seleccionar_usuario(id, nombre){
	document.getElementById('btnEnviar').disabled = false;
	document.getElementById('curp_usuario_sel').value = id;
	document.getElementById('nombre_usuario_sel').value = nombre;
	elementos = document.getElementById('body_tabla').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('fila'+id).style.background = 'grey';
	document.getElementById('fila'+id).style.color = 'white';
	location.href ="/mensajes/" + id;
}

function seleccionar_usuarioA(id, nombre){
	document.getElementById('btnEnviar').disabled = false;
	document.getElementById('curp_usuario_sel').value = id;
	document.getElementById('nombre_usuario_sel').value = nombre;
	elementos = document.getElementById('body_tabla').getElementsByTagName('tr');
	for (var i = elementos.length - 1; i >= 0; i--) {
		elementos[i].style.background = 'white';
		elementos[i].style.color = 'black';
	}
	document.getElementById('fila'+id).style.background = 'grey';
	document.getElementById('fila'+id).style.color = 'white';
}

function usuarioSel(idUsuario, nombreUsuario){
	if (idUsuario != '' & idUsuario != undefined) {
		document.getElementById('curp_usuario_sel').value = idUsuario;
		document.getElementById('nombre_usuario_sel').value = nombreUsuario;
		document.getElementById('btnEnviar').disabled = false;
		document.getElementById('fila'+idUsuario).style.background = 'grey';
		document.getElementById('fila'+idUsuario).style.color = 'white';
	}else{
		document.getElementById('curp_usuario_sel').value = '';
		document.getElementById('nombre_usuario_sel').value = 'Usuario';
		document.getElementById('btnEnviar').disabled = true;
	}
}

function enviar_mensaje(){
	if (document.getElementById('curp_usuario_sel').value != '' & document.getElementById('text_mensaje').value != '') {
		var curp = document.getElementById('curp_usuario_sel').value;
		var mensaje = document.getElementById('text_mensaje').value;
		return true;
	}else{
		swal('Error: ', 'Escriba un mensaje','error');
		return false;
	}
}