var enunciado = window.localStorage.getItem("enunciado");
var solucion //= window.atob(window.localStorage.getItem("solucion").slice(2,-1));
var imagen = window.localStorage.getItem("imagen");
var correcto = false;

var socket = io.connect("https://192.168.1.132:8383", { forceNew: true });

socket.emit("join_room", window.localStorage.getItem("sala"))

window.onload = async function () {

    if (window.localStorage.getItem("pregunta") != window.localStorage.getItem("preguntaAnterior")) {
        cargarPregunta();
    } else {
        cargarPagina();
        setTimeout(countdown, 1000);
    }
}

function cargarPagina() {

    document.getElementById("indice").innerHTML = "<h4 style='color:aliceblue'>" + (parseInt(window.localStorage.getItem("pregunta")) + 1) + "/15</h4>";
    document.getElementById("indice").innerHTML += "<h4 style='color:aliceblue'>Your score: " + (parseInt(window.localStorage.getItem("score"))) + "</h4>";

    document.getElementById("pregunta").innerHTML = enunciado;
    if (imagen !== "null") {
        let img = imagen.substring(54);
        document.getElementById("escenario").innerHTML = `<img width="100%" src="${img}" ` +
            `style="padding-left: 10%;padding-right: 10%; max-height: 35vw;" id="img" alt="question image"></img>`;
    } else {
        document.getElementById("escenario").innerHTML = "<video width='80%' style='margin-left:10%;margin-right:10%;max-height: 35vw;'" +
            "autoplay loop><source src='/videos/playing.mp4' type='video/mp4'>The video is not" +
            "compatible with your browser.</video>"
    }
    document.getElementById("comodines").innerHTML = ""
    for (var i = 0; i < parseInt(window.localStorage.getItem("comodin")); i++)
        document.getElementById("comodines").innerHTML += "🃏";
    document.getElementById("response").innerHTML = "";
    if (parseInt(window.localStorage.getItem("comodin")) < 0) {
        document.getElementById("response").innerHTML = "<p style='color:aliceblue'>You lost your wildcards, please continue to finish the match.</p>";
    }
    else {
        for (var i = 0; i < solucion.length; i++) {
            if (solucion[i] === " ")
                document.getElementById("response").innerHTML += '<br>'//'<input type="text" id="solucion" size="1" maxlength="1" style="margin: 5px;background-color:black" readonly></input>';
            else
                document.getElementById("response").innerHTML += '<input type="text" id="solucion" size="1" maxlength="1" style="margin: 5px;"></input>';
        }
    }
}

function countdown() {
    timeLeft = parseInt(window.localStorage.getItem("time"));
    timeLeft--;
    window.localStorage.setItem("time", timeLeft);
    document.getElementById("seconds").innerHTML = String(timeLeft);
    if (timeLeft > 0) {
        setTimeout(countdown, 1000);
        comprobarRespuesta();
    }
    if (timeLeft == 0) {
        socket.emit("Tiempo", window.localStorage.getItem("sala"));
        var collection = document.getElementsByTagName("input");
        window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
        window.localStorage.setItem("pregunta", parseInt(window.localStorage.getItem("pregunta")) + 1);

        if (!correcto) {
            for (let i = 0; i < collection.length; i++) {
                collection[i].style.backgroundColor = "red";
                collection[i].setAttribute("disabled", "disabled");
            }
            window.localStorage.setItem("comodin", parseInt(window.localStorage.getItem("comodin"))-1);
        }
        else {
            window.localStorage.setItem("score", parseInt(window.localStorage.getItem("score")) + 1);
            correcto = false;
        }

        new swal("TIME!", `Response: ${solucion}`, "question")
            .then(value => {

                //Enviar datos a alumnos
                if (parseInt(window.localStorage.getItem("pregunta")) < 5) {
                    cargarPregunta();
                } else {
                    socket.emit('fin',JSON.stringify({sala:window.localStorage.getItem("sala"), fichero:window.localStorage.getItem("fichero")}));
                    socket.on("getScore", function () {
                        var data = JSON.stringify({
                            "score": parseInt(window.localStorage.getItem("score")), "mail": window.localStorage.getItem("correo"),
                            sala: window.localStorage.getItem("sala")
                        })
                        socket.emit("playerStats", data);
                    })
                    socket.on("Winner", function (data) {
                        window.localStorage.setItem("winner", data);
                        socket.emit("leave_room", window.localStorage.getItem("sala"));
                        window.location.href = "/battle/final";
                    })
                }
            })
    }
}

async function cargarPregunta() {
    bool = await fetch("https://192.168.1.132:8384/usuarios/temasDisponibles", {
        method: 'GET'
    })
        .then(res => res.json())
        .then(res => {
            fetch("https://192.168.1.132:8385/preguntas/una", {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({ 'temas': res["temas"] })
            })
                .then(r => r.json())
                .then(r => {
                    if (r["resultado"] == "OK") {

                        window.localStorage.setItem("enunciado", r["enunciado"]);
                        enunciado = r["enunciado"];
                        window.localStorage.setItem("imagen", r["image"]);
                        imagen = r["image"];
                        window.localStorage.setItem("solucion", r["solucion"]);
                        solucion = window.atob(r["solucion"].slice(2,-1));
                        window.localStorage.setItem("time", 45);
                        window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
                        let fich = window.localStorage.getItem("fichero");
                        window.localStorage.setItem("fichero", fich + "Q:" + enunciado + "\nR:" + solucion + "\n\n");
                        socket.emit('newPregunta', JSON.stringify({ enun: enunciado, image: imagen, code: window.localStorage.getItem("sala"), sol: window.localStorage.getItem("solucion"), ind: window.localStorage.getItem("pregunta") }));
                    }
                    cargarPagina();
                    setTimeout(countdown, 1000);
                })
        })
}

function comprobarRespuesta() {
    var r = "";
    var collection = document.getElementById("response").children;
    for (var i = 0; i < collection.length; i++) {
        if (collection[i].tagName == 'BR') r += " ";
        else r += collection[i].value;
    }
    if (r.toLowerCase() === solucion.toLowerCase()) {
        correcto = true;
        var collection = document.getElementsByTagName("input");
        for (let i = 0; i < collection.length; i++) {
            r += collection[i].style.backgroundColor = "green";
            collection[i].setAttribute("disabled", "disabled");
        }
    }
}