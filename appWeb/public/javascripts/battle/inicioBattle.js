var socket = io.connect("https://docentis.inf.um.es:8383", { forceNew: true });
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
    location.href = "/battle/game?mode=create";
}