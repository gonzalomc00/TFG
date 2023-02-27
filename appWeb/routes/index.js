const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();

const https = require('https');
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/* GET home page. */
router.get('/', async function(req, res, next) {
    var arrayMedallas =[];
    var arrayTrofeos;
    var arrayInfinite;

    if(!req.session.admin && req.session.user){
        res.render('playerMain');
    }else if(req.session.admin && req.session.user){
        await fetch('https://192.168.1.132:8384/usuarios/top',{
            method:'GET',
            agent: httpsAgent
        })
        .then(res => res.json())
        .then(res => {
            if(res["resultado"] == "OK"){
                arrayMedallas = JSON.parse(res["medallas"]);   
                arrayTrofeos = JSON.parse(res["trofeos"]);
                arrayInfinite = JSON.parse(res["infinites"]);
            }
        })
        res.render('adminMain', {medallas: arrayMedallas, trofeos: arrayTrofeos, records: arrayInfinite});
    }else
      res.redirect('users/login');
});

router.get('/aloneMode', function(req, res, next) {
    if(!req.session.admin && req.session.user){
        res.render('juego/pregunta',{msg: '<script src="/javascripts/aloneMode/pregunta.js"></script>'});
    }
    else
        res.redirect('users/login')
});

router.get('/aloneMode/final', function(req, res, next) {
    if(!req.session.admin && req.session.user){
        res.render('juego/final',{msg: '<script src="/javascripts/aloneMode/final.js"></script>'});
    }
    else
        res.redirect('users/login')
});

router.get('/infiniteMode', function(req, res, next) {
    if(!req.session.admin && req.session.user){
        res.render('juego/pregunta',{msg: '<script src="/javascripts/InfiniteMode/pregunta.js"></script>'});
    }
    else
        res.redirect('users/login')
});

router.get('/infiniteMode/final', function(req, res, next) {
    if(!req.session.admin && req.session.user){
        res.render('juego/final',{msg: '<script src="/javascripts/InfiniteMode/final.js"></script>'});
    }
    else
        res.redirect('users/login')
});

router.get('/stats', async function (req, res, next) {
    if(!req.session.admin && req.session.user){
        await fetch('https://192.168.1.132:8384/usuarios/top', {
            method: 'POST',
            agent: httpsAgent,
            redirect: 'follow',
            body: JSON.stringify({"mail":req.session.user})
        })
            .then(res => res.json())
            .then(res => {
                if (res["resultado"] == "OK") {
                    arrayMedallas = JSON.parse(res["medallas"]);
                    arrayTrofeos = JSON.parse(res["trofeos"]);
                    arrayInfinite = JSON.parse(res["infinites"]);
                }
            })
        res.render('stats', { medallas: arrayMedallas, trofeos: arrayTrofeos, records: arrayInfinite });
    }else
        res.redirect('users/login')
})

router.get('/trophies', async function (req, res, next) {
    if(!req.session.admin && req.session.user){
        var vitrina;

        await fetch('https://192.168.1.132:8384/usuarios', {
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
        res.render('vitrina',{medallaBronce:vitrina["medallaBronce"], medallaPlata:vitrina["medallaPlata"], medallaOro:vitrina["medallaOro"],
            numPartidas:vitrina["numPartidas"], recordInfinito:vitrina["recordInfinito"], trofeo:vitrina["trofeo"]});
    }
    else
        res.redirect('/users/login')
})

module.exports = router;

