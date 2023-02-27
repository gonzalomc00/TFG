const formidable = require('formidable');
const fetch = require('node-fetch');
var fs = require('fs');
var path = require('path');
var express = require('express');
const { response } = require('express');
var router = express.Router();

const https = require('https');
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});


router.post('/addPregunta', async function(req, res, next) {

    const uploadFolder = path.join(__dirname, "..", "public/uploads");

    let form = new formidable.IncomingForm();

    form.maxFileSize = 50 * 1024 * 1024; // 5MB
    form.uploadDir = uploadFolder;
    form.keepExtensions = true;
    
    var image = null;
    var q = null;
    var r = null;
    var c = null;

    form.parse(req, async function (err, fields, files) {
        
        if (err) {
            console.log("Error parsing the files");
            return res.status(400).json({
              status: "Fail",
              message: "There was an error parsing the files",
              error: err,
            });
        }

        q = fields['question'];
        r = fields['response'];
        c = fields['category'];

        for (const file of Object.entries(files)) {
            fileName = file[1].originalFilename;
            try {
                // renames the file in the directory
                fs.renameSync(file[1].filepath, path.join(uploadFolder, fileName));
                image = path.join(uploadFolder, fileName);
              } catch (error) {
                console.log(error);
              }
        }

        toResponse = await fetch('http://192.168.1.132:8385/preguntas/register', {
            method: 'POST',
            redirect : 'follow',
            agent: httpsAgent,
            body: JSON.stringify({'question': q, 'response':r, 'category':c, 'image':image.replace('\\\\','\\')})
        })
            .then(res => res.json())

        res.json(toResponse);
    });

});

router.get('/manageStudents', function(req, res, next) {
    if(req.session.admin){
        res.render('manageStudents');
    }else
      res.redirect('/users/login')
});

router.get('/startCC', function(req, res, next) {
    if(req.session.admin){
        var numero = parseInt(Math.random() * 89999 + 10000);
        res.render('juego/inicio',{msg:"Welcome to Classroom Challenge!" ,code:numero, script:'<script src="/javascripts/classroomChallenge/inicioCC.js"></script>'});
    }else
      res.redirect('/users/login')
});

router.get('/selectQuestionsCC', async function(req, res, next) {
    if(req.session.admin){
        var questions = await fetch("http://192.168.1.132:8385/preguntas",{
            method: 'GET',
            agent: httpsAgent
        })
            .then(res => res.json())
            .then(res => {
                if (res["resultado"] == "OK") {
                    return JSON.parse(res["questions"]);
                }
            })
            res.render('cc/preguntas',{preguntas:questions});
    }else
      res.redirect('/users/login')
});

module.exports = router;

