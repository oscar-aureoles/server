function opciones_tipoUsuario(){

}

function showimagepreview(input) {
	if (input.files && input.files[0]) { 
		var reader = new FileReader();
		reader.onload = function (e) {
			document.getElementsByTagName("img")[5].setAttribute("src", e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}  
 } 

function validar_usuario(){
	//validamos los datos que son obligatorios ara todo tio de usuario
	if ((document.getElementById('curp').value).length === 18 & (document.getElementById('nombre').value)!='' &
	 document.getElementById('apellido_paterno').value !='' & document.getElementById('apellido_materno').value !='' &
	 document.getElementById('tipo_usuario').value > 0 & document.getElementById('email').value !='' &
	 document.getElementById('cct').value !='' & document.getElementById('tipo_sostenimiento').value > 0 &
	 document.getElementById('entidad').value > 0 & document.getElementById('nombre_usuario').value !='' &
	 document.getElementById('contrasena').value !='' & document.getElementById('status_cuenta').value > -1){
	 	if( ( (document.getElementById('curp').value).toUpperCase().match(/^([A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])([1-9]|[12]\d|3[01])[HM](AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[A-Z\d])(\d)/) ) ){
			return true;
		}else{
			swal('Error:', 'Curp No Valida','error');
			document.getElementById('btRegistrarUsuario').value = "Registrar Usuario";
			document.getElementById('btRegistrarUsuario').enabled = true;
			return false;
		}
	}else{
		swal('Error:', 'Campos Vacios','error');
		document.getElementById('btRegistrarUsuario').value = "Registrar Usuario";
		document.getElementById('btRegistrarUsuario').enabled = true;
		return false;
	}
}

function cancelar_registro(){
	location.href ="/admin_usuarios";
}

function cambiar_fecha(){
	if(document.getElementById('status_asignacion').value === '0')
		document.getElementById('fecha_asignacion').value = null;
	else if(document.getElementById('status_asignacion').value === '1')
		document.getElementById('fecha_asignacion').value = new Date().toUTCString();
	else
		document.getElementById('fecha_asignacion').value = '---';
}