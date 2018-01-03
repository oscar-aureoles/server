//variables
var express = require("express"), 
fs = require("fs"), 
path = require("path"), 
mysql = require('mysql'), 
session = require('express-session'), 
bodyParser = require('body-parser'),
db_codigo = require("./js_server/db_codigo.js"),
multipart = require('connect-multiparty'),
multer = require('multer'),
cors = require('cors');
var mv = require('mv');
var app = express();
var curso_id_sel;//almacena el id del curso que se ha seleccionado desde admin_ursos
var grupo_id_sel;//almacena el id del grupo que se ha seleccionado
var usuario_id_sel;//almacena el id del usuario que se ha seleccionado
var gruponewID, cursoID;//almacena los datos del curso al que se agregara el grupo nuevo, se usa en nuevo_grupo
var modif;//almacena un string con la opcion que se modifico, se usa en modifiar_sesiones, /grupo_usuario/:id_tutorados/grupoID/:idG/cursoID/:idC,
var id_curso_contenidoCurso;//almacena el id del curso
const port = process.env.PORT || 3000; 
var id_aviso;//almacena el id del aviso
app.use(multipart());
app.use(cors());//permite responder a solicitudes de recursos de la carpeta public
app.set('view engine', 'jade');//motor de vistas
app.use(bodyParser.urlencoded({ extended: true }));//arsear ontenido ara metodo ost
app.use(express.static(path.join(__dirname, 'public')));//estableer areta ublia
app.use(session({secret: 'sesionTutorias', resave: false, saveUninitialized: false}));//usar sesiones

var storage = multer.diskStorage({
   destination: function(req, file, callback) {
      callback(null, './public/asset/asset_fotoPerfilUsers')
   },
   filename: function(req, file, callback) {
      console.log(file)
      console.log(req.body)
      callback(null, req.body.curp  + path.extname(file.originalname))
   }
})
var middleware_upload = multer({ storage : storage}).single('foto');

app.get('/', function (req, res) {
	//res.render('login', {error: true, encontrado: true, userCurp: undefined, user: undefined});
	db_codigo.pagina_principal(req, res);
})

app.get('/login', function (req, res) {
   if (req.session.user) {
      db_codigo.cursos(req, res);
   }else{
      res.render('login', {error: false, titulo: 'Login'});
   }
})

app.post('/login', function (req, res) {
   db_codigo.login(req, res);
})

app.get('/recuperar_credenciales', function (req, res) {
   res.render('pass_olvidado', {Titulo: 'Recuperar Contraseña'});
})

app.post('/recuperar_credenciales', function (req, res) {
   db_codigo.recupera_credenciales(req, res);
})

app.get('/salir', function (req, res) {
   req.session.destroy(function(){
      console.log("Usuario finalizo la sesion.")
   });
   res.redirect('/');
})

app.get('/cursos', function (req, res) {
   db_codigo.cursos(req, res);
})

app.get('/admin_usuarios',  function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.admin_usuarios(req, res);
   }
})

app.get('/usuario', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.usuario(req, res, usuario_id_sel, false);
      usuario_id_sel = undefined;
   }   
})

app.get('/nuevo_usuario', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.nuevo_usuario(req, res, false, false, null);
   }
})

app.post('/nuevo_usuario', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      var ruta = 'asset/asset_fotoPerfilUsers/' + req.body.curp + db_codigo.getFirstFileName2(req.files.foto.name);;
         //ruta temporal, puede ser algo así C:\Users\User\AppData\Local\Temp\7056-12616ij.png
         var temporalPath = req.files.foto.path;
         //ruta final donde alojaremos el archivo, le cambiamos el nombre para que 
         //sea estilo imagen-4365436.extension
         var finalPath = './public/asset/asset_fotoPerfilUsers/' + req.body.curp + db_codigo.getFirstFileName2(req.files.foto.name);
         //si la extension no está permitida salimos con un mensaje
         if(db_codigo.checkExtension(req.files.foto.name) === false){
            res.send('Formato No Valido');
         }else{
            db_codigo.insert_nuevo_usuario(req, res);
            mv(temporalPath, finalPath, function(err) {
               if (err) { throw err; }
               console.log('file moved successfully');
            });
            //guardamos el archivo
            // fs.exists(finalPath, function(exists){
            //    //si existe
            //    if(exists){
            //       //db_codigo.tarea_tutorado(req, res, 'archivoExiste', null);
            //       res.end();
            //    }else{
            //       fs.rename(temporalPath, finalPath, function(error){
            //          if(error){throw error;}else{
            //             db_codigo.insert_nuevo_usuario(req, res);
            //             //db_codigo.tarea_tutorado(req, res, 'success', ruta);
            //          }
            //          // eliminamos el archivo temporal
            //          fs.unlink(temporalPath, function(){
            //             if(error){throw error;}
            //          });
            //       });
            //    }
            // });
         }
   }
})

app.get('/usuario/:usuario_id', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      usuario_id_sel = req.params.usuario_id;
      res.redirect("/usuario");
   }
})//solicitud de modifiar-visualizar usuario get

app.post('/modificar_usuario', function (req, res){
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      console.log("DATOS FOTO");
      console.log(req.files.foto);
      var ruta = 'asset/asset_fotoPerfilUsers/' + req.body.curp + db_codigo.getFirstFileName2(req.files.foto.name);;
         //ruta temporal, puede ser algo así C:\Users\User\AppData\Local\Temp\7056-12616ij.png
         var temporalPath = req.files.foto.path;
         //ruta final donde alojaremos el archivo, le cambiamos el nombre para que 
         //sea estilo imagen-4365436.extension
         var finalPath = './public/asset/asset_fotoPerfilUsers/' + req.body.curp + db_codigo.getFirstFileName2(req.files.foto.name);
         //si la extension no está permitida salimos con un mensaje
         if(db_codigo.checkExtension(req.files.foto.name) === false){
            if (req.files.foto.name === '') {
               db_codigo.modificar_usuario(req, res);
            }else{
               res.send('Formato No Valido');
            }
         }else{
            db_codigo.modificar_usuario(req, res);
            mv(temporalPath, finalPath, function(err) {
               if (err) { throw err; }
               console.log('file moved successfully');
            });
         }
   }
})

app.get('/admin_cursos',  function (req, res) {//solicitud de admin ursos get
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.admin_cursos(req, res);
   }
})

app.get('/nuevo_curso', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.nuevo_curso(req, res, false);
   }
})

app.post('/nuevo_curso', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.insert_nuevo_curso(req, res);
   }
})

app.get('/curso/:curso_id', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      curso_id_sel = req.params.curso_id;
      res.redirect("/curso");
   }
})

app.get('/curso', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      if (modif === 'modifSesiones') {
         db_codigo.curso(req, res, curso_id_sel, grupo_id_sel, 'true');
      }else if (modif === 'TutoradosAgregados') {
         db_codigo.curso(req, res, curso_id_sel, grupo_id_sel, 'tutoradosAgregados');
      }else if(modif === 'modifDatosCurso'){
         db_codigo.curso(req, res, curso_id_sel, grupo_id_sel, 'modifDatosCurso');
      }else{
         db_codigo.curso(req, res, curso_id_sel, grupo_id_sel, 'false');
      }
      grupo_id_sel = undefined;
      curso_id_sel = undefined;
      modif = '';
   }   
})

app.post('/modificar_curso', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.modificar_curso(req, res);
      modif = 'modifDatosCurso';
      curso_id_sel = req.body.idCursoSel;
      res.redirect("/curso");
   }
})

app.post('/modificar_sesiones', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.modificar_fechas_sesiones(req, res);
      modif = 'modifSesiones';
      curso_id_sel = req.body.idCursoSesiones;
      res.redirect("/curso");
   }
})

app.get('/nuevo_grupo/curso/:idC', function (req, res){
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      cursoID = req.params.idC;
      res.redirect('/nuevo_grupo');
   } 
})

app.get('/nuevo_grupo', function (req, res){
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.nuevo_grupo(req, res, cursoID, false);
   } 
})

app.post('/nuevo_grupo', function (req, res){
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.insert_nuevo_grupo(req, res);
   } 
})

app.get('/grupo/:id/cursoID/:idC', function (req, res){
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      grupo_id_sel = req.params.id;
      curso_id_sel = req.params.idC;
      res.redirect("/curso");
   }
})//solicitud de visualizar miembros del grupo get

app.get('/grupo_usuario/:id_tutorados/grupoID/:idG/cursoID/:idC', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.insert_usuario_grupo(res, req.params.id_tutorados, req.params.idG);
      curso_id_sel = req.params.idC;
      modif = 'TutoradosAgregados';
      res.redirect("/curso");
   }
})//solicitud de agregar tutorados a un grupo get

app.get('/contenido_curso/:id', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.contenido_curso(req, res);
      id_curso_contenidoCurso = req.params.id;
   }
})//solicitud de visualizar contenido del curso admin get

app.post('/nuevo_mensaje', function (req, res) {
   if (req.session.user) {
      db_codigo.nuevo_mensaje(req, res);
   }else{
      res.redirect('/login');
   }
})

app.get('/calendario', function (req, res) {
   if (req.session.user) {
      db_codigo.calendario(req, res, id_aviso);
      id_aviso = undefined;
   }else{
      res.redirect('/login');
   }
})

app.get('/ver_avisos', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.ver_avisos(req, res);
   }
})

app.post('/nuevo_aviso', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.nuevo_aviso(req, res);
   }
})

app.get('/eliminar_aviso/:id', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.eliminar_aviso(req, res);
   }
})

app.get('/aviso/:id', function (req, res) {
   if (req.session.user) {
      id_aviso = req.params.id;
      res.redirect('/calendario');
   }else{
      res.redirect('/login');
   }
})

app.get('/avisos', function (req, res) {
   if (req.session.user) {
      db_codigo.avisos(req, res);
   }else{
      res.redirect('/login');
   }
})

app.get('/mi_curso/:id', function (req, res) {
    if (req.session.user) {
        if (req.session.user.tipo_usuario === 'Tutor' | req.session.user.tipo_usuario === 'Tutorado') {
         req.session.user.subir_tareaID = undefined;
         req.session.user.ver_tareaID = undefined;
            if (req.session.user.actividadActualiza === undefined) {
               db_codigo.mi_curso(req, res, undefined, undefined);
            }else{
               db_codigo.mi_curso(req, res, req.session.user.actividadActualiza, req.session.user.sesionActividadActualiza);
            }
        }else{
         res.redirect('/login');
        }
    }else{
      res.redirect('/login');
    }
})//solicitud de visualizar contenido del curso tutorado-turor get

app.get('/actualizarActividad/:idCurso/id_actividad/:idActividad/id_sesion/:idSesion', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutor' | req.session.user.tipo_usuario === 'Tutorado') {

         db_codigo.actualizarStatusActividad(req, res);
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

app.get('/mensajes', function (req, res) {
   if (req.session.user) {
      db_codigo.mensajes(req, res);
   }else{
      res.redirect('/login');
   }
})

app.get('/mensajes/:curp', function (req, res) {
   if (req.session.user) {
      req.session.user.curp_mensaje = req.params.curp;
      db_codigo.verMensajeLeido(req, res);
   }
})

app.post('/nueva_actividad', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.nueva_actividad(req, res, id_curso_contenidoCurso);
      if (id_curso_contenidoCurso != undefined) {
         res.redirect('/contenido_curso/'+id_curso_contenidoCurso);
      }else{
         res.redirect('/login');
      }
   }
})

//modulos en desarrollo
app.get('/reportes', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      db_codigo.reportes(req, res);
   }
})

app.get('/reportes/cursoID/:idC', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      req.session.user.reportesIdCurso = req.params.idC;
      req.session.user.reportesIdGrupo = undefined;
      req.session.user.reportesIdSesion = undefined;
      res.redirect('/reportes');
   }
})

app.get('/reportes/grupoID/:idG', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      req.session.user.reportesIdGrupo = req.params.idG;
      res.redirect('/reportes');
   }
})

app.get('/reportes/sesionID/:idS', function (req, res) {
   if ((require("./js_server/validaTipoUser.js")).esAdmin(req, res)) {
      req.session.user.reportesIdSesion = req.params.idS;
      res.redirect('/reportes');
   }
})

//modulo en desarrollo
app.get('/subir_tarea/:id', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutorado') {
         req.session.user.subir_tareaID = req.params.id;
         res.redirect('/subir_tarea');
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

app.get('/subir_tarea', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutorado') {
         if (req.session.user.subir_tareaID != undefined) {
            db_codigo.tarea_tutorado(req, res, 'false', null);
         }else{
            res.redirect('/login');
         }        
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

app.post('/subir_tarea', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutorado') {
         var ruta = 'archivos/tareas/' + db_codigo.getFirstFileName(req.files.archivo.name);;
         //ruta temporal, puede ser algo así C:\Users\User\AppData\Local\Temp\7056-12616ij.png
         var temporalPath = req.files.archivo.path;
         //ruta final donde alojaremos el archivo, le cambiamos el nombre para que 
         //sea estilo imagen-4365436.extension
         var finalPath = './public/archivos/tareas/' + db_codigo.getFirstFileName(req.files.archivo.name);
         //si la extension no está permitida salimos con un mensaje
         if(db_codigo.checkExtension(req.files.archivo.name) === false){
            db_codigo.tarea_tutorado(req, res, 'formatoInvalido', null);
         }else{
            //guardamos el archivo
            fs.exists(finalPath, function(exists){
               //si existe
               if(exists){
                  db_codigo.tarea_tutorado(req, res, 'archivoExiste', null);
               }else{
                  fs.rename(temporalPath, finalPath, function(error){
                     if(error){throw error;}else{
                        db_codigo.tarea_tutorado(req, res, 'success', ruta);
                     }
                     // eliminamos el archivo temporal
                     fs.unlink(temporalPath, function(){
                        if(error){throw error;}
                     });
                  });
               }
            });
         }
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

app.get('/ver_tarea/:id', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutor') {
         req.session.user.ver_tareaID = req.params.id;
         res.redirect('/ver_tarea');
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

app.get('/ver_tarea', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutor') {
         if (req.session.user.ver_tareaID != undefined) {
            db_codigo.tarea_tutor(req, res, 'false', null);
         }else{
            res.redirect('/login');
         }        
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

app.get('/tutor_tarea/:id', function (req, res) {
   if (req.session.user) {
      if (req.session.user.tipo_usuario === 'Tutor') {
         if (req.session.user.ver_tareaID != undefined) {
            db_codigo.actualizarStatusTareaTutor(req);
            res.redirect('/mi_curso/' + req.params.id);
         }else{
            res.redirect('/login');
         }        
      }else{
         res.redirect('/login');
      }
   }else{
      res.redirect('/login');
   }
})

//iniiar el servidor en el uerto 8085
app.listen(port);
console.log("Run Server")