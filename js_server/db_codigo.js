var mysql = require('mysql');

function conexion(){
   var con = mysql.createConnection({
      host: "us-cdbr-iron-east-05.cleardb.net",
      user: "b60fee3af52bf8",
      password: "04af59d6",
      database: "heroku_a7c9c6c212632b8"      
   });
   return con;
}

module.exports.login = function (req, res){
   var dato = [req.body.usuario, req.body.clave, 1];//variable que ontiene los datos ingresados or el usuario ara validar su login
   //realizamos la consulta a la bd para validar las credeniales 
   var sql = "select * from login join usuario on curp_usuario = curp join nivel_educativo on usuario.id_nivel_educativo = nivel_educativo.id join tipo_examen on usuario.id_tipo_examen = tipo_examen.id join bloque on usuario.id_bloque = bloque.id join entidad on usuario.id_entidad = entidad.id join tipo_sostenimiento on usuario.id_tipo_sostenimiento = tipo_sostenimiento.id join tipo_usuario on usuario.id_tipo_usuario = tipo_usuario.id join categoria on usuario.id_categoria = categoria.id join funcion on usuario.id_funcion = funcion.id where usuario=? and contrasenia = BINARY ? and status_cuenta=?";
   var con = conexion();
   con.query(sql, dato, function(error,filas){
      if (error){
         console.log("Error. consulta Login!-" + error);
         res.end();
      }else{
         if (filas.length>0) {
            var newUser = {user: filas[0].usuario,
               password: filas[0].contrasenia,
               curp: filas[0].curp_usuario,
               nombre: filas[0].nombre,
               apellido_paterno: filas[0].apellido_paterno,
               apellido_materno: filas[0].apellido_materno,
               email: filas[0].email,
               cct: filas[0].cct,
               id_nivel_educativo: filas[0].nivel_educativo,
               nivel_educativo: filas[0].nivel_educativo,
               id_funcion: filas[0].id_funcion,
               funcion: filas[0].funcion,
               convocatoria_seleccioanda: filas[0].convocatoria_seleccioanda,
               id_tipo_examen: filas[0].id_tipo_examen,
               tipo_examen: filas[0].tipo_examen,
               status_asignacion: filas[0].status_asignacion,
               fecha_asignacion: filas[0].fecha_asignacion,
               id_bloque: filas[0].id_bloque,
               bloque: filas[0].bloque,
               id_entidad: filas[0].id_entidad,
               entidad: filas[0].entidad,
               id_tipo_sostenimiento: filas[0].id_tipo_sostenimiento,
               tipo_sostenimiento: filas[0].tipo_sostenimiento,
               id_tipo_usuario: filas[0].id_tipo_usuario,
               tipo_usuario: filas[0].tipo_usuario,
               id_categoria: filas[0].id_categoria,
               categoria: filas[0].categoria
            };
            //creamos la sesion en la variable user
            req.session.user = newUser;
            //regresamos al login donde si se creo la sesion mandara a la vista correspondiente
            res.redirect("/");
         }else {//no se encontro un user con esas credeniales
            var sqlN = "select curp, usuario from login join usuario on curp_usuario = curp where usuario=? and status_cuenta=?";
            var con2 = conexion();
            con2.query(sqlN, [req.body.usuario, 1], function(errorN,filasN){
               if (errorN){
                  console.log("Error. consulta Login! segunda-" + error);
                  res.end();
               }else{
                  if (filasN.length>0) {
                     res.render('login', {error: true, encontrado: true, userCurp: filasN[0].curp, user: filasN[0].usuario});//mandamos el mensaje de error en el login y la ur ara la imagen del user 
                  }else{
                     res.render('login', {error: true, encontrado: false});//mandamos el mensaje de error en el login
                  }
               }
            });
            con2.end({timeout: 60000});
         }
      }
   });
   con.end({timeout: 60000});
}

module.exports.cursos = function (req, res){
   //validamos si hay una sesion creada que indica que se ha logeado exitosamente un usuario
   if (req.session.user) {
      //obtenemos el tipo de usuario para mandarlo a la pagina correspondiente
      if (req.session.user.tipo_usuario === 'Autoridad Educativa') {
         //obtenemos los cursos actuales y pasados
         var listaCursosActuales = new Array(), listaCursosPasados = new Array();
         var con = conexion();
         con.query('select * from curso where date(fecha_fin)>=CURDATE()', function(error, filas){
            if (error) {
               console.log("Error.  cursos actuales");
               res.end();
            }else{
               for (var i = 0; i <= filas.length - 1; i++) {
                       var curso = {id: filas[i].id,
                        nombre: filas[i].nombre_curso,
                        descripcion: filas[i].descripcion,
                        fecha_inicio: filas[i].fecha_inicio,
                        fecha_fin: filas[i].fecha_fin
                       };
                       listaCursosActuales.push(curso);
                     }
            }
            var con2 = conexion();
            con2.query('select * from curso where date(fecha_fin)<CURDATE()', function(errorS, filasS){
               if (errorS) {
                  console.log("Error.  cursos pasados");
                  res.end();
               }else{
                  for (var i = 0; i <= filasS.length - 1; i++) {
                          var cursoN = {id: filasS[i].id,
                           nombre: filasS[i].nombre_curso,
                           descripcion: filasS[i].descripcion,
                           fecha_inicio: filasS[i].fecha_inicio,
                           fecha_fin: filasS[i].fecha_fin
                          };
                          listaCursosPasados.push(cursoN);
                        }
               }
               var con3 = conexion();//obtenemos el numero de mensajes que el usuario actual no ha leido
               con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorM, filasM){
                  var numMensajes = 0;
                  if (errorM) {
                     console.log('Error - obtener numero de mensajes');
                     res.end();
                  }else{
                     if (filasM.length > 0) {
                        numMensajes = filasM[0].num_mensajes;
                     }
                     var avisoActual = false;
                     var con4 = conexion();
                     con4.query('select id, nombre_aviso, descripcion, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha from aviso where fecha = CURDATE() and id_tipo_aviso = 2', function(errorAc, filasAc){
                        if (errorAc) {
                           console.log('Error - obtener aviso actual ' + errorAc);
                           res.end();
                        }else{
                           var texto = '';
                           var tituloTexto = '';
                           for (var i = 0; i <= filasAc.length - 1; i++) {
                              texto += '<b>' + filasAc[i].nombre_aviso + '</b> - ' + filasAc[i].descripcion + '<br/><br/>';
                              tituloTexto = 'Avisos del ' + filasAc[i].fecha;
                              avisoActual = true;
                           }
                           var datos = {
                              seccionSeleccionada: 'Cursos', 
                              numMensajes: numMensajes,
                              curp_usuario: req.session.user.curp
                           };
                           datos.texto = texto;
                           datos.titulo = tituloTexto;
                           datos.avisoActual = avisoActual;
                           res.render('admin_principal', {CursosActuales: listaCursosActuales, CursosPasados: listaCursosPasados, datos: datos, titulo: 'CURSOS'});
                        }
                     });
                     con4.end();
                  }
               });
               con3.end();
            });
            con2.end();
         });
         con.end();
       }else if (req.session.user.tipo_usuario === 'Tutor') {
         //obtenemos los cursos actuales y pasados
         var listaCursosActuales = new Array(), listaCursosPasados = new Array();
         var con = conexion();
         con.query('select * from grupo join curso on id_curso = curso.id where date(fecha_fin)>=CURDATE() and curp_tutor = ?', [req.session.user.curp],function(error, filas){
            if (error) {
               console.log("Error.  cursos actuales");
               res.end();
            }else{
               for (var i = 0; i <= filas.length - 1; i++) {
                       var curso = {id: filas[i].id,
                        nombre: filas[i].nombre_curso,
                        descripcion: filas[i].descripcion,
                        fecha_inicio: filas[i].fecha_inicio,
                        fecha_fin: filas[i].fecha_fin
                       };
                       listaCursosActuales.push(curso);
                     }
            }
            var con2 = conexion();
            con2.query('select * from grupo join curso on id_curso = curso.id where date(fecha_fin)<CURDATE() and curp_tutor = ?', [req.session.user.curp],function(errorS, filasS){
               if (errorS) {
                  console.log("Error.  cursos pasados");
                  res.end();
               }else{
                  for (var i = 0; i <= filasS.length - 1; i++) {
                          var cursoN = {id: filasS[i].id,
                           nombre: filasS[i].nombre_curso,
                           descripcion: filasS[i].descripcion,
                           fecha_inicio: filasS[i].fecha_inicio,
                           fecha_fin: filasS[i].fecha_fin
                          };
                          listaCursosPasados.push(cursoN);
                        }
                  var con3 = conexion();//obtenemos el numero de mensajes que el usuario actual no ha leido
                  con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorM, filasM){
                     var numMensajes = 0;
                     if (errorM) {
                        console.log('Error - obtener numero de mensajes');
                        res.end();
                     }else{
                        if (filasM.length > 0) {
                           numMensajes = filasM[0].num_mensajes;
                        }
                        var avisoActual = false;
                        var con4 = conexion();
                        con4.query('select id, nombre_aviso, descripcion, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha from aviso where fecha = CURDATE() and id_tipo_aviso = 2', function(errorAc, filasAc){
                           if (errorAc) {
                              console.log('Error - obtener aviso actual ' + errorAc);
                              res.end();
                           }else{
                              var texto = '';
                              var tituloTexto = '';
                              for (var i = 0; i <= filasAc.length - 1; i++) {
                                 texto += '<b>' + filasAc[i].nombre_aviso + '</b> - ' + filasAc[i].descripcion + '<br/><br/>';
                                 tituloTexto = 'Avisos del ' + filasAc[i].fecha;
                                 avisoActual = true;
                              }
                              var datos = {
                                 seccionSeleccionada: 'Cursos', 
                                 numMensajes: numMensajes,
                                 curp_usuario: req.session.user.curp
                              };
                              datos.texto = texto;
                              datos.titulo = tituloTexto;
                              datos.avisoActual = avisoActual;
                              res.render('tutor_principal', {CursosActuales: listaCursosActuales, CursosPasados: listaCursosPasados, datos: datos, titulo: 'CURSOS'});
                           }
                        });
                        con4.end();
                     }
                  });
                  con3.end();
               }
            });
            con2.end();
         });
         con.end();
       }else if (req.session.user.tipo_usuario === 'Tutorado') {
         //obtenemos los cursos actuales y pasados
         var listaCursosActuales = new Array(), listaCursosPasados = new Array();
         var con = conexion();
         con.query('select * from grupo_usuario join grupo on id_grupo = grupo.id join curso on id_curso = curso.id where date(fecha_fin)>=CURDATE() and curp_tutorado = ?', [req.session.user.curp],function(error, filas){
            if (error) {
               console.log("Error.  cursos actuales");
               res.end();
            }else{
               for (var i = 0; i <= filas.length - 1; i++) {
                       var curso = {id: filas[i].id,
                        nombre: filas[i].nombre_curso,
                        descripcion: filas[i].descripcion,
                        fecha_inicio: filas[i].fecha_inicio,
                        fecha_fin: filas[i].fecha_fin
                       };
                       listaCursosActuales.push(curso);
                     }
            }
            var con2 = conexion();
            con2.query('select * from grupo_usuario join grupo on id_grupo = grupo.id join curso on id_curso = curso.id where date(fecha_fin)<CURDATE() and curp_tutorado = ?', [req.session.user.curp],function(errorS, filasS){
               if (errorS) {
                  console.log("Error.  cursos pasados");
                  res.end();
               }else{
                  for (var i = 0; i <= filasS.length - 1; i++) {
                     var cursoN = {id: filasS[i].id,
                        nombre: filasS[i].nombre_curso,
                        descripcion: filasS[i].descripcion,
                        fecha_inicio: filasS[i].fecha_inicio,
                        fecha_fin: filasS[i].fecha_fin
                     };
                     listaCursosPasados.push(cursoN);
                  }
                  var con3 = conexion();//obtenemos el numero de mensajes que el usuario actual no ha leido
                  con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorM, filasM){
                     var numMensajes = 0;
                     if (errorM) {
                        console.log('Error - obtener numero de mensajes');
                        res.end();
                     }else{
                        if (filasM.length > 0) {
                           numMensajes = filasM[0].num_mensajes;
                        }
                        var avisoActual = false;
                        var con4 = conexion();
                        con4.query('select id, nombre_aviso, descripcion, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha from aviso where fecha = CURDATE() and id_tipo_aviso = 2', function(errorAc, filasAc){
                           if (errorAc) {
                              console.log('Error - obtener aviso actual ' + errorAc);
                              res.end();
                           }else{
                              var texto = '';
                              var tituloTexto = '';
                              for (var i = 0; i <= filasAc.length - 1; i++) {
                                 texto += '<b>' + filasAc[i].nombre_aviso + '</b> - ' + filasAc[i].descripcion + '<br/><br/>';
                                 tituloTexto = 'Avisos del ' + filasAc[i].fecha;
                                 avisoActual = true;
                              }
                              var datos = {
                                 seccionSeleccionada: 'Cursos', 
                                 numMensajes: numMensajes,
                                 curp_usuario: req.session.user.curp
                              };
                              datos.texto = texto;
                              datos.titulo = tituloTexto;
                              datos.avisoActual = avisoActual;
                              res.render('tutorado_principal', {CursosActuales: listaCursosActuales, CursosPasados: listaCursosPasados, datos: datos, titulo: 'CURSOS'});
                           }
                        });
                        con4.end();
                     }
                  });
                  con3.end();
               }
            });
            con2.end();
         });
         con.end();
       }else{
           res.render('login', {error: false});
       }
   }else{
       res.render('login', {error: false});
   }
}

module.exports.admin_usuarios = function (req, res){
   //obtenemos los usuarios registrados
   var con = conexion();
   con.query("select curp, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombre, email, cct, nivel_educativo, funcion, convocatoria_seleccionada, tipo_examen, CASE WHEN status_asignacion = 1 THEN 'Asignado' ELSE 'Sin Asignar' END as status_asignacion, COALESCE(DATE_FORMAT(fecha_asignacion, '%d-%m-%Y'), '---') as fecha_asignacion, bloque, entidad, tipo_sostenimiento, tipo_usuario, categoria from usuario left join nivel_educativo on usuario.id_nivel_educativo = nivel_educativo.id left join tipo_examen on usuario.id_tipo_examen = tipo_examen.id left join bloque on usuario.id_bloque = bloque.id left join entidad on usuario.id_entidad = entidad.id left join tipo_sostenimiento on usuario.id_tipo_sostenimiento = tipo_sostenimiento.id left join tipo_usuario on usuario.id_tipo_usuario = tipo_usuario.id left join categoria on usuario.id_categoria = categoria.id left join funcion on usuario.id_funcion = funcion.id ORDER BY tipo_usuario ASC", function(error,filas){
      var listaUsuarios = [];
      if (error){
         console.log("Error. consulta admin_usuarios!");
         res.end();
      }else{
         if (filas.length>0) {
            for (var i = 0; i <= filas.length - 1; i++) {
               var newUsuario = {curp: filas[i].curp,
                  nombre: filas[i].nombre,
                  email: filas[i].email,
                  cct: filas[i].cct,
                  nivel_educativo: filas[i].nivel_educativo,
                  funcion: filas[i].funcion,
                  convocatoria_seleccionada: filas[i].convocatoria_seleccionada,
                  tipo_examen: filas[i].tipo_examen,
                  status_asignacion: filas[i].status_asignacion,
                  fecha_asignacion: filas[i].fecha_asignacion,
                  bloque: filas[i].bloque,
                  entidad: filas[i].entidad,
                  tipo_sostenimiento: filas[i].tipo_sostenimiento,
                  tipo_usuario: filas[i].tipo_usuario,
                  categoria: filas[i].categoria
               };
               listaUsuarios.push(newUsuario);
            }
         }
         var con1 = conexion();
         con1.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorM, filasM){
            var numMensajes = 0;
            if (errorM) {
               console.log('Error - obtener numero de mensajes');
               res.end();
            }else{
               if (filasM.length > 0) {
                  numMensajes = filasM[0].num_mensajes;
               }
               var datos = {
                  seccionSeleccionada: 'Administrar Usuarios', 
                  numMensajes: numMensajes,
                  curp_usuario: req.session.user.curp
               };
               res.render('admin_usuarios', {list: listaUsuarios, datos: datos, titulo: 'ADMINISTRAR USUARIOS'});
            }
         });
         con1.end({timeout: 60000});
      }
   });
   con.end({timeout: 60000});
}

function nuevo_usuario(req, res, guardado, modif, datosUser){
   var con = conexion();
   con.query("select * from tipo_usuario", function(errorTU,filasTU){
      var listaInfo = {};
      if (errorTU) {
         console.log("Error. consulta Nuveo Usuario - Tipo Usuario");
         res.send('Error - ' + errorTU);
         res.end();
      }else{
         var listaTipoUsuario = [];
         if (filasTU.length>0) {
            for (var i = 0; i <= filasTU.length - 1; i++) {
               var newTipoUsuario = {id: filasTU[i].id,
                  nombreTipoUsuario: filasTU[i].tipo_usuario
               };
               listaTipoUsuario.push(newTipoUsuario);
            }
            listaInfo.tipo_usuario = listaTipoUsuario;
            var con1 = conexion();
            con1.query("select * from bloque", function(errorB,filasB){
               if (errorB){
                  console.log("Error. consulta Nuveo Usuario - Bloques");
                  res.send('Error - ' + errorB);
                  res.end();
               }else{
                  var listaBloques = [];
                  if (filasB.length>0) {
                     for (var i = 0; i <= filasB.length - 1; i++) {
                        var newBloque = {id: filasB[i].id,
                           nombreBloque: filasB[i].bloque
                        };
                        listaBloques.push(newBloque);
                     }
                     listaInfo.bloques = listaBloques;
                  }
                  var con2 = conexion();
                  con2.query("select * from categoria", function(errorC,filasC){
                     if (errorC){
                        console.log("Error. consulta Nuveo Usuario - Categoria");
                        res.send('Error - ' + errorC);
                        res.end();
                     }else{
                        var listaCategorias = [];
                        if (filasC.length>0) {
                           for (var i = 0; i <= filasC.length - 1; i++) {
                              var newCategoria = {id: filasC[i].id,
                                 nombreCategoria: filasC[i].categoria
                              };
                              listaCategorias.push(newCategoria);
                           }
                           listaInfo.categorias = listaCategorias;
                        }
                        var con3 = conexion();
                        con3.query("select * from entidad", function(errorE,filasE){
                           if (errorE){
                              console.log("Error. consulta Nuveo Usuario - Entidad");
                              res.send('Error - ' + errorE);
                              res.end();
                           }else{
                              var listaEntidades = [];
                              if (filasE.length>0) {
                                 for (var i = 0; i <= filasE.length - 1; i++) {
                                    var newEntidad = {id: filasE[i].id,
                                       nombreEntidad: filasE[i].entidad
                                    };
                                    listaEntidades.push(newEntidad);
                                 }
                                 listaInfo.entidades = listaEntidades;
                              }
                              var con4 = conexion();
                              con4.query("select * from funcion", function(errorF,filasF){
                                 if (errorF){
                                    console.log("Error. consulta Nuveo Usuario - Funcion");
                                    res.send('Error - ' + errorF);
                                    res.end();
                                 }else{
                                    var listaFunciones = [];
                                    if (filasF.length>0) {
                                       for (var i = 0; i <= filasF.length - 1; i++) {
                                          var newfuncion = {id: filasF[i].id,
                                             nombreFuncion: filasF[i].funcion
                                          };
                                          listaFunciones.push(newfuncion);
                                       }
                                       listaInfo.funciones = listaFunciones;
                                    }
                                    var con5 = conexion();
                                    con5.query("select * from nivel_educativo", function(errorN,filasN){
                                       if (errorN){
                                          console.log("Error. consulta Nuveo Usuario - Nivel Educativo");
                                          res.send('Error - ' + errorN);
                                          res.end();
                                       }else{
                                          var listaNivelEdu = [];
                                          if (filasN.length>0) {
                                             for (var i = 0; i <= filasN.length - 1; i++) {
                                                var newNivel_edu = {id: filasN[i].id,
                                                   nombreNivel: filasN[i].nivel_educativo
                                                };
                                                listaNivelEdu.push(newNivel_edu);
                                             }
                                             listaInfo.nivel_edu = listaNivelEdu;
                                          }
                                          var con6 = conexion();
                                          con6.query("select * from tipo_examen", function(errorT,filasT){
                                             if (errorT){
                                                console.log("Error. consulta Nuveo Usuario - Tipo Examen");
                                                res.send('Error - ' + errorT);
                                                res.end();
                                             }else{
                                                var listaTipoExamen = [];
                                                if (filasT.length>0) {
                                                   for (var i = 0; i <= filasT.length - 1; i++) {
                                                      var newTipoExamen = {id: filasT[i].id,
                                                         nombreTipoExamen: filasT[i].tipo_examen
                                                      };
                                                      listaTipoExamen.push(newTipoExamen);
                                                   }
                                                   listaInfo.tipo_examen = listaTipoExamen;
                                                }
                                                var con7 = conexion();
                                                con7.query("select * from tipo_sostenimiento", function(errorTS,filasTS){
                                                   if (errorTS){
                                                      console.log("Error. consulta Nuveo Usuario - Tipo Sostenimiento");
                                                      res.send('Error - ' + errorTS);
                                                      res.end();
                                                   }else{
                                                      var listaTipoSostenimiento = [];
                                                      if (filasTS.length>0) {
                                                         for (var i = 0; i <= filasTS.length - 1; i++) {
                                                            var newTipoSostenimiento = {id: filasTS[i].id,
                                                               nombreTipoSostenimiento: filasTS[i].tipo_sostenimiento
                                                            };
                                                            listaTipoSostenimiento.push(newTipoSostenimiento);
                                                         }
                                                         listaInfo.tipo_sostenimiento = listaTipoSostenimiento;
                                                      }
                                                      var con8 = conexion();
                                                      con8.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorM, filasM){
                                                         var numMensajes = 0;
                                                         if (errorM) {
                                                            console.log('Error - obtener numero de mensajes');
                                                            res.send('Error - ' + errorM);
                                                            res.end();
                                                         }else{
                                                            if (filasM.length > 0) {
                                                               numMensajes = filasM[0].num_mensajes;
                                                            }
                                                            var datos = {
                                                               seccionSeleccionada: 'Nuevo Usuario', 
                                                               numMensajes: numMensajes,
                                                               curp_usuario: req.session.user.curp
                                                            };
                                                            if (guardado & !modif) {
                                                               res.render('nuevo_usuario', {guardado: true, list: listaInfo, titulo: 'NUEVO USUARIO', datos: datos});
                                                            }else if (!guardado & !modif){
                                                               res.render('nuevo_usuario', {guardado: false, list: listaInfo, titulo: 'NUEVO USUARIO', datos: datos});
                                                            }else if (!guardado & modif) {
                                                               datos.seccionSeleccionada = 'Ver Usuario';
                                                               res.render('usuario_sel', {usuarioSelec: datosUser, list: listaInfo, titulo: 'VER USUARIO', datos: datos});
                                                            }else{
                                                               datos.seccionSeleccionada = 'Ver Usuario';
                                                               res.render('usuario_sel', {usuarioSelec: datosUser, list: listaInfo, modif: true, titulo: 'VER USUARIO', datos: datos});
                                                            }
                                                         }
                                                      });
                                                      con8.end({timeout: 60000});
                                                   }
                                                });
                                                con7.end({timeout: 60000});
                                             }
                                          });
                                          con6.end({timeout: 60000});
                                       }
                                    });
                                    con5.end({timeout: 60000});
                                 }
                              });
                              con4.end({timeout: 60000});
                           }
                        });
                        con3.end({timeout: 60000});
                     }
                  });
                  con2.end({timeout: 60000});
               }
            });
            con1.end({timeout: 60000});
         }
      }    
   });
   con.end({timeout: 60000});
}

module.exports.insert_nuevo_usuario = function (req, res){
   if (req.body.fecha_asignacion === '') {
      fecha_asignacion = '0000-00-00';
   } else{
      fecha_asignacion = new Date(req.body.fecha_asignacion).toLocaleString();
   }
   var datos = [req.body.curp.toUpperCase(), req.body.nombre.toUpperCase(), req.body.apellido_paterno.toUpperCase(), req.body.apellido_materno.toUpperCase(), 
      req.body.email, req.body.cct.toUpperCase(), req.body.nivel_educativo, req.body.funcion, req.body.convocatoria_seleccionada, 
      req.body.tipo_examen, req.body.status_asignacion, fecha_asignacion, req.body.bloque, req.body.entidad, 
      req.body.tipo_sostenimiento, req.body.tipo_usuario, req.body.categoria];
   var sql = "insert into usuario values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
   var con = conexion();
   con.query(sql, datos, function(error, filas){//insertamos el nuevo usuario
      if (error) {
         console.log("Error. insert usuario" + error);
         res.end();
      }else{
         if (filas.affectedRows > 0) {
            var datosN = [req.body.nombre_usuario, req.body.contrasena, 1, 0, req.body.curp];
            var sqlN = "insert into login values (?, ?, ?, ?, ?)";
            var con1 = conexion();
            con1.query(sqlN, datosN, function(errorNU, filasNU){
               if (errorNU) {
                  console.log("Error. insert usuario Login" + error);
                  res.end();
               }else{
                  if (filasNU.affectedRows > 0) {
                     nuevo_usuario(req, res, true, false, null);
                  }else{
                     nuevo_usuario(req, res, false, false, null);
                  }
               }
            });
            con1.end({timeout: 60000});
         }else{
         	nuevo_usuario(req, res, false, false, null);
            //res.render('nuevo_usuario', {error: true});
         }
      }
   });
   con.end({timeout: 60000});
}

function usuario(req, res, usuario_sel, bandera){
   var sql = 'select * from usuario join login on curp = curp_usuario where curp = ?';
   var con = conexion();
   con.query(sql, [usuario_sel], function (error, filas){
      if (error) {
         console.log("Error. consulta Usuario select");
         res.end();
      }else{
         if (filas.length === 1) {
            var datosUsuario = {curp: filas[0].curp,
               nombre: filas[0].nombre,
               apellido_paterno: filas[0].apellido_paterno,
               apellido_materno: filas[0].apellido_materno,
               email: filas[0].email,
               cct: filas[0].cct,
               id_nivel_educativo: filas[0].id_nivel_educativo,
               id_funcion: filas[0].id_funcion,
               convocatoria_seleccionada: filas[0].convocatoria_seleccionada,
               id_tipo_examen: filas[0].id_tipo_examen,
               status_asignacion: filas[0].status_asignacion,
               fecha_asignacion: filas[0].fecha_asignacion,
               id_bloque: filas[0].id_bloque,
               id_entidad: filas[0].id_entidad,
               id_tipo_sostenimiento: filas[0].id_tipo_sostenimiento,
               id_tipo_usuario: filas[0].id_tipo_usuario,
               id_categoria: filas[0].id_categoria,
               usuario: filas[0].usuario,
               contrasenia: filas[0].contrasenia,
               status_cuenta: filas[0].status_cuenta
            };
            if (bandera) {
               nuevo_usuario(req, res, true, true, datosUsuario);
            }else{
               nuevo_usuario(req, res, false, true, datosUsuario);
            }
         }else{
            res.redirect("/admin_usuarios");
         }
      }
   });
   con.end{timeout: 60000});
}

module.exports.modificar_usuario = function (req, res){
   var fecha_asignacion;
   if (req.body.fecha_asignacion === '') {
      fecha_asignacion = '0000-00-00  00:00:00';
   } else{
      fecha_asignacion = "'" + new Date(req.body.fecha_asignacion).toLocaleString() + "'";
   }
   var sql = "update usuario set nombre = '" + req.body.nombre + "', apellido_paterno ='" + req.body.apellido_paterno + 
      "', apellido_materno = '" + req.body.apellido_materno + "', email = '" + req.body.email + "', cct = '" + 
      req.body.cct + "', id_nivel_educativo = " + req.body.nivel_educativo + ", id_funcion = " + req.body.funcion + 
      ", convocatoria_seleccionada = " + req.body.convocatoria_seleccionada + ", id_tipo_examen = " + req.body.tipo_examen + 
      ", status_asignacion = " + req.body.status_asignacion + ", fecha_asignacion = " + fecha_asignacion + ", id_bloque = " + 
      req.body.bloque + ", id_entidad = " + req.body.entidad + ", id_tipo_sostenimiento = " + req.body.tipo_sostenimiento + 
      ", id_tipo_usuario = " + req.body.tipo_usuario + ", id_categoria = " + req.body.categoria + " where curp = '" + req.body.curp +"'";
   var con = conexion();
   con.query(sql, function(error, filas){//atualizamos los datos del usuario
      if (error) {
         console.log("Error. Actualizar Usuario" + error);
         res.end();
      }else{
         if (filas.affectedRows > 0) {
            var con1 = conexion();
            con1.query("update login set usuario = '"+ req.body.nombre_usuario +"', contrasenia = '"+ req.body.contrasena +"', status_cuenta = '"+ req.body.status_cuenta +"' where curp_usuario = '"+ req.body.curp +"'", function(errorU, filasU){
               if (errorU) {
                  console.log("Error. Actualizar Usuario - Login" + errorU);
                  res.end();
               }else{
                  if (filasU.affectedRows > 0) {
                     usuario(req, res, req.body.curp, true);
                  }
               }
            });
            con1.end();
         }
      }
   });
   con.end();
}

module.exports.admin_cursos = function (req, res){
   //obtenemos los ursos registrados
   var con = conexion();
   con.query("select curso.id, nombre_curso, DATE_FORMAT(fecha_inicio, '%d-%m-%Y') as fecha_inicio, DATE_FORMAT(fecha_fin, '%d-%m-%Y') as fecha_fin from curso ORDER BY fecha_inicio DESC, fecha_fin ASC", function(error,filas){
      var listaCursos = [];
      if (error){
         console.log("Error. consulta admin_cursos!" + error);
         res.end();
      }else{
         if (filas.length>0) {
            for (var i = 0; i <= filas.length - 1; i++) {
               var newCurso = {id: filas[i].id,
                  nombre_curso: filas[i].nombre_curso,
                  fecha_inicio: filas[i].fecha_inicio,
                  fecha_fin: filas[i].fecha_fin
               };
               listaCursos.push(newCurso);
            }
         }
      }
      var con1 = conexion();
      con1.query("select curso.id, nombre_curso, count(curp_tutorado) as miembros from curso join grupo on curso.id = id_curso join grupo_usuario on grupo.id = id_grupo group by curso.id;", function(errorN, filasN){
         var listaCursos_miembros = [];
         if (errorN){
            console.log("Error. consulta admin_cursos - segunda!"  + errorN);
            res.end();
         }else{
            for (var i = 0; i <= filasN.length - 1; i++) {
               var newCurso_miembros = {id: filasN[i].id,
                  nombre_curso: filasN[i].nombre_curso,
                  miembros: filasN[i].miembros
               };
               listaCursos_miembros.push(newCurso_miembros);
            }
         }
         //iteramo los ursos y desues los miebros ara agrerar el numero de miembros de ada urso
         listaCursos.forEach(function(item, index){
            item.miembros = 5;
            var conMiembros = false;
            listaCursos_miembros.forEach(function(itemN, indexN){
               if (item.id === itemN.id) {
                  conMiembros = true;
                  item.miembros = itemN.miembros;
                  return;
               }
            });
            if (!conMiembros) {
               item.miembros = 0;
            }
         });
         var con2 = conexion();
         con2.query("select id_curso, count(id_curso) as num_grupos from grupo group by id_curso;", function(errorM, filasM){
            var listaGrupos = [];
            if (errorM){
               console.log("Error. consulta admin_cursos - tercera!"  + errorM);
               res.end();
            }else{
               for (var i = 0; i <= filasM.length - 1; i++) {
                  var newNumGrupo = {id: filasM[i].id_curso,
                     num_grupos: filasM[i].num_grupos
                  };
                  listaGrupos.push(newNumGrupo);
               }
            }
            //iteramo los ursos y desues los numgrupos ara agrerar el numero de grupos de ada urso
            listaCursos.forEach(function(item, index){
               var conGrupos = false;
               listaGrupos.forEach(function(itemN, indexN){
                  if (item.id === itemN.id) {
                     conGrupos = true;
                     item.numGrupos = itemN.num_grupos;
                     return;
                  }
               });
               if (!conGrupos) {
                  item.numGrupos = 0;
               }
            });
            var con3 = conexion();
            con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
               var numMensajes = 0;
               if (errorMe) {
                  console.log('Error - obtener numero de mensajes');
                  res.end();
               }else{
                  if (filasMe.length > 0) {
                     numMensajes = filasMe[0].num_mensajes;
                  }
                  var datos = {
                     seccionSeleccionada: 'Administrar Cursos', 
                     numMensajes: numMensajes,
                     curp_usuario: req.session.user.curp
                  };
                  res.render('admin_cursos', {list: listaCursos, titulo: 'ADMINISTRAR CURSOS', datos: datos});
               }
            });
            con3.end();
         });
         con2.end();
      });
      con1.end();
   });
   con.end();
}

function nuevo_curso(req, res, guardado){
   var con3 = conexion();
   con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
      var numMensajes = 0;
      if (errorMe) {
         console.log('Error - obtener numero de mensajes');
         res.end();
      }else{
         if (filasMe.length > 0) {
            numMensajes = filasMe[0].num_mensajes;
         }
         var datos = {
            seccionSeleccionada: 'Nuevo Curso', 
            numMensajes: numMensajes,
            curp_usuario: req.session.user.curp
         };
         if (guardado) {
            res.render('nuevo_curso', {guardado: true, titulo: 'NUEVO CURSO', datos: datos});
         }else{
            res.render('nuevo_curso', {guardado: false, titulo: 'NUEVO CURSO', datos: datos});
         }
      }
   });
   con3.end();
}

module.exports.insert_nuevo_curso = function (req, res){
   var sql = "insert into curso values (null, '"+req.body.nombre+"', '"+req.body.descripcion+"', "+req.body.sesiones+", '"+(new Date(req.body.fecha_inicio)).toLocaleDateString()+"', '"+(new Date(req.body.fecha_fin)).toLocaleDateString()+"')";
   var con = conexion();
   con.query(sql, function(error, filas){//insertamos el nuevo urso
      if (error) {
         console.log("Error insert nuevo curso " + error);
         res.render('nuevo_curso', {error: true});
      }else{
         if (filas.affectedRows > 0) {
            for (var i = 1; i <= req.body.sesiones; i++) {
               var con2 = conexion();
               con2.query("insert into sesion values (null, '0000-00-00', '0000-00-00', 'Semana "+ i +"', " + filas.insertId +")", function(errorS, filasS){//insertamos las sesiones ara el urso
                  if (errorS) {
                     console.log("Error. al insertar las sesiones" + i);
                     console.log("Error. " + errorS);
                  }
               });
               con2.end();
            }
         }
         nuevo_curso(req, res, true);
      }
   });
   con.end();
}

function curso(req, res, curso_sel, grupo_sel, opcion){
   var con = conexion();
   con.query("select id, nombre_curso, descripcion, numero_sesiones, fecha_inicio, fecha_fin from curso where id = ?", [curso_sel], function(error,filas){
      if (error){
         console.log("Error. consulta selec curso /curso" + error);
         res.redirect("/admin_cursos");
      }else{
         if (filas.length > 0) {
            var newCurso = {id: filas[0].id,
               nombre_curso: filas[0].nombre_curso,
               descripcion: filas[0].descripcion,
               num_sesiones: filas[0].numero_sesiones,
               fecha_inicio: filas[0].fecha_inicio,
               fecha_fin: filas[0].fecha_fin
            };
            //obtenemos la informaion de las seiones del urso
            var con1 = conexion();
            con1.query("select * from sesion where id_curso = ? order by numero_sesion;", [curso_sel], function(errorS, filasS){
               var listaSesiones = [];
               var idSesiones = "";
               if (errorS) {
                  console.log("Error. consulta selec curso /sesiones" + errorS);
                  res.end();
               }else{
                  for (var i = 0; i <= filasS.length - 1; i++) {
                     idSesiones += filasS[i].id + ",";
                     var sesion = {id: filasS[i].id,
                        fecha_inicio: filasS[i].fecha_inicio,
                        fecha_fin: filasS[i].fecha_fin,
                        numero_sesion: filasS[i].numero_sesion
                     };
                     listaSesiones.push(sesion);
                  }
                  newCurso.idSesiones = idSesiones;
                  newCurso.sesiones = listaSesiones;
                  //ya obtuvimos la informacion del curso, ahora obtenemos los gruos y la cantidad de miembros de cada gruo del curso
                  var con3 = conexion();
                  con3.query("select id, nombre_grupo, id_curso, curp_tutor, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombreTutor, count(curp_tutorado) as miembros  from grupo left join grupo_usuario on grupo.id = id_grupo left join usuario on curp_tutor = curp where id_curso = ? group by id order by miembros DESC;", [curso_sel], function(errorN, filasN){
                     var listaGrupos = [];
                     if (errorN){
                        console.log("Error. consulta selec curso /curso segundo" + errorN);
                        res.end();
                     }else{
                        for (var i = 0; i <= filasN.length - 1; i++) {
                           var grupo = {id_grupo: filasN[i].id,
                              nombre_grupo: filasN[i].nombre_grupo,
                              tutor: filasN[i].nombreTutor,
                              miembros: filasN[i].miembros
                           };
                           listaGrupos.push(grupo);
                        }
                        newCurso.grupos = listaGrupos;
                        //ya obtuvimos la informacion del curso, de los gruos, ahora obtenmos los tutorados que no han sido asignados
                        var con4 = conexion();
                        con4.query("select  curp, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombreTutorado, id_tipo_usuario, tipo_usuario from usuario join tipo_usuario on id_tipo_usuario = id where status_asignacion = 0 and (tipo_usuario = 'Tutorado' or tipo_usuario = 'TUTORADO');", function(errorM, filasM){
                           var listaTutorados = [];
                           if (errorM){
                              console.log("Error. consulta selec curso /curso terero" + errorM);
                              res.end();
                           }else{
                              for (var i = 0; i <= filasM.length - 1; i++) {
                                 var tutorado = {curp: filasM[i].curp,
                                    nombre: filasM[i].nombreTutorado
                                 };
                                 listaTutorados.push(tutorado);
                              }
                              newCurso.tutorados = listaTutorados;
                              var con5 = conexion();
                              con5.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
                                 var numMensajes = 0;
                                 if (errorMe) {
                                    console.log('Error - obtener numero de mensajes ' + errorMe);
                                    res.end();
                                 }else{
                                    if (filasMe.length > 0) {
                                       numMensajes = filasMe[0].num_mensajes;
                                    }
                                    var datos = {
                                       seccionSeleccionada: 'Ver Curso', 
                                       numMensajes: numMensajes,
                                       curp_usuario: req.session.user.curp
                                    };
                                    if (opcion === 'tutoradosAgregados') {
                                       res.render('curso_sel', {cursoSelec: newCurso, selec_grupo: false, sesionModif: false, tutoradosAgregados: true, titulo: 'VER CURSO', datos: datos});
                                    }else if(opcion === 'modifDatosCurso'){
                                       res.render('curso_sel', {cursoSelec: newCurso, selec_grupo: false, sesionModif: false, tutoradosAgregados: false, cursoModif: true, titulo: 'VER CURSO', datos: datos});
                                    }else if (opcion === 'true'){//si es true, se ha modificado las sesiones
                                       res.render('curso_sel', {cursoSelec: newCurso, selec_grupo: false, sesionModif: true, tutoradosAgregados: false, titulo: 'VER CURSO', datos: datos});
                                    }else if (grupo_sel === undefined) {//si no esta esta variable no se ha seleionado ningun gruo 
                                       res.render('curso_sel', {cursoSelec: newCurso, selec_grupo: false, sesionModif: false, titulo: 'VER CURSO', datos: datos});
                                    }else{//mostramos un dialog on los miembros del gruo seleionado
                                       var con5 = conexion();
                                       con5.query("select id_grupo, nombre_grupo, curp_tutorado, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombreTutorado from grupo_usuario join usuario on curp_tutorado = curp join grupo on id_grupo = id where id_grupo = ?", [grupo_sel], function(errorL, filasL){
                                          var listaTutoradosGrupo = '';
                                          var listaTutoradosGrupoX = [];
                                          if (errorL){
                                             console.log("Error. consulta selec curso /curso grupo_sel " + errorL);
                                             res.end();
                                          }else{
                                             var titulo = 'Sin Miembros';
                                             for (var i = 0; i <= filasL.length - 1; i++) {
                                                listaTutoradosGrupo += "Curp: " + filasL[i].curp_tutorado + " \\n-Nombre: " + filasL[i].nombreTutorado;
                                                listaTutoradosGrupo += "\\n";
                                                var tutoradoX = {curp: filasL[i].curp_tutorado,
                                                   nombre: filasL[i].nombreTutorado
                                                };
                                                listaTutoradosGrupoX.push(tutoradoX);
                                             }
                                             newCurso.titulo = titulo;
                                             newCurso.listaTutoradosGrupo = listaTutoradosGrupo;
                                             newCurso.listaTutoradosGrupoX = listaTutoradosGrupoX;
                                             if (filasL.length > 0) {
                                                newCurso.titulo = filasL[0].nombre_grupo;
                                                datos.seccionSeleccionada = 'Miembros del Grupo ' + newCurso.titulo;
                                                res.render('grupo_sel', {cursoSelec: newCurso, selec_grupo: true, sesionModif: false, tutoradosAgregados: false, titulo: 'VER GRUPO', datos: datos});
                                             }else{
                                                res.render('curso_sel', {cursoSelec: newCurso, selec_grupo: true, sesionModif: false, tutoradosAgregados: false, titulo: 'VER GRUPO', datos: datos});
                                             }
                                          }
                                       });
                                       con5.end();
                                    }
                                 }
                              });
                              con5.end();
                           }
                        });
                        con4.end();
                     }
                  });
                  con3.end();
               }
            });
            con1.end();
         }else{
            res.redirect("/admin_cursos");
         }
      }
   });
   con.end();
}

module.exports.modificar_curso = function (req, res){
   var sql = "update curso set nombre_curso = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ? where id = ?";
   var con = conexion();
   con.query(sql, [req.body.nombre, req.body.descripcion, (new Date(req.body.fecha_inicio)).toLocaleDateString(), (new Date(req.body.fecha_fin)).toLocaleDateString(), req.body.idCursoSel], function(error, filas){
      if (error) {
         console.log("Error. al actualizar los datos del curso" + error);
         res.end();
      }
   });
   con.end();
}

module.exports.modificar_fechas_sesiones = function (req, res){
   var ids = req.body.idsSesiones.split(",");
   for (var i = ids.length - 2; i >= 0; i--) {//validamos si se ingreso alguna feha, de ser atualizamos la feha
      if (req.body['fecha_inicioN'+ids[i]] != '') {
         var con = conexion();
         con.query("update sesion set fecha_inicio = '"+(new Date(req.body['fecha_inicioN'+ids[i]])).toLocaleDateString()+"' where id = "+ ids[i], function(errorFI, filasFI){
            if (errorFI) {
               console.log("Error Actualizar Fechas Iniio Sesion " + errorFI);
               res.end();
            }
         });
         con.end();
      }
      if (req.body['fecha_finN'+ids[i]] != '') {
         var con = conexion();
         con.query("update sesion set fecha_fin = '"+(new Date(req.body['fecha_finN'+ids[i]])).toLocaleDateString()+"' where id = "+ ids[i], function(errorFF, filasFF){
            if (errorFF) {
               console.log("Error Actualizar Fechas Fin Sesion " + errorFF);
               res.end();
            }
         });
         con.end();
      }
      if (req.body['nombre_sesion'+ids[i]] != '') {
         var con = conexion();
         con.query("update sesion set numero_sesion = '" + req.body['nombre_sesion'+ids[i]]+"' where id = "+ ids[i], function(errorNS, filasNS){
            if (errorNS) {
               console.log("Error Actualizar Numero Sesion " + errorNS);
               res.end();
            }
         });
         con.end();
      }
   }
}

function nuevo_grupo(req, res, cursoID, guardado){
   var con = conexion();//obtenemos la lista de tutorados que no han sido asignados
   con.query("select  curp, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombreTutor, id_tipo_usuario, tipo_usuario from usuario join tipo_usuario on id_tipo_usuario = id where status_asignacion = 0 and (tipo_usuario = 'Tutor' or tipo_usuario = 'TUTOR');", function(error,filas){
      var listaTutores = [];
      if (error){
         console.log("Error. consulta Nuevo grupo!" + error);
         res.end();
      }else{
         if (filas.length>0) {
            for (var i = 0; i <= filas.length - 1; i++) {
               var newTutor = {curp: filas[i].curp,
                  nombreTutor: filas[i].nombreTutor,
                  id_tipo_usuario: filas[i].id_tipo_usuario,
                  tipo_usuario: filas[i].tipo_usuario
               };
               listaTutores.push(newTutor);
            }
         }
         var con3 = conexion();
         con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
            var numMensajes = 0;
            if (errorMe) {
               console.log('Error - obtener numero de mensajes');
               res.end();
            }else{
               if (filasMe.length > 0) {
                  numMensajes = filasMe[0].num_mensajes;
               }
               var datos = {
                  seccionSeleccionada: 'Nuevo Grupo', 
                  numMensajes: numMensajes,
                  curp_usuario: req.session.user.curp
               };
               if (guardado) {
                  res.render('nuevo_grupo', {guardado: true, list: listaTutores, id_curso: cursoID, titulo: 'NUEVO GRUPO', datos: datos});
               }else{
                  res.render('nuevo_grupo', {guardado: false, list: listaTutores, id_curso: cursoID, titulo: 'NUEVO GRUPO', datos: datos});
               }
            }
         });
         con3.end();
      }
   });
   con.end();
}

module.exports.insert_nuevo_grupo = function (req, res){
   var sql = "insert into grupo values (null, '"+req.body.nombre+"', "+req.body.id_curso+", '"+req.body.tutorSel+"')";
   var con = conexion();
   con.query(sql, function(error, filas){
      if (error) {
         console.log("Error. nuevo grupo" + error);
         nuevo_grupo(res, req.body.id_curso, false);
      }else{
         if (filas.affectedRows > 0) {
            sql = "update usuario set status_asignacion = 1, fecha_asignacion='" + new Date().toJSON().slice(0,10) + "' where curp = '" + req.body.tutorSel + "'";
            var con1 = conexion();
            con1.query(sql, function(errorU, filasU){//ambiamos el status del tutor a asignado y la feha de asignaion
               if (filasU.affectedRows > 0) {
                  nuevo_grupo(req, res, req.body.id_curso, true);
               }else{
                  nuevo_grupo(req, res, req.body.id_curso, false);
               }
            });
            con1.end();
         } 
      }
   });
   con.end();
}

module.exports.insert_usuario_grupo = function (res, id_tutorados, grupoID){
   var ids = id_tutorados.split(",");
   var sql = 'insert into grupo_usuario values(?, ?)';
   for (var i = ids.length - 2; i >= 0; i--) {
      console.log('IDS - ' + ids[i]);
      var id_atual = ids[i];
      var con = conexion();
      con.query(sql, [grupoID, ids[i]], function (error, filas){
         if (error) {
            console.log('Error - insert_usuario_grupo ' + error);
            res.end();
         }
      });
      con.end();
      con = conexion();
      con.query('update usuario set status_asignacion = 1 where curp = ?', [id_atual], function (errorU, filasU){
         if (errorU) {
            console.log('Error - atualizar status_asignacion tutorado ' + errorU);
            res.end();
         }
      });
      con.end();
   }
}

module.exports.calendario = function (req, res, id_aviso){
   var con2 = conexion();
   con2.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
      var numMensajes = 0;
      if (errorMe) {
         console.log('Error - obtener numero de mensajes ' + errorMe);
         res.end();
      }else{
         if (filasMe.length > 0) {
            numMensajes = filasMe[0].num_mensajes;
         }
         var con3 = conexion();
          con3.query('select * from aviso where date(fecha)>=CURDATE() and id_tipo_aviso = 2', function(errorAv, filasAv){
            var listaAvisos = new Array();
            if (errorAv) {
               console.log('Error - obtener numero de mensajes ' + errorAv);
               res.end();
            }else{
               var strr = "";
               for (var i = 0; i <= filasAv.length - 1; i++) {
                  if(i==0){
                     strr += '"'+new Date(filasAv[i].fecha).toISOString().slice(0,10)+'":{"number": 1, "url": "/aviso/'+filasAv[i].id+'"}';
                  }else{
                     strr += ',"'+new Date(filasAv[i].fecha).toISOString().slice(0,10)+'":{"number": 1, "url": "/aviso/'+filasAv[i].id+'"}'; 
                  } 
                  var newAviso = {
                     id: filasAv[i].id,
                     nombre_aviso: filasAv[i].nombre_aviso,
                     fecha: filasAv[i].fecha,
                     descripcion: filasAv[i].descripcion
                  };
                  listaAvisos.push(newAviso);
               }
               var esAdmin = '';
               if (req.session.user.tipo_usuario === 'Autoridad Educativa') {
                  esAdmin = 'es admin';
               }else if (req.session.user.tipo_usuario === 'Tutor') {
                  esAdmin = 'es tutor';
               }else if (req.session.user.tipo_usuario === 'Tutorado') {
                  esAdmin = 'es tutorado';
               }
               var datos = {
                  seccionSeleccionada: 'Calendario', 
                  numMensajes: numMensajes,
                  curp_usuario: req.session.user.curp,
                  esAutoridadEducativa: esAdmin
               };
               if (id_aviso != undefined) {//se ha seleccionado ningun aviso del calendario
                  var sql = 'select id, nombre_aviso, descripcion, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha from aviso where id = ? or fecha = (select fecha from aviso where id = ?) and id_tipo_aviso = 2';
                  var con4 = conexion();
                  con4.query(sql, [id_aviso, id_aviso], function(errorAs, filasAs){
                     if (errorAv) {
                        console.log('Error - obtener aviso select ' + errorAs);
                        res.end();
                     }else{
                        var texto = '';
                        var tituloTexto = '';
                        for (var i = 0; i <= filasAs.length - 1; i++) {
                           texto += '<b>' + filasAs[i].nombre_aviso + '</b> - ' + filasAs[i].descripcion + '<br/><br/>';
                           tituloTexto = 'Avisos del ' + filasAs[i].fecha;
                        }
                        datos.texto = texto;
                        datos.titulo = tituloTexto;
                        res.render('calendario', {titulo: 'CALENDARIO', datos: datos, listaAvisos: listaAvisos, fechas: strr, avisoSel: true});
                     }
                  });
                  con4.end();
               }else{
                  res.render('calendario', {titulo: 'CALENDARIO', datos: datos, listaAvisos: listaAvisos, fechas: strr, avisoSel: false});
               }
               
            }
          });
          con3.end();
      }
   });
   con2.end();
}

module.exports.eliminar_aviso = function (req, res){
   var sql = "delete from aviso where id = ?";
   var datos = [req.params.id];
   var con = conexion();
   con.query(sql, datos, function(error, filas){//insertamos el nuevo gruo
      if (error) {
         console.log("Error. eliminar aviso " + error);
         res.end();
      }
   });
   con.end();
   res.redirect('/ver_avisos');
}

module.exports.ver_avisos = function (req, res){
   var con2 = conexion();
   con2.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
      var numMensajes = 0;
      if (errorMe) {
         console.log('Error - obtener numero de mensajes ' + errorMe);
         res.end();
      }else{
         if (filasMe.length > 0) {
            numMensajes = filasMe[0].num_mensajes;
         }
         var con3 = conexion();
          con3.query('select id, nombre_aviso, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha, descripcion from aviso where date(fecha)>=CURDATE() and id_tipo_aviso = 2', function(errorAv, filasAv){
            var listaAvisos = new Array();
            if (errorAv) {
               console.log('Error - obtener lista de avisos ' + errorAv);
               res.end();
            }else{
               for (var i = 0; i <= filasAv.length - 1; i++) {
                  var newAviso = {
                     id: filasAv[i].id,
                     nombre_aviso: filasAv[i].nombre_aviso,
                     fecha: filasAv[i].fecha,
                     descripcion: filasAv[i].descripcion
                  };
                  listaAvisos.push(newAviso);
               }
               var datos = {
                  seccionSeleccionada: 'Ver Avisos', 
                  numMensajes: numMensajes,
                  curp_usuario: req.session.user.curp
               };
               res.render('ver_avisos', {titulo: 'VER AVISOS', datos: datos, listaAvisos: listaAvisos});
            }
          });
          con3.end();
      }
   });
   con2.end();
}

module.exports.nuevo_aviso = function (req, res){
   var sql = "insert into aviso values (null, '"+req.body.nombre+"', '"+req.body.descripcion+"', '"+new Date(req.body.fecha).toLocaleString()+"', 2)";
   var con = conexion();
   con.query(sql, function(error, filas){
      if (error) {
         console.log("Error. nuevo aviso " + error);
         res.end();
      }else{
         if (filas.affectedRows > 0) {
            res.redirect('/ver_avisos');
         } 
      }
   });
   con.end();
}

module.exports.avisos = function (req, res){
   var con2 = conexion();
   con2.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
      var numMensajes = 0;
      if (errorMe) {
         console.log('Error - obtener numero de mensajes ' + errorMe);
         res.end();
      }else{
         if (filasMe.length > 0) {
            numMensajes = filasMe[0].num_mensajes;
         }
         var sql = 'select id, nombre_aviso, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha, descripcion from aviso where date(fecha)>=CURDATE() and id_tipo_aviso = 2 order by fecha ASC';
         if (req.session.user.tipo_usuario == 'Autoridad Educativa') {
            sql = 'select id, nombre_aviso, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha, descripcion from aviso where date(fecha)>=CURDATE() order by fecha DESC';
         }
         var con3 = conexion();
         con3.query(sql, function(errorAv, filasAv){
            var listaAvisos = new Array();
            if (errorAv) {
               console.log('Error - obtener lista de avisos ' + errorAv);
               res.end();
            }else{
               for (var i = 0; i <= filasAv.length - 1; i++) {
                  var newAviso = {
                     id: filasAv[i].id,
                     nombre_aviso: filasAv[i].nombre_aviso,
                     fecha: filasAv[i].fecha,
                     descripcion: filasAv[i].descripcion
                  };
                  listaAvisos.push(newAviso);
               }
               var esAdmin = '';
               if (req.session.user.tipo_usuario === 'Autoridad Educativa') {
                  esAdmin = 'es admin';
               }else if (req.session.user.tipo_usuario === 'Tutor') {
                  esAdmin = 'es tutor';
               }else if (req.session.user.tipo_usuario === 'Tutorado') {
                  esAdmin = 'es tutorado';
               }
               var datos = {
                  seccionSeleccionada: 'Avisos', 
                  numMensajes: numMensajes,
                  curp_usuario: req.session.user.curp,
                  esAutoridadEducativa: esAdmin
               };
               res.render('avisos', {titulo: 'AVISOS', datos: datos, listaAvisos: listaAvisos});
            }
         });
         con3.end();
      }
   });
   con2.end();
}

module.exports.contenido_curso = function (req, res){
   var sesiones = new Array();
   var con = conexion();
   con.query('select id_curso, nombre_curso, sesion.id, numero_sesion, sesion.fecha_inicio, sesion.fecha_fin from sesion join curso on id_curso = curso.id where id_curso = ? order by numero_sesion', [req.params.id], function (error, filas){
      var ids_sesion = '';
      if (error) {
         console.log('Error - consultar sesiones contenido_curso ' + error);
         res.end();
      }else{
         for (var i = 0; i <= filas.length - 1; i++) {
            ids_sesion += 'id_sesion = ' + filas[i].id + ' or ';
            var newSesion = {id_curso: filas[i].id_curso,
               nombre_curso: filas[i].nombre_curso,
               id_sesion: filas[i].id,
               numero_sesion: filas[i].numero_sesion,
               fecha_inicio: filas[i].fecha_inicio,
               fecha_fin: filas[i].fecha_fin
            };
            sesiones.push(newSesion);
         }
      }
      var con1 = conexion();
      var sqlA = 'select actividad.id, nombre_titulo, descripcion_contenido, fecha_inicio, fecha_limite, id_tipo_actividad, id_sesion, tipo_actividad from actividad join tipo_actividad on id_tipo_actividad = tipo_actividad.id where ' + ids_sesion.substr(0, (ids_sesion.length-4));
      con1.query(sqlA, function (errorA, filasA){
         var actividades =new Array();
         if (errorA) {
            console.log('Error - consultar actividades contenido_curso' + errorA);
            res.end();
         }else{
            for (var  i = 0; i <= filasA.length - 1; i++) {
               var newActividad = {id_actividad: filasA[i].id,
                  nombre_titulo: filasA[i].nombre_titulo,
                  descripcion_contenido: filasA[i].descripcion_contenido,
                  fecha_inicio: filasA[i].fecha_inicio,
                  fecha_fin: filasA[i].fecha_limite,
                  id_tipo_actividad: filasA[i].id_tipo_actividad,
                  id_sesion: filasA[i].id_sesion,
                  tipo_actividad: filasA[i].tipo_actividad
               };
               actividades.push(newActividad);
            }
            //Agregamos las actividades a las sesiones correspondientes
            sesiones.forEach(function(itemS, indexS){
               var listaActividadesSesion = new Array();
               actividades.forEach(function(itemA, indexA){
                  if (itemS.id_sesion === itemA.id_sesion) {
                     listaActividadesSesion.push(itemA);
                  }
               });
               itemS.listaActividadesSesion = listaActividadesSesion;
            });
            var con2 = conexion();
             con2.query('select * from tipo_actividad', function (errorT, filasT){
               if (errorT) {
                  console.log('Error - consultar tipo_actividad');
                  res.end();
               }else{
                  var tipo_actividades = new Array();
                  for (var  i = 0; i <= filasT.length - 1; i++) {
                     var tipoActividad = {id_tipo_actividad: filasT[i].id,
                        nombre_tipo_actividad: filasT[i].tipo_actividad
                     };
                     tipo_actividades.push(tipoActividad);
                  }
                  var con3 = conexion();
                  con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
                     var numMensajes = 0;
                     if (errorMe) {
                        console.log('Error - obtener numero de mensajes');
                        res.end();
                     }else{
                        if (filasMe.length > 0) {
                           numMensajes = filasMe[0].num_mensajes;
                        }
                        var datos = {
                           seccionSeleccionada: 'Agregar Contenido', 
                           numMensajes: numMensajes,
                           curp_usuario: req.session.user.curp
                        };
                        res.render('contenido_curso', {sesiones: sesiones, nombre_curso: filas[0].nombre_curso, tipo_actividades: tipo_actividades, titulo: 'CURSO: ' + filas[0].nombre_curso, datos: datos});
                     }
                  });
                  con3.end();
               }
            });
            con2.end();
         }
      });
      con1.end();
   });
   con.end();
}

function mi_curso(req, res, id_actividad, id_sesion){
   var sesiones = new Array();
   var con = conexion();
   con.query('select id_curso, nombre_curso, sesion.id, numero_sesion, sesion.fecha_inicio, sesion.fecha_fin from sesion join curso on id_curso = curso.id where id_curso = ? order by numero_sesion', [req.params.id], function (error, filas){
      var ids_sesion = '';
      var titutlo = '';
      if (error) {
         console.log('Error - consultar sesiones contenido_curso');
         res.end();
      }else{
         for (var i = 0; i <= filas.length - 1; i++) {
            ids_sesion += 'id_sesion = ' + filas[i].id + ' or ';
            var newSesion = {id_curso: filas[i].id_curso,
               nombre_curso: filas[i].nombre_curso,
               id_sesion: filas[i].id,
               numero_sesion: filas[i].numero_sesion,
               fecha_inicio: filas[i].fecha_inicio,
               fecha_fin: filas[i].fecha_fin
            };
            titulo = 'CURSO: ' + filas[i].nombre_curso;
            sesiones.push(newSesion);
         }
      }
      var con1 = conexion();
      var sqlA = 'select actividad.id, nombre_titulo, descripcion_contenido, fecha_inicio, fecha_limite, id_tipo_actividad, id_sesion, tipo_actividad, status_actividad from actividad join tipo_actividad on id_tipo_actividad = tipo_actividad.id join actividad_usuario on actividad.id = id_actividad where (' + ids_sesion.substr(0, (ids_sesion.length-4)) + ') and curp_usuario = \'' + req.session.user.curp + '\'';
      con1.query(sqlA, function (errorA, filasA){
         var ids_actividades = '';
         var actividades =new Array();
         if (errorA) {
            console.log('Error - consultar actividades contenido_curso' + errorA);
            res.end();
         }else{
            for (var  i = 0; i <= filasA.length - 1; i++) {
               ids_actividades += 'id_actividad = ' + filasA[i].id + ' or ';
               var newActividad = {id_actividad: filasA[i].id,
                  nombre_titulo: filasA[i].nombre_titulo,
                  descripcion_contenido: filasA[i].descripcion_contenido,
                  fecha_inicio: filasA[i].fecha_inicio,
                  fecha_fin: filasA[i].fecha_limite,
                  id_tipo_actividad: filasA[i].id_tipo_actividad,
                  id_sesion: filasA[i].id_sesion,
                  tipo_actividad: filasA[i].tipo_actividad,
                  status_actividad: filasA[i].status_actividad
               };
               actividades.push(newActividad);
            }
            //Agregamos las actividades a las sesiones correspondientes
            sesiones.forEach(function(itemS, indexS){
               var listaActividadesSesion = new Array();
               actividades.forEach(function(itemA, indexA){
                  if (itemS.id_sesion === itemA.id_sesion) {
                     listaActividadesSesion.push(itemA);
                  }
               });
               itemS.listaActividadesSesion = listaActividadesSesion;
            });
            var con2 = conexion();
            con2.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
               var numMensajes = 0;
               if (errorMe) {
                  console.log('Error - obtener numero de mensajes ' + errorMe);
                  res.end();
               }else{
                  if (filasMe.length > 0) {
                     numMensajes = filasMe[0].num_mensajes;
                  }
                  var esAdmin = '';
                  if (req.session.user.tipo_usuario === 'Tutor') {
                     esAdmin = 'es tutor';
                  }else if (req.session.user.tipo_usuario === 'Tutorado') {
                     esAdmin = 'es tutorado';
                  }
                  var datos = {
                     seccionSeleccionada: 'Cotenido del Curso', 
                     numMensajes: numMensajes,
                     curp_usuario: req.session.user.curp,
                     esAutoridadEducativa: esAdmin,
                     id_sesionSel: id_sesion,
                     id_actividadSel: id_actividad
                  };
                  req.session.user.actividadActualiza = undefined;
                  req.session.user.sesionActividadActualiza = undefined;
                  res.render('mi_curso', {sesiones: sesiones, titulo: titulo, datos: datos});
               }
            });
            con2.end();            
         }
      });
      con1.end();
   });
   con.end();
}

module.exports.actualizarStatusActividad = function (req, res){
   req.session.user.actividadActualiza = req.params.idActividad;
   req.session.user.sesionActividadActualiza = req.params.idSesion;
   var sql = "update actividad_usuario set status_actividad = ?, fecha_realizacion = NOW() where id_actividad = ? and curp_usuario = ?";
   var con = conexion();
   con.query(sql, [1, req.params.idActividad, req.session.user.curp], function(error, filas){
      if (error) {
         console.log("Error. al actualizar el status_actividad " + error);
         res.end();
      }else{
         res.redirect('/mi_curso/' + req.params.idCurso);
      }
   });
   con.end();
}

module.exports.mensajes = function (req, res, curp_mensaje){
   //primero obtenemos el tipo de usuario que esta logeado para en base en eso hacer la consulta correspondiente
   var sql='';
   if (req.session.user.tipo_usuario === 'Autoridad Educativa' || req.session.user.tipo_usuario === 'AUTORIDAD EDUCATIVA') {//es autoridad educativa
      sql='select curp, CONCAT(nombre, \' \', apellido_paterno, \' \', apellido_materno) as nombre from usuario join tipo_usuario on id_tipo_usuario = id where tipo_usuario = \'Tutor\' or tipo_usuario = \'TUTOR\' and status_asignacion = 1 order by nombre';
   }else if (req.session.user.tipo_usuario === 'Tutor' || req.session.user.tipo_usuario === 'TUTOR') {//es tutor
      sql ='select curp, CONCAT(nombre, \' \', apellido_paterno, \' \', apellido_materno) as nombre from usuario join tipo_usuario on id_tipo_usuario = id left join grupo_usuario on curp_tutorado = curp left join grupo on id_grupo = grupo.id left join curso on id_curso = curso.id where tipo_usuario = \'Autoridad Educativa\' or tipo_usuario = \'AUTORIDAD EDUCATIVA\' or date(fecha_fin)>=CURDATE() and curp_tutor = \''+req.session.user.curp+'\' order by nombre';
   }else if (req.session.user.tipo_usuario === 'Tutorado' || req.session.user.tipo_usuario === 'TUTORADO') {//es tutorado
      sql='select curp, CONCAT(nombre, \' \', apellido_paterno, \' \', apellido_materno) as nombre from curso join grupo on curso.id = id_curso join grupo_usuario on grupo.id = id_grupo join usuario on curp_tutor = curp where date(fecha_fin)>=CURDATE() and curp_tutorado = \''+req.session.user.curp+'\'';
   }
   var con2 = conexion();//realizamos la consulta correspondiente al tipo de usuario, paar obtenerl la lista de usuairos que se mostraran en su interfaz
   con2.query(sql, function (error2, filas2){
      var listaUsuarios = new Array();
      if (error2) {
         console.log('Error - consultar usuarios mensajes' + error2);
         res.end();
      }else{
            for (var i = 0; i <= filas2.length - 1; i++) {
               var newUser = {curp: filas2[i].curp,
                  nombre: filas2[i].nombre,
                  mensajeSinVer: false,
                  numMensajeSinVer: 0
               };
               listaUsuarios.push(newUser);
            }
            var con3 = conexion();//obtenemos el numero de mensajes que el usuario actual no ha leido
            con3.query('select count(id) as num_mensajes, remitente from mensaje where status_leido = ? and destinatario = ? group by remitente',[0, req.session.user.curp], function (error3, filas3){
               var numMensajes = 0;
               var listaUsuariosMensaje = new Array();
               if (error3) {
                  console.log('Error - obtener numero de mensajes');
                  res.end();
               }else{
                  for (var i = 0; i <= filas3.length - 1; i++) {
                     numMensajes += filas3[i].num_mensajes;
                     var newUsuarioMensaje  = {num_mensajes: filas3[i].num_mensajes,
                        remitente: filas3[i].remitente
                     };
                     listaUsuariosMensaje.push(newUsuarioMensaje);
                  }
                  listaUsuarios.forEach(function(itemS, indexS){
                     listaUsuariosMensaje.forEach(function(itemM, indexM){
                        if (itemS.curp == itemM.remitente) {
                           itemS.mensajeSinVer = true;
                           itemS.numMensajeSinVer = itemM.num_mensajes;
                        }
                     });
                  });

                     if (req.session.user.curp_mensaje != undefined) {//se seleiono un usuario ara ver o mandar un mensaje
                        var con4 = conexion();
                        var sqlMensajes = 'select id, mensaje, fecha, remitente, CONCAT(ur.nombre, \' \', ur.apellido_paterno, \' \', ur.apellido_materno) as nombreRemitente, destinatario,  CONCAT(ud.nombre, \' \', ud.apellido_paterno, \' \', ud.apellido_materno) as nombreDestinatario from mensaje join usuario ur on remitente = ur.curp join usuario ud on destinatario = ud.curp where (remitente = ? or remitente = ?) and (destinatario = ? or destinatario = ?) order by fecha ASC';
                        con4.query(sqlMensajes, [req.session.user.curp, req.session.user.curp_mensaje, req.session.user.curp, req.session.user.curp_mensaje], function (error4, filas4){
                           var historial = new Array();
                           if (error4) {
                              console.log('Error - obtener historial de mensajes ' + error4);
                              res.end();
                           }else{
                              var nombreUsuarioSelMensaje = '';
                              for (var i = 0; i <= filas4.length - 1; i++) {
                                 if (filas4[i].destinatario == req.session.user.curp_mensaje) {
                                    nombreUsuarioSelMensaje = filas4[i].nombreDestinatario;
                                 }
                                 var newMensaje = {id: filas4[i].id,
                                    mensaje: filas4[i].mensaje,
                                    fecha: filas4[i].fecha,
                                    remitente_curp: filas4[i].remitente,
                                    remitente_nombre: filas4[i].nombreRemitente,
                                    destinatario_curp: filas4[i].destinatario,
                                    destinatario_nombre: filas4[i].nombreDestinatario
                                 };
                                 historial.push(newMensaje);
                              }
                              var datos = {
                                 seccionSeleccionada: 'Mensajes', 
                                 numMensajes: numMensajes,
                                 curp_usuario: req.session.user.curp,
                                 tipo_usuario: req.session.user.tipo_usuario,
                                 userSelMensaje: true,
                                 curp_usuarioSelMensaje: req.session.user.curp_mensaje,
                                 nombre_usuarioSelMensaje: nombreUsuarioSelMensaje
                              };
                              if (filas4.length <= 0) {//esto es cuando no hay mensajes entrelos ususario seleionados
                                 var con5 = conexion();
                                 con5.query("select curp, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombre from usuario where curp = ?", [req.session.user.curp_mensaje], function (error5, filas5){
                                    if (error5) {
                                       console.log('Error - obtener datos del usuario mensajes ' + error5);
                                       res.end();
                                    }else{
                                       if (filas5.length > 0) {
                                          datos.curp_usuarioSelMensaje = filas5[0].curp;
                                          datos.nombre_usuarioSelMensaje = filas5[0].nombre;
                                          res.render('mensajes', {listaUsuarios: listaUsuarios, numMensajes: numMensajes, historialMensajes: historial, titulo: 'MENSAJES', datos: datos});
                                       }else{
                                          res.end();
                                       }
                                    }
                                 });
                                 con5.end();
                              }else{
                                 res.render('mensajes', {listaUsuarios: listaUsuarios, numMensajes: numMensajes, historialMensajes: historial, titulo: 'MENSAJES', datos: datos});
                              }
                           }
                        });
                        con4.end();
                     }else{
                        var datos = {
                           seccionSeleccionada: 'Mensajes', 
                           numMensajes: numMensajes,
                           curp_usuario: req.session.user.curp,
                           tipo_usuario: req.session.user.tipo_usuario,
                           userSelMensaje: false
                        };
                        res.render('mensajes', {listaUsuarios: listaUsuarios, numMensajes: numMensajes, titulo: 'MENSAJES', datos: datos});
                     }
               }
            });
            con3.end();
      }
   });
   con2.end();
}

module.exports.verMensajeLeido = function (req, res){
   //validamos si se seleiono un usuario que tenia mensajes sin ver de ser asi lo marcamos como leidos
   var sql = "update mensaje set status_leido = ? where remitente = ?";
   var con = conexion();
   con.query("update mensaje set status_leido = ? where remitente = ?", [1, req.params.curp], function(error, filas){
      if (error) {
         console.log("Error. al actualizar el status_mensaje " + error);
         res.end();
      }else{
         res.redirect('/mensajes');
      }
   });
   con.end();
}

module.exports.nuevo_mensaje = function (req, res){
   var con = conexion();
   con.query('insert into mensaje values(null, ?, NOW(), ?, ?, ?);',[req.body.text_mensaje, req.session.user.curp, req.body.curp_usuario_sel, 0], function (error, filas){
      if (error) {
         console.log('Error - insert mensaje nuevo_mensaje ' + error);
         res.end();
      }else{
         if (filas.affectedRows > 0) {
            console.log('mensaje enviado');
         }
         req.session.user.curp_mensaje = req.body.curp_usuario_sel;
         res.redirect('/mensajes');
      }
   });
   con.end();
}

module.exports.nueva_actividad = function (req, res, id_curso_contenidoCurso){
   var datos, fecha_inicio, fecha_fin;
   if (req.body.tipo_actividad === '2') {//es tarea
      fecha_inicio = new Date(req.body.fecha_inicio).toLocaleString();
      fecha_fin = new Date(req.body.fecha_fin).toLocaleString();
   }else if (req.body.tipo_actividad === '3') {//es contenido
      fecha_inicio = 0;
      fecha_fin = 0;
   }else{
      datos = [];
      fecha_inicio = null;
      fecha_fin = null;
   }
   var con = conexion();
   con.query('insert into actividad values (null, ?, ?, ?, ?, ?, ?)', [req.body.titulo_actividad, req.body.areaContenido, fecha_inicio, fecha_fin, req.body.tipo_actividad, req.body.id_sesion], function(error, filas){
      if (error) {
         console.log("Error. nueva actividad " + error);
         res.end();
      }else{
         //agregamos la atividad en la tabla de gruo_usuario de ada miembro del urso (tutor, tutorados)
         var id_actividad = filas.insertId;
         var con1 = conexion();
         con1.query('select * from grupo where id_curso = ?', [id_curso_contenidoCurso], function(errorOT, filasOT){
            if (errorOT) {
               console.log("Error. obtener los tutores " + errorOT);
               res.end();
            }else{
               for (var i = 0; i <= filasOT.length - 1; i++) {
                  var conT = conexion();
                  conT.query('insert into actividad_usuario values(?, ?, ?, ?, ?)', [id_actividad, filasOT[i].curp_tutor, 0, 0, null], function(errorIT, filasIT){
                     if (errorIT) {
                        console.log("Error al agregar e " + id_actividad);
                        res.end();
                     }
                  });
                  conT.end();
               }
               
            }
         });
         con1.end();
         var con2 = conexion();
         con2.query('select * from grupo join grupo_usuario on grupo.id = id_grupo where id_curso = ?', [id_curso_contenidoCurso], function(errorOTu, filasOTu){
            if (errorOTu) {
               console.log("Error. obtener los tutorados " + errorOTu);
               res.end();
            }else{
               for (var i = 0; i <= filasOTu.length - 1; i++) {
                  var conT = conexion();
                  conT.query('insert into actividad_usuario values(?, ?, ?, ?, ?)', [id_actividad, filasOTu[i].curp_tutorado, 0, 0, null], function(errorIT, filasIT){
                     if (errorIT) {
                        console.log("Error al agregar e " + id_actividad);
                        res.end();
                     }
                  });
                  conT.end();
               }
            }
         });
         con2.end();
      }
   });
   con.end();
}

module.exports.eliminar_actividad = function (req, res){
   var con = conexion();
   con.query('delete from actividad_usuario where id_actividad = ?', [req.params.id], function(error, filas){
      if (error) {
         console.log("Error. eliminar actividad_usuario " + error);
         res.end();
      }
   });
   con.end();

   var con1 = conexion();
   con1.query('delete from actividad where id = ?', [req.params.id], function(error, filas){
      if (error) {
         console.log("Error. eliminar actividad " + error);
         res.end();
      }else{
         res.redirect('/contenido_curso/' + req.params.idC);
      }
   });
   con1.end();
}

module.exports.recupera_credenciales = function (req, res){
   //obtenemos la informaion roorionada or el usuario ara restableer su ontraseña
   var datos = {usuario: req.body.usuario, curp:req.body.curp};
   var con = conexion();
   con.query("select * from usuario join login on curp = curp_usuario where curp = ? and status_cuenta = ?", [req.body.curp, 1], function(error, filas){
      if (error){
         console.log("Error. consulta recupera_credenciales " + error);
         res.end();
      }else{
         if (filas.length === 1) {
            if (filas[0].curp === req.body.curp) {
               var con2 = conexion();
               con2.query('select * from usuario join tipo_usuario on id_tipo_usuario = id where tipo_usuario = \'Autoridad Educativa\' or tipo_usuario = \'AUTORIDAD EDUCATIVA\'', function (errorA, filasA){
                  var curp_autoridad;
                  if (errorA){
                     console.log("Error. consulta recupera_credenciales A " + errorA);
                     res.end();
                  }else{
                     if (filasA.length > 0) {
                        curp_autoridad = filasA[0].curp;
                        var datos = [null, 'Solicitud de Credenciales','El usuario ' + filas[0].nombre + ' '
                           + filas[0].apellido_paterno + ' ' + filas[0].apellido_materno + 
                           ' ha solicitado sus credenciales para acceder al sitio, sus datos son: '+ 
                           ' Curp: \'' + filas[0].curp + '\' Usuario: \'' + filas[0].usuario + '\' Contraseña: \'' + filas[0].contrasenia + '\'',
                           new Date().toJSON().slice(0,10), 1];
                        var con3 = conexion();
                        con3.query('insert into aviso values(?, ?, ?, ?, ?)', datos, function (errorAv, filasAv){
                           if (errorAv){
                              console.log("Error. consulta recupera_credenciales Av " + errorAv);
                              res.end();
                           }else{
                              var con4 = conexion();
                              con4.query('insert into aviso_usuario values(?, ?, ?)', [filasAv.insertId, curp_autoridad, 0], function (errorI, filasI){
                                    if (errorI){
                                       console.log("Error. consulta recupera_credenciales I " + errorI);
                                       res.end();
                                    }else{
                                       if (filasI.affectedRows > 0) {
                                          res.render('pass_olvidado', {guardado: true, Titulo: 'Recuperar Contraseña'});
                                       }else{
                                          res.render('pass_olvidado', {error: true, guardado: false, Titulo: 'Recuperar Contraseña'});
                                       }
                                    }
                              });
                              con4.end();
                           }
                        });
                        con3.end();
                     }
                  }
               });
               con2.end();
            }
         }else{
            res.render('pass_olvidado', {error: true, guardado: false});
         }
      }
   });
   con.end();
}

//modulos en desarrollo
//INICIO cargar de archivos de tareas
module.exports.checkExtension = function (file){
   //extensiones permitidas
    var allowedExtensions = ["jpg","jpeg","gif","png","rar","pdf","docx"];
    //extension del archivo
    var extension = file.split('.').pop();
    //hacemos la comprobación
    return in_array(extension, allowedExtensions) === true ? true : false;
}

//funcion para comprobar valores en un array
function in_array(needle, haystack){
   var key = '';
   for(key in haystack){
      if(haystack[key] == needle){
         return true;
      }
   }
   return false;
}

//crea un nombre para la imagen a subir
module.exports.getFirstFileName = function (file){
   return getFileName(file)+"."+getExtension(file);
}

//obtenemos el nombre de la imagen
function getFileName(file){
   return file.substr(0, file.lastIndexOf('.')) || file;
}

//obtenemos la extensión de la imagen
function getExtension(file){
   return file.split('.').pop();
}
//FIN cargar de archivos de tareas

module.exports.reportes = function (req, res){
   var con2 = conexion();
   con2.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
      var numMensajes = 0;
      if (errorMe) {
         console.log('Error - obtener numero de mensajes ' + errorMe);
         res.end();
      }else{
         if (filasMe.length > 0) {
            numMensajes = filasMe[0].num_mensajes;
         }
         var con3 = conexion();
          con3.query('select * from curso order by id DESC', function(errorAv, filasAv){
            var listacursos = new Array();
            if (errorAv) {
               console.log('Error - obtener lista de avisos ' + errorAv);
               res.end();
            }else{
               for (var i = 0; i <= filasAv.length - 1; i++) {
                  var newAviso = {
                     id: filasAv[i].id,
                     nombre_curso: filasAv[i].nombre_curso
                  };
                  listacursos.push(newAviso);
               }
               var datos = {
                  seccionSeleccionada: 'Reportes', 
                  numMensajes: numMensajes,
                  curp_usuario: req.session.user.curp,
                  listaCursos: listacursos
               };
               if (req.session.user.reportesIdCurso != undefined) {
                  var con4 = conexion();
                  con4.query('select id, nombre_grupo, id_curso, curp_tutor, CONCAT(nombre, \' \', apellido_paterno, \' \', apellido_materno) as nombreTutor from grupo left join usuario on curp_tutor = curp where id_curso = ?', [req.session.user.reportesIdCurso], function(errorG, filasG){
                     var listaGrupos = new Array();
                     if (errorG) {
                        console.log('Error - obtener lista de grupos reportes ' + errorG);
                        res.end();
                     }else{
                        for (var i = 0; i <= filasG.length - 1; i++) {
                           var newGrupo = {
                              id: filasG[i].id,
                              nombre_grupo: filasG[i].nombre_grupo,
                              curp_tutor: filasG[i].curp_tutor,
                              nombrep_tutor: filasG[i].nombreTutor
                           };
                           listaGrupos.push(newGrupo);
                        }
                        datos.listaGrupos = listaGrupos;
                        datos.id_cursoSel = req.session.user.reportesIdCurso;
                        if (req.session.user.reportesIdGrupo != undefined) {
                           var con5 = conexion();
                           con5.query('select * from sesion where id_curso = ? order by numero_sesion;', [req.session.user.reportesIdCurso], function(errorS, filasS){
                              var listaSesiones = new Array();
                              if (errorS) {
                                 console.log('Error - obtener lista de sesiones reportes ' + errorS);
                                 res.end();
                              }else{
                                 for (var i = 0; i <= filasS.length - 1; i++) {
                                    var sesion = {id: filasS[i].id,
                                       fecha_inicio: filasS[i].fecha_inicio,
                                       fecha_fin: filasS[i].fecha_fin,
                                       numero_sesion: filasS[i].numero_sesion
                                    };
                                    listaSesiones.push(sesion);
                                 }
                                 datos.listaSesiones = listaSesiones;
                                 datos.id_grupoSel = req.session.user.reportesIdGrupo;
                                 if (req.session.user.reportesIdSesion != undefined) {
                                    datos.id_sesionSel = req.session.user.reportesIdSesion;
                                    if (datos.id_grupoSel == 'Todos') {//Se eligio todos los gruos
                                       console.log('Todos los gruos del curso ' + datos.id_cursoSel);
                                       res.end();
                                    }else{//Se eligio un grupo
                                       var con6 = conexion();//obtenemos a los miembros de ese grupo tutor-tutorados
                                       con6.query('select grupo.id, nombre_grupo, curp_tutor, grupo.id_curso, nombre_curso, curp_tutorado from grupo join grupo_usuario on grupo.id = id_grupo join curso on grupo.id_curso = curso.id where grupo.id = ?', [datos.id_grupoSel], function(errorTT, filasTT){
                                          if (errorTT) {
                                             console.log('Error - obtener lista de tutor-tutorados del grupo seleccionado reportes ' + errorTT);
                                             res.end();
                                          }else{
                                             var listaCurUsuarios = '';
                                             var listaTutorTutorados = new Array();
                                             for (var i = 0; i <= filasTT.length - 1; i++) {
                                                if (i == 0) {
                                                   var infoT = {curp_usuario: filasTT[i].curp_tutor,
                                                      tipo: 'Tutor'
                                                   };
                                                   listaTutorTutorados.push(infoT);
                                                   listaCurUsuarios += 'curp_usuario=\'' + filasTT[i].curp_tutor + '\' or ';
                                                }
                                                var info = {curp_usuario: filasTT[i].curp_tutorado,
                                                   tipo: 'Tutorado'
                                                };
                                                listaTutorTutorados.push(info);
                                                listaCurUsuarios += 'curp_usuario=\'' + filasTT[i].curp_tutorado + '\' or ';
                                             }
                                             if (datos.id_sesionSel == 'Todos') {//Se eligio todos las semanas
                                                console.log('Todos las semanas del curso ' + datos.id_cursoSel);
                                                var sqlX = 'select id_actividad, nombre_titulo, id_sesion, numero_sesion, curp_usuario, status_actividad from actividad_usuario join actividad on actividad.id = id_actividad join sesion on id_sesion = sesion.id join curso on sesion.id_curso = curso.id where curso.id =' + datos.id_cursoSel + ' and (' + listaCurUsuarios.substr(0, (listaCurUsuarios.length-4)) + ') order by numero_sesion, id_actividad';
                                                var con7 = conexion();
                                                con7.query(sqlX, function(errorRe, filasRe){
                                                   var listaActividades = new Array();
                                                   if (errorRe) {
                                                      console.log('Error - obtener lista de actividades reportes ' + errorRe);
                                                      res.end();
                                                   }else{
                                                      for (var i = 0; i <= filasRe.length - 1; i++) {
                                                         var actividad = {id_actividad: filasRe[i].id_actividad,
                                                            nombre_titulo: filasRe[i].nombre_titulo,
                                                            id_sesion: filasRe[i].id_sesion,
                                                            numero_sesion: filasRe[i].numero_sesion,
                                                            curp_usuario: filasRe[i].curp_usuario,
                                                            status_actividad: filasRe[i].status_actividad
                                                         };
                                                         listaActividades.push(actividad);
                                                      }
                                                      var listaActividadesTitulo = new Array();
                                                      listaTutorTutorados.forEach(function(itemS, indexS){
                                                         var listaActividadesUser = new Array();
                                                         listaActividades.forEach(function(itemM, indexM){
                                                            if (itemS.curp_usuario == itemM.curp_usuario) {
                                                               var actividadX = {id_actividad: itemM.id_actividad,
                                                                  nombre_titulo: itemM.nombre_titulo,
                                                                  id_sesion: itemM.id_sesion,
                                                                  numero_sesion: itemM.numero_sesion,
                                                                  status_actividad: itemM.status_actividad
                                                               };
                                                               listaActividadesUser.push(actividadX);
                                                            }
                                                            if (indexS == 0) {
                                                               if (itemS.curp_usuario == itemM.curp_usuario) {
                                                                  var act = {
                                                                     id_actividad: itemM.id_actividad,
                                                                     nombre_titulo: itemM.nombre_titulo,
                                                                     id_sesion: itemM.id_sesion,
                                                                     numero_sesion: itemM.numero_sesion,
                                                                  };
                                                                  listaActividadesTitulo.push(act);
                                                               }
                                                            }
                                                         });
                                                         itemS.actividadesRealizadas = listaActividadesUser;
                                                      });
                                                      datos.listaTutorTutorados = listaTutorTutorados;
                                                      datos.listaTituloActividades = listaActividadesTitulo;
                                                      res.render('reportes', {titulo: 'REPORTES', datos: datos});
                                                   }
                                                });
                                                con7.end();
                                             }else{//Se eligio una semana
                                                var sqlX = 'select id_actividad, nombre_titulo, curp_usuario, status_actividad from actividad_usuario join actividad on actividad.id = id_actividad where id_sesion = ' + datos.id_sesionSel + ' and (' + listaCurUsuarios.substr(0, (listaCurUsuarios.length-4)) + ')';
                                                var con7 = conexion();
                                                con7.query(sqlX, function(errorRe, filasRe){
                                                   var listaActividades = new Array();
                                                   if (errorRe) {
                                                      console.log('Error - obtener lista de actividades reportes ' + errorRe);
                                                      res.end();
                                                   }else{
                                                      for (var i = 0; i <= filasRe.length - 1; i++) {
                                                         var actividad = {id_actividad: filasRe[i].id_actividad,
                                                            nombre_titulo: filasRe[i].nombre_titulo,
                                                            curp_usuario: filasRe[i].curp_usuario,
                                                            status_actividad: filasRe[i].status_actividad
                                                         };
                                                         listaActividades.push(actividad);
                                                      }
                                                      //ahora onemos las actividades en el usuario que le corresonde
                                                      var listaActividadesTitulo = new Array();
                                                      listaTutorTutorados.forEach(function(itemS, indexS){
                                                         var listaActividadesUser = new Array();
                                                         listaActividades.forEach(function(itemM, indexM){
                                                            if (itemS.curp_usuario == itemM.curp_usuario) {
                                                               var actividadX = {id_actividad: itemM.id_actividad,
                                                                  nombre_titulo: itemM.nombre_titulo,
                                                                  status_actividad: itemM.status_actividad
                                                               };
                                                               listaActividadesUser.push(actividadX);
                                                            }
                                                            if (indexS == 0) {
                                                               if (itemS.curp_usuario == itemM.curp_usuario) {
                                                                  var act = {nombre_titulo: itemM.nombre_titulo };
                                                                  listaActividadesTitulo.push(act);
                                                               }
                                                            }
                                                         });
                                                         itemS.actividadesRealizadas = listaActividadesUser;
                                                      });
                                                      datos.listaTutorTutorados = listaTutorTutorados;
                                                      datos.listaTituloActividades = listaActividadesTitulo;
                                                      res.render('reportes', {titulo: 'REPORTES', datos: datos});
                                                   }
                                                });
                                                con7.end();
                                             }
                                          }
                                       });
                                       con6.end();
                                    }

                                 }else{
                                    res.render('reportes', {titulo: 'REPORTES', datos: datos});
                                 }
                              }
                           });
                           con5.end();
                        }else{
                           res.render('reportes', {titulo: 'REPORTES', datos: datos});
                        }
                     }
                  });
                  con4.end();
               }else{
                  res.render('reportes', {titulo: 'REPORTES', datos: datos});
               }
           }
          });
          con3.end();
      }
   });
   con2.end();
}

module.exports.pagina_principal = function (req, res){
   if (req.session.user) {
      var con3 = conexion();//obtenemos el numero de mensajes que el usuario actual no ha leido
      con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorM, filasM){
         var numMensajes = 0;
         if (errorM) {
            console.log('Error - obtener numero de mensajes');
            res.end();
         }else{
            if (filasM.length > 0) {
               numMensajes = filasM[0].num_mensajes;
            }
            var avisoActual = false;
            var con4 = conexion();
            con4.query('select id, nombre_aviso, descripcion, DATE_FORMAT(fecha, \'%d-%m-%Y\') as fecha from aviso where fecha = CURDATE() and id_tipo_aviso = 2', function(errorAc, filasAc){
               if (errorAc) {
                  console.log('Error - obtener aviso actual ' + errorAc);
                  res.end();
               }else{
                  var texto = '';
                  var tituloTexto = '';
                  for (var i = 0; i <= filasAc.length - 1; i++) {
                     texto += '<b>' + filasAc[i].nombre_aviso + '</b> - ' + filasAc[i].descripcion + '<br/><br/>';
                     tituloTexto = 'Avisos del ' + filasAc[i].fecha;
                     avisoActual = true;
                  }
                  var esAdmin = '';
                  if (req.session.user.tipo_usuario === 'Autoridad Educativa') {
                     esAdmin = 'es admin';
                  }else if (req.session.user.tipo_usuario === 'Tutor') {
                     esAdmin = 'es tutor';
                  }else if (req.session.user.tipo_usuario === 'Tutorado') {
                     esAdmin = 'es tutorado';
                  }
                  var datos = {
                     seccionSeleccionada: 'Página Principal', 
                     numMensajes: numMensajes,
                     curp_usuario: req.session.user.curp
                  };
                  datos.esAutoridadEducativa = esAdmin;
                  datos.texto = texto;
                  datos.titulo = tituloTexto;
                  datos.avisoActual = avisoActual;
                  datos.logeado = true;
                  res.render('pagina_principal', {datos: datos, titulo: 'PÁGINA PRINCIPAL'});
               }
            });
            con4.end({timeout: 60000});
         }
      });
      con3.end({timeout: 60000});
   }else{
      var datos = {
         seccionSeleccionada: 'Coordinación Nacional del Servicio Profesional Docente',
         logeado: false
      };
      res.render('pagina_principal', {datos: datos, titulo: 'Coordinación Nacional del Servicio Profesional Docente'});
   }
}

module.exports.tarea_tutorado = function(req, res, status, ruta){
    if (status == 'success') {
      actualizarStatusTarea(req, ruta);
   }
      var con1 = conexion();
      var sqlA = 'select * from actividad join actividad_usuario on actividad.id = id_actividad join sesion on id_sesion = sesion.id join curso on id_curso = curso.id where actividad.id = ? and curp_usuario = ?';
      con1.query(sqlA, [req.session.user.subir_tareaID, req.session.user.curp], function (errorA, filasA){
         if (errorA) {
            console.log('Error - consultar actividades contenido_curso' + errorA);
            res.end();
         }else{
            var datosTarea = {};
            var titulo = 'CURSO: ';
            for (var  i = 0; i <= filasA.length - 1; i++) {
               titulo += filasA[0].nombre_curso;
               datosTarea.id_actividad = filasA[i].id_actividad;
               datosTarea.nombre_titulo = filasA[i].nombre_titulo;
               datosTarea.descripcion_contenido = filasA[i].descripcion_contenido;
               datosTarea.fecha_inicio = filasA[i].fecha_inicio;
               datosTarea.fecha_fin = filasA[i].fecha_limite;
               datosTarea.id_tipo_actividad = filasA[i].id_tipo_actividad;
               datosTarea.id_sesion = filasA[i].id_sesion;
               datosTarea.status_actividad = filasA[i].status_actividad;
               datosTarea.fecha_realizacion = filasA[i].fecha_realizacion;
               datosTarea.id_curso = filasA[i].id_curso;
               datosTarea.nombre_curso = filasA[i].nombre_curso;
            }
            var con2 = conexion();
            con2.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
               var numMensajes = 0;
               if (errorMe) {
                  console.log('Error - obtener numero de mensajes ' + errorMe);
                  res.end();
               }else{
                  if (filasMe.length > 0) {
                     numMensajes = filasMe[0].num_mensajes;
                  }
                  var datos = {
                     seccionSeleccionada: 'Cotenido del Curso', 
                     numMensajes: numMensajes,
                     curp_usuario: req.session.user.curp,
                     datosTarea: datosTarea,
                     mensaje: status
                  };
                  res.render('subir_tarea', {titulo: titulo, datos: datos});
               }
            });
            con2.end();            
         }
      });
      con1.end();
}

function actualizarStatusTarea(req, ruta){
   var sql = "update actividad_usuario set status_actividad = ?, fecha_realizacion = NOW(), ruta = ? where id_actividad = ? and curp_usuario = ?";
   var con = conexion();
   con.query(sql, [1, ruta, req.session.user.subir_tareaID, req.session.user.curp], function(error, filas){
      if (error) {
         console.log("Error. al actualizar el status_actividad Tarea " + error);
         res.end();
      }
   });
   con.end();
}

module.exports.actualizarStatusTareaTutor = function (req){
   var sql = "update actividad_usuario set status_actividad = ?, fecha_realizacion = NOW() where id_actividad = ? and curp_usuario = ?";
   var con = conexion();
   con.query(sql, [1, req.session.user.ver_tareaID, req.session.user.curp], function(error, filas){
      if (error) {
         console.log("Error. al actualizar el status_actividad Tarea Tutor" + error);
         res.end();
      }
   });
   con.end();
}

module.exports.tarea_tutor = function(req, res, status, ruta){
   
   var con1 = conexion();
   var sqlA = 'select curp, CONCAT(nombre, \' \', apellido_paterno, \' \', apellido_materno) as nombre from curso join grupo on curso.id = id_curso join grupo_usuario on grupo.id = id_grupo join usuario on curp_tutorado = curp where curp_tutor = ?';
   con1.query(sqlA, [req.session.user.curp], function (errorA, filasA){
      var listaTutorados = '';
      var arrayTutorados = new Array();
      if (errorA) {
         console.log('Error - obtener tutorados tarea-tutor' + errorA);
         res.end();
      }else{
         for (var  i = 0; i <= filasA.length - 1; i++) {
            listaTutorados += 'curp_usuario = \'' + filasA[i].curp + '\' or ';
            var tutorado = {curp: filasA[i].curp,
               nombre: filasA[i].nombre
            };
            arrayTutorados.push(tutorado);
         }
         var con2 = conexion();
         var sqlA2 = 'select * from actividad join actividad_usuario on actividad.id = id_actividad join sesion on id_sesion = sesion.id join curso on id_curso = curso.id where actividad.id = ? and ('+ listaTutorados.substr(0, (listaTutorados.length-4)) +')';
         con2.query(sqlA2, [req.session.user.ver_tareaID], function (errorAc, filasAc){
            if (errorAc) {
               console.log('Error - consultar actividades tarea-tutor ' + errorAc);
               res.end();
            }else{
               var listaTutorados = new Array();
               var datosTarea = {};
               var titulo = 'CURSO: ';
               if (filasAc.length > 0) {
                  titulo += filasAc[0].nombre_curso;
                  datosTarea.id_actividad = filasAc[0].id_actividad;
                  datosTarea.nombre_titulo = filasAc[0].nombre_titulo;
                  datosTarea.descripcion_contenido = filasAc[0].descripcion_contenido;
                  datosTarea.fecha_inicio = filasAc[0].fecha_inicio;
                  datosTarea.fecha_fin = filasAc[0].fecha_limite;
                  datosTarea.id_tipo_actividad = filasAc[0].id_tipo_actividad;
                  datosTarea.id_sesion = filasAc[0].id_sesion;
                  datosTarea.id_curso = filasAc[0].id_curso;
                  datosTarea.nombre_curso = filasAc[0].nombre_curso;
               }
               for (var  i = 0; i <= filasAc.length - 1; i++) {
                  var tutorado = {curp_usuario: filasAc[i].curp_usuario,
                     id_actividad: filasAc[i].id_actividad,
                     status_actividad: filasAc[i].status_actividad,
                     fecha_realizacion: filasAc[i].fecha_realizacion,
                     ruta: filasAc[i].ruta
                  };
                  arrayTutorados.forEach(function(itemS, indexS){
                     if (itemS.curp == tutorado.curp_usuario) {
                        tutorado.nombre = itemS.nombre;
                     }
                  });
                  listaTutorados.push(tutorado);
               }
               var con3 = conexion();
               con3.query('select count(id) as num_mensajes from mensaje where status_leido = ? and destinatario = ?',[0, req.session.user.curp], function(errorMe, filasMe){
                  var numMensajes = 0;
                  if (errorMe) {
                     console.log('Error - obtener numero de mensajes ' + errorMe);
                     res.end();
                  }else{
                     if (filasMe.length > 0) {
                        numMensajes = filasMe[0].num_mensajes;
                     }
                     var datos = {
                        seccionSeleccionada: 'Ver Tareas', 
                        numMensajes: numMensajes,
                        curp_usuario: req.session.user.curp,
                        datosTarea: datosTarea,
                        tutorados: listaTutorados,
                        mensaje: status
                     };
                     res.render('ver_tarea', {titulo: titulo, datos: datos});
                  }
               });
               con3.end();
            }
         });
         con2.end();
      }
   });
   con1.end();
}



module.exports.conexion = conexion;
module.exports.nuevo_usuario = nuevo_usuario;
module.exports.nuevo_curso = nuevo_curso;
module.exports.usuario = usuario;
module.exports.curso = curso;
module.exports.nuevo_grupo = nuevo_grupo;
module.exports.mi_curso = mi_curso;