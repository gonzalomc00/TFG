window.onload = function(){
    var winner = window.localStorage.getItem("winner").split(",");
    var winnertoPrint = winner[0];

    for(var i=1; i<winner.length; i++){
        winnertoPrint += ", "+winner[i];
    }

    document.getElementById("titulo").innerHTML = "Congratulations to " + winnertoPrint + "!!!"
    document.getElementById("video").innerHTML = '<source src="/videos/win.mp4" type="video/mp4"> This browser does not support the HTML5 video element.'

    var v = document.getElementsByTagName("video")[0];
    v.play();
}

function salir() {
    window.location.href='/';
}

function generarPDF(){
    var blob = new Blob([window.localStorage.getItem("fichero")], {type: "text/plain;charset=latin-1"});
    saveAs(blob, 'CChase.txt');
}