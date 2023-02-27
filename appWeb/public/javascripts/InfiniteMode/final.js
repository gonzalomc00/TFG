window.onload = function(){
    var trofeo = "";
    var trofeoString = "";
    var score = window.localStorage.getItem("score");

    document.getElementById("puntuacion").innerHTML = "Your score: "+score;

    var v = document.getElementsByTagName("video")[0];
    v.play();

    if(window.localStorage.getItem("reloadFinal") === "OK"){
        trofeo = parseInt(score);
        fetch("https://192.168.1.132:8384/usuarios/addTrophy",{
            method : 'POST',
            redirect: 'follow',
            body: JSON.stringify({'mail':window.localStorage.getItem("correo"), 'trofeo':trofeo })
        })
        .then(res => res.json())
        .then(res => {
            if(res["resultado"] == "OK"){
                document.getElementById("titulo").innerHTML = "Congratulations!!!";
                document.getElementById("video").innerHTML = '<source src="/videos/win.mp4" type="video/mp4"> This browser does not support the HTML5 video element.';
                swal("CONGRATULATIONS!","You get a new Record!!!" + trofeoString +"!!!","success");
            }
            else if(res["resultado"] == "NADA"){
                document.getElementById("titulo").innerHTML = "It's a bad day...";
                document.getElementById("video").innerHTML = '<source src="/videos/lost.mp4" type="video/mp4"> This browser does not support the HTML5 video element.';
                swal("Oh nooo...","You can not beat your record","error");
            }
            else {
                swal("Oh nooo...","There was an error, due to a server error.","error");
            }
        })
        window.localStorage.setItem("reloadFinal","ERROR");
    }
}

function salir() {
    window.localStorage.setItem("score",0);
    window.localStorage.setItem("pregunta",0);
    window.location.href='/';
}

function generarPDF(){
    var blob = new Blob([window.localStorage.getItem("fichero")], {type: "text/plain;charset=latin-1"});
    saveAs(blob, 'CChase.txt');
}