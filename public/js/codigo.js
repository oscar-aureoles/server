function validar_login(){
	if ((document.getElementById('usuario').value)!='' & (document.getElementById('clave').value)!='') {
	 	return true;
	}else{
		swal('Error:', 'Campos Vacios','error');
		document.getElementById('btLogin').value = "Iniciar Sesión";
		document.getElementById('btLogin').enabled = true;
		return false;
	}
}

function validar_passOlvidado(){
	if (((document.getElementById('curp').value).length)===18 & (document.getElementById('curp').value)!='') {
		return true;
	}else{
		swal('Error:', 'Curp no valida o vacia','error');
	}
	document.getElementById('btLogin').value = "Recuperar Contraseña";
	document.getElementById('btLogin').enabled = true;
	return false;
}

function mostratInfoPassOlvidada(){
	swal("Información", "Para obtener sus datos de acceso, proporcione la siguiente información. La información con sus datos de acceso serán enviados a su correo electronico.", "info");
	return false;
}