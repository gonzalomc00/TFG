var socket;
var correcto = false;
var solucion;

window.onload = function () {
    new swal({
        title: "Enter Match's code",
        input: 'number',
        confirmButtonText: "GO!",
        showCancelButton: true,
    }).then((res) => {
        if (!res.isConfirmed) window.location.href = "/";
        else {
            socket = io.connect("https://192.168.1.132:8383", { forceNew: true });
            socket.emit('join_room', res.value);
            window.localStorage.setItem("sala", res.value);

            socket.on("newPregunta", function (datajson) {
                correcto = false;
                var solicito = true;
                if (parseInt(window.localStorage.getItem("comodin")) < 0) {
                    var data = JSON.stringify({ "sala": parseInt(window.localStorage.getItem("sala")), "mail": window.localStorage.getItem("correo") })
                    document.getElementById("response").disabled = true;
                    //socket.emit("leave_room",data);
                    //window.location.href = "/classroomChallenge/final";
                    document.getElementById("main").outerHTML = `<main id="main" class="justify-content-between align-items-center" style="display: flex;flex-direction: column;">
                    <h1 style="color: aliceblue;">We are waiting for the winner...</h1>
                    <br>
                    <div class="spinner">
                        <span>L</span>
                        <span>O</span>
                        <span>A</span>
                        <span>D</span>
                        <span>I</span>
                        <span>N</span>
                        <span>G</span>
                    </div>
                    </main>`
                } else {


                    var main = `<div id="indice" style="float: left;margin: 20px;"></div>
                            <div><h4 id="comodines" style="display: flex;justify-content: center;padding: 20px;"></h4></div>
                            <div id="response" style="align-items: center;justify-content: center;flex-wrap: wrap;flex-direction: row;align-content: center;"></div>`
                    document.getElementById("main").innerHTML = main;
                    document.getElementById("indice").innerHTML = "<h4 style='color:aliceblue'>Your score: " + (parseInt(window.localStorage.getItem("score"))) + "</h4>";

                    if (window.localStorage.getItem("pregunta") != window.localStorage.getItem("preguntaAnterior")) {

                        var datos = JSON.parse(datajson);
                        window.localStorage.setItem("solucion", datos["sol"]);
                        solucion = window.atob(datos["sol"]);

                        for (var i = 0; i < window.localStorage.getItem("comodin"); i++)
                            document.getElementById("comodines").innerHTML += "🃏";
                        for (var i = 0; i < solucion.length; i++) {
                            if (solucion[i] === " ")
                                document.getElementById("response").innerHTML += '<br>'//'<input type="text" id="solucion" size="1" maxlength="1" style="margin: 5px;background-color:black" readonly></input>';
                            else
                                document.getElementById("response").innerHTML += '<input type="text" id="solucion" size="1" maxlength="1" style="margin: 5px;"></input>';
                        }
                    }

                    socket.on("Tiempo", function (data) {
                        if (!correcto && solicito) {
                            window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
                            window.localStorage.setItem("pregunta", parseInt(window.localStorage.getItem("pregunta")) + 1);
                            window.localStorage.setItem("comodin", parseInt(window.localStorage.getItem("comodin")) - 1);
                            var collection = document.getElementById("response").children;
                            for (let i = 0; i < collection.length; i++) {
                                collection[i].disabled = true;
                                collection[i].style.backgroundColor = "red";
                            }

                            solicito = false;
                        } else if (solicito) {
                            window.localStorage.setItem("score", parseInt(window.localStorage.getItem("score")) + 1);
                            window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
                            window.localStorage.setItem("pregunta", parseInt(window.localStorage.getItem("pregunta")) + 1);
                            solicito = false;
                        }
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
                            collection[i].disabled = true;
                        }
                    }
                    setTimeout(comprobarRespuesta, 500);
                }
                setTimeout(comprobarRespuesta, 500);
            })

            socket.on("getScore", function (rcv) {
                window.localStorage.setItem("fichero",rcv);
                var data = JSON.stringify({
                    "score": parseInt(window.localStorage.getItem("score")), "mail": window.localStorage.getItem("correo"),
                    sala: window.localStorage.getItem("sala")
                })
                socket.emit("playerStats", data);
                socket.emit("leave_room", window.localStorage.getItem("sala"));
                window.location.href = "/classroomChallenge/final";
            })

        }
    });
}

window.addEventListener("unload", function (e) {
    var data = JSON.stringify({ "sala": parseInt(window.localStorage.getItem("sala")) })
    socket.emit("leave_room", data);
    window.location.href = "/classroomChallenge/final";
});