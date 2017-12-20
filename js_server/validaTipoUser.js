module.exports.esAdmin = function (req, res){
  if (req.session.user) {
    if (req.session.user.tipo_usuario === 'Autoridad Educativa') {
      return true;
    }
  }
  res.send('No Autorizado');
  res.end();
  return false;
}

module.exports.esTutor = function (req, res){
  if (req.session.user) {
    if (req.session.user.tipo_usuario === 'Tutor') {
      return true;
    }
  }
  res.send('No Autorizado');
  res.end();
  return false;
}

module.exports.esTutorado = function (req, res){
  if (req.session.user) {
    if (req.session.user.tipo_usuario === 'Tutorado') {
      return true;
    }
  }
  res.send('No Autorizado');
  res.end();
  return false;
}