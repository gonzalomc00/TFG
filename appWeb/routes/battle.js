var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    if(req.session.user){
        if(req.query.mode == "join"){
            res.render('cc/entrada',{msg: '<script src="/javascripts/battle/join.js"></script>'});
        } else if(req.query.mode == "create"){
            var numero = parseInt(Math.random() * 89999 + 10000);
            res.render('juego/inicio',{msg:'Welcome to Battle Mode!' ,script:'<script src="/javascripts/battle/inicioBattle.js"></script>',code:numero});
        }
    }
    else
        res.redirect('users/login')
})

router.get('/game', function (req, res, next) {
    if(req.session.user){
        if(req.query.mode == "join"){
            res.render('cc/entrada',{msg: '<script src="/javascripts/battle/join.js"></script>'});
        } else if(req.query.mode == "create"){
            res.render('juego/pregunta',{msg:'<script src="/javascripts/battle/create.js"></script>'});
        }
    }
    else
        res.redirect('users/login')
})

router.get('/final', function(req, res, next) {
    if(req.session.user && !req.session.admin){
        res.render('juego/final',{msg: '<script src="/javascripts/battle/final.js"></script>'});
    }
    else
        res.redirect('users/login')
});

module.exports = router;