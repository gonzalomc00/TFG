var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const https = require('https');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/users');
var mainRouter = require('./routes/main');
var profesorRouter = require('./routes/profesor');
var ccRouter = require('./routes/CC');
var battleRouter = require('./routes/battle');
const constants = require('constants');
const fs = require('fs');
const Handlebars = require("handlebars")

var app = express();

var options = {
  /*
  secureOptions: constants.SSL_OP_NO_SSLv3 || constants.SSL_OP_NO_SSLv2 || constants.SSL_OP_NO_TLSv1 || constants.SSL_OP_NO_TLSv1_1,
	key: fs.readFileSync('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.key'),
	cert: fs.readFileSync('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.crt'),
	ca: [ fs.readFileSync('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.crt'), fs.readFileSync('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.crt') ]
  */
};

//Helpers de Handlebars



//APLICACION 


//const server = https.createServer(options, app);

var server = require("http").Server(app);
var io = require("socket.io")(server, { origins: '*:*' });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: genHexString(65),
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  }
}));

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/main', mainRouter);
app.use('/profesor', profesorRouter);
app.use('/classroomChallenge', ccRouter);
app.use('/battle', battleRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


function genHexString(len) {
  const hex = '0123456789ABCDEF';
  let output = '';
  for (let i = 0; i < len; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

  
// SOCKET IO
server.listen(8383, function () {
  console.log("Servidor corriendo en https://docentis.inf.um.es:8383");
});


var messages = [
  {
    author: "Carlos",
    text: "Hola! que tal?",
  },
  {
    author: "Pepe",
    text: "Muy bien! y tu??",
  },
  {
    author: "Paco",
    text: "Genial!",
  },
];

var rooms = new Map();
var i=0;
io.on("connection", function (socket) {
  console.log("Un cliente se ha conectado");
  socket.emit("messages", messages);

  socket.on('join_room', function (sala) {
    socket.join(sala);
    if (rooms.has(sala)) {
      rooms.set(sala, parseInt(rooms.get(sala)) + 1);
    } else {
      rooms.set(sala, 1);
    }
    io.to(sala).emit("numJugadores", rooms.get(sala));
  })

  socket.on('join_roomProfesor', function (sala) {
    socket.join(sala);
  })

  socket.on('leave_room', function (jsondata) {
    var data = JSON.parse(jsondata);
    var sala = data["sala"];
    if (rooms.has(sala+"")) {
      rooms.set(sala, rooms.get(sala+"")-1);
    } else {
      rooms.set(sala+"", 0);
    }
    io.to(sala).emit("numJugadores", rooms.get(sala));
    socket.leave(sala+"");
  })

  socket.on("inicioSala", function (code) {
    io.to(code).emit("inicioSala", "empezamos");
  })

  socket.on("newPregunta", function (datosjson) {
    var datos = JSON.parse(datosjson);
    io.to(datos["code"]).emit("newPregunta", datosjson);
  })

  socket.on("Tiempo", function (code) {
    io.to(code).emit("Tiempo", code);
  })

  socket.on("fin", function (datajson){
    var data = JSON.parse(datajson);
    var code = data["sala"];
    var fichero = data["fichero"];
    numRespeuestas.set(code,rooms.get(code+""));
    winner.set(code+"",[])
    io.to(code+"").emit("getScore",fichero);
  })

  socket.on("playerStats", function (datosjson){
    var flag = tratamientoScore(datosjson);
    if(flag > 0){
      io.to(flag+"").emit("Winner", winner.get(flag+""));
    }
  })

});

var winner = new Map();
var score = 0;
var numRespeuestas = new Map();
function tratamientoScore(datosjson){
  var datos = JSON.parse(datosjson);
  var code = datos["sala"];
  var winnerSala = winner.get(code+"");
  if(parseInt(datos["score"])>score){
    winnerSala=[];
    winnerSala.push(datos["mail"]);
  }
  else if(parseInt(datos["score"])==score)
    winnerSala.push(datos["mail"]);
  numRespeuestas.set(code,numRespeuestas.get(code)-1);
  winner.set(code+"", winnerSala);
  if(0 == numRespeuestas.get(code))
    return code;
  else return -1;
}