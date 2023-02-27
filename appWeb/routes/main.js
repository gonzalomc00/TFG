var express = require('express');
var router = express.Router();

router.get('/addQuestion', function (req, res, next) {
    if (req.session.admin) {
        res.render('addQuestion');
    } else
        res.redirect('/users/login')
});

module.exports = router;