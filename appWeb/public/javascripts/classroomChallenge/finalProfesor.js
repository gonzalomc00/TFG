window.onload = function(){
    var winner = window.localStorage.getItem("winner").split(",");
    var winnertoPrint = winner[0];

    for(var i=1; i<winner.length; i++){
        winnertoPrint += ", "+winner[i];
    }

    document.getElementById("titulo").innerHTML = "Congratulations to " + winnertoPrint + "!!!"
    document.getElementById("video").innerHTML = '<source src="/videos/win.mp4" type="video/mp4"> This browser does not support the HTML5 video element.'
    document.getElementById("btnDownload").outerHTML = "";

    var v = document.getElementsByTagName("video")[0];
    v.play();

    for(var i=0; i<winner.length; i++){
        fetch("https://192.168.1.132:8384/usuarios/addTrophy",{
            method : 'POST',
            redirect: 'follow',
            body: JSON.stringify({'mail':winner[i], 'trofeo':"trofeo" })
        })
        .then(res => res.json())
        .then(res => {
            if(res["resultado"] != "OK"){
                swal("Oh nooo...","There was an error, due to a server error.","error");
            }
        })
    }
}

function salir() {
    window.location.href='/';
}

window.addEventListener("beforeunload",function (e){
    var mensaje = "Are you sure to quit?";

    e.returnValue = mensaje;
    return mensaje;
})