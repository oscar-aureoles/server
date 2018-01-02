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
      middleware_upload(req,res,function(err) {
         db_codigo.modificar_usuario(req, res);
         if(err) {
            console.log('Error al cargar la imagen');
            return res.end("Error uploading file.");
         }
      });
   }
})

//iniiar el servidor en el uerto 8085
app.listen(port);
console.log("Run Server")