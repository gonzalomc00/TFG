var enunciado = window.localStorage.getItem("enunciado");
var solucion = window.localStorage.getItem("solucion");
var imagen = window.localStorage.getItem("imagen");
var socket = io.connect("https://192.168.1.132:8383", { forceNew: true });

socket.emit("join_roomProfesor", window.localStorage.getItem("sala"))

window.onload = async function () {

    if (window.localStorage.getItem("pregunta") != window.localStorage.getItem("preguntaAnterior")) {
        cargarPregunta();
    } else {
        cargarPagina();
        setTimeout(countdown, 1000);
    }
}

function cargarPagina() {

    if (parseInt(window.localStorage.getItem("preguntasLength")) > 0)
        document.getElementById("indice").innerHTML = "<h4 style='color:aliceblue'>" + (parseInt(window.localStorage.getItem("pregunta")) + 1) + "/" + parseInt(window.localStorage.getItem("preguntasLength")) + "</h4>";
    else
        document.getElementById("indice").innerHTML = "<h4 style='color:aliceblue'>" + (parseInt(window.localStorage.getItem("pregunta")) + 1) + "/10</h4>";
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
}

function countdown() {
    timeLeft = parseInt(window.localStorage.getItem("time"));
    timeLeft--;
    window.localStorage.setItem("time", timeLeft);
    document.getElementById("seconds").innerHTML = String(timeLeft);
    if (timeLeft > 0) {
        setTimeout(countdown, 1000);
    }
    if (timeLeft == 0) {
        socket.emit("Tiempo", window.localStorage.getItem("sala"));

        window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
        window.localStorage.setItem("pregunta", parseInt(window.localStorage.getItem("pregunta")) + 1);
        swal("TIME!", `Response: ${window.atob(solucion)}`, "info")
            .then(value => {

                let fich = window.localStorage.getItem("fichero");
                window.localStorage.setItem("fichero", fich + "Q:" + enunciado + "\nR:" + window.atob(solucion) + "\n\n");
                //Enviar datos a alumnos
                if (parseInt(window.localStorage.getItem("preguntasLength")) > 0) {
                    if(parseInt(window.localStorage.getItem("preguntasLength")) > parseInt(window.localStorage.getItem("pregunta"))){
                        cargarPregunta();
                    } else {
                        var data = JSON.stringify({
                            "sala": window.localStorage.getItem("sala"),
                            "fichero": window.localStorage.getItem("fichero")
                        });
                        socket.emit('fin', data);
                        socket.on("Winner", function (data) {
                            window.localStorage.setItem("winner", data);
                            window.location.href = "/classroomChallenge/final";
                        })
                    }
                } else {
                    if (parseInt(window.localStorage.getItem("pregunta")) < 10) {
                        cargarPregunta();
                    } else {
                        var data = JSON.stringify({
                            "sala": window.localStorage.getItem("sala"),
                            "fichero": window.localStorage.getItem("fichero")
                        });
                        socket.emit('fin', data);
                        socket.on("Winner", function (data) {
                            window.localStorage.setItem("winner", data);
                            window.location.href = "/classroomChallenge/final";
                        })
                    }
                }
            })
    }
}

async function cargarPregunta() {
    if (parseInt(window.localStorage.getItem("preguntasLength")) > 0) {
        var r = JSON.parse(window.localStorage.getItem("preguntas"))[window.localStorage.getItem("pregunta")];
        window.localStorage.setItem("enunciado", r["enunciado"]);
        enunciado = r["enunciado"];
        window.localStorage.setItem("imagen", r["img"]);
        if (r["img"] === "")
            imagen = "null";
        else imagen = r["img"];
        window.localStorage.setItem("solucion", r["solucion"]);
        solucion = r["solucion"];
        window.localStorage.setItem("time", 60);
        window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
        socket.emit('newPregunta', JSON.stringify({ code: window.localStorage.getItem("sala"), sol: solucion, ind: window.localStorage.getItem("pregunta") }));

        cargarPagina();
        setTimeout(countdown, 1000);
    } else {
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
                            solucion = r["solucion"].slice(2,-1);
                            window.localStorage.setItem("time", 60);
                            window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
                            socket.emit('newPregunta', JSON.stringify({ code: window.localStorage.getItem("sala"), sol: solucion, ind: window.localStorage.getItem("pregunta") }));
                        }
                        cargarPagina();
                        setTimeout(countdown, 1000);
                    })
            })
    }
}