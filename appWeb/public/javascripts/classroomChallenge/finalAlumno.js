document.getElementById("titulo").innerHTML = "The game is finished, but you can watch in the professor screen if you have won.";
document.getElementById("video").innerHTML = '<source src="/videos/playing.mp4" type="video/mp4"> This browser does not support the HTML5 video element.'
swal("FINISHED","You has fallen. Wait for the teacher to see the winner.","info");

document.getElementById("puntuacion").innerHTML = "Your score: " + window.localStorage.getItem("score");

var v = document.getElementsByTagName("video")[0];
v.play();

function salir() {
    window.localStorage.setItem("score",0);
    window.localStorage.setItem("pregunta",0);
    window.location.href='/';
}

function generarPDF(){
    var blob = new Blob([window.localStorage.getItem("fichero")], {type: "text/plain;charset=latin-1"});
    saveAs(blob, 'CChase.txt');
}