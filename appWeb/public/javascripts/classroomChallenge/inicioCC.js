var socket = io.connect("https://192.168.1.132:8383", { forceNew: true });
var code = document.getElementById("codeRoom").innerHTML;

socket.on("messages", function (data) {
    socket.emit('join_roomProfesor', code);
    window.localStorage.setItem("sala", code);
});

socket.on("numJugadores", function (data) {
    document.getElementById("users").innerHTML = data;
})

function start(){
    socket.emit("inicioSala",code);
    
    window.localStorage.setItem("pregunta", 0);
    window.localStorage.setItem("preguntaAnterior", -1);
    window.localStorage.setItem("fichero", "");
    
    location.href = "/classroomChallenge/game";
}

