var express = require('express');
var router = express.Router();

router.get('/inicio', async function (req, res, next) {
    if (!req.session.admin && req.session.user) {
        res.render('cc/entrada');
    } else if (req.session.user) {
        var numero = parseInt(Math.random() * 89999 + 10000);
        res.render('juego/inicio', { msg: 'Welcome to Classroom Challenge!', script: '<script src="/javascripts/classroomChallenge/inicioCC.js"></script>', code: numero });
    } else
        res.redirect('/users/login');
})

router.get('/game', async function (req, res, next) {
    if (!req.session.admin && req.session.user) {
        res.render('cc/respuesta');
    } else if (req.session.user)
        res.render('cc/pregunta');
    else
        res.redirect('/users/login');
})

router.get('/final', function (req, res, next) {
    if (req.session.user && !req.session.admin) {
        res.render('juego/final', { msg: '<script src="/javascripts/classroomChallenge/finalAlumno.js"></script>' });
    }
    else if (req.session.admin) {
        res.render('juego/final', { msg: '<script src="/javascripts/classroomChallenge/finalProfesor.js"></script>' });
    }
    else
        res.redirect('users/login')
});

module.exports = router;