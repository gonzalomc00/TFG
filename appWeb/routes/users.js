const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();


const http = require('http');
const httpAgent = new http.Agent({
  rejectUnauthorized: false
});


/* GET home page. */
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
})

router.post('/signin', async function (req, res, next) {
  let mail = req.body['mail'];
  let pass = req.body['contrasena'];
  toResponse = await fetch('http://127.0.0.1:8384/login', {
    method: 'post',
    agent: httpAgent,
    redirect: 'follow',
    body: JSON.stringify({ 'mail': mail, 'contrasena': pass })
  })
    .then(r => r.json())
    .then(r => {
      if (r['resultado'] === 'OK') {
        req.session.user=r['correo'];
        req.session.admin=!r['alumno'];
      }
      return r;
    })
    res.json(toResponse);
  
})

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/changePassword', function (req, res, next) {
  if (req.session.user)
    res.render('changePassword');
  else
    res.redirect('/');
});

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/achievements', async function (req, res, next) {
  if(!req.session.admin && req.session.user){
    var vitrina;

    await fetch('http://127.0.0.1:8384/usuarios', {
        method: 'GET',
        agent: httpsAgent
    })
        .then(res => res.json())
        .then(res => {
            if (res["resultado"] == "OK") {
                var array = res["lista"];
                for(var i=0;i<array.length;i++){
                    if(req.session.user === array[i]["mail"])
                        vitrina = array[i]["vitrina"]
                }
            }
        })
        logro1 = parseInt(vitrina["medallaOro"]) > 0 && parseInt(vitrina["recordInfinito"]) > 9;
        logro2 = parseInt(vitrina["trofeo"])>0;
        logro3 = parseInt(vitrina["recordInfinito"]) > 14;
        logro4 = parseInt(vitrina["medallaOro"]) + parseInt(vitrina["medallaPlata"]) + parseInt(vitrina["medallaBronce"])>19;
        logro5 = parseInt(vitrina["medallaOro"])>9;
        logro6 = logro3 && logro2;
        logro7 = logro6 && logro5;
        logro8 = parseInt(vitrina["trofeo"])>2 && parseInt(vitrina["recordInfinito"]) > 24 && parseInt(vitrina["medallaOro"])>19;
        logro9 = parseInt(vitrina["trofeo"])>1 && parseInt(vitrina["recordInfinito"]) > 19 && parseInt(vitrina["medallaOro"])>14;
        logro10 = parseInt(vitrina["recordInfinito"]) > 19 && parseInt(vitrina["medallaOro"])>4;

    res.render('trophies',{logro1:logro1, logro2:logro2, logro3:logro3, logro4:logro4,logro5:logro5,
      logro6:logro6, logro7:logro7, logro8:logro8, logro9:logro9, logro10:logro10});
}
else
    res.redirect('users/login')
});

module.exports = router;

