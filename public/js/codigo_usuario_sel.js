function showimagepreview(input) {
	if (input.files && input.files[0]) { 
		var reader = new FileReader();
		reader.onload = function (e) {
			document.getElementsByTagName("img")[5].setAttribute("src", e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}  
 }

function cambiar_fecha(){
	if(document.getElementById('status_asignacion').value === '0')
		document.getElementById('fecha_asignacion').value = null;
	else if(document.getElementById('status_asignacion').value === '1')
		document.getElementById('fecha_asignacion').value = new Date();
	else
		document.getElementById('fecha_asignacion').value = '---';
}

function cancelar_registro(){
	location.href ="/admin_usuarios";
}

function validar_usuario(){
	//validamos los datos que son obligatorios ara todo tio de usuario
	if ((document.getElementById('curp').value).length === 18 & (document.getElementById('nombre').value)!='' &
	 document.getElementById('apellido_paterno').value !='' & document.getElementById('apellido_materno').value !='' &
	 document.getElementById('tipo_usuario').value > 0 & document.getElementById('email').value !='' &
	 document.getElementById('cct').value !='' & document.getElementById('tipo_sostenimiento').value > 0 &
	 document.getElementById('entidad').value > 0 & document.getElementById('nombre_usuario').value !='' &
	 document.getElementById('contrasena').value !='' & document.getElementById('status_cuenta').value > -1){
	 	//validamos los datos que son obligatorios ara ada tio de usuario
	 	/*if (document.getElementById('categoria').value !='' & document.getElementById('funcion').value > 0 &
	 		document.getElementById('nivel_educativo').value > 0 & document.getElementById('bloque').value > 0 &
	 		document.getElementById('tipo_examen').value > 0 & document.getElementById('convocatoria_seleccionada').value > 0 &
	 		document.getElementById('status_asignacion').value > -1 & document.getElementById('fecha_asignacion').value !='') {
	 		return false;
	 	}*/
		return true;
	}else{
		swal('Error:', 'Campos Vacios','error');
		document.getElementById('btModificarUsuario').value = "Modificar Usuario";
		document.getElementById('btModificarUsuario').enabled = true;
		return false;
	}
}