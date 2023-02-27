var correcto = false;
var enunciado = window.localStorage.getItem("enunciado");
var solucion = window.localStorage.getItem("solucion");
var imagen = window.localStorage.getItem("imagen");

window.onload = async function (){

    document.getElementById("indice").innerHTML = "<h4 style='color:aliceblue'>Question:"+(parseInt(window.localStorage.getItem("pregunta"))+1)+"</h4>";

    if(window.localStorage.getItem("pregunta")!=window.localStorage.getItem("preguntaAnterior")){
    
        bool = await fetch("https://192.168.1.132:8384/usuarios/temasDisponibles",{
            method : 'GET'
        })
        .then(res => res.json())
        .then( res => {
            fetch("https://192.168.1.132:8385/preguntas/una",{
            method : 'POST',
            redirect: 'follow',
            body: JSON.stringify({'temas':res["temas"]})
            })
            .then(r => r.json())
            .then(r => {
                if(r["resultado"] == "OK"){
                    window.localStorage.setItem("enunciado", r["enunciado"]);
                    enunciado = r["enunciado"];
                    window.localStorage.setItem("imagen", r["image"]);
                    imagen = r["image"];
                    window.localStorage.setItem("solucion",r["solucion"]);
                    solucion = window.atob(r["solucion"].slice(2,-1));
                    window.localStorage.setItem("time",45);
                    window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
                    let fich = window.localStorage.getItem("fichero");
                    window.localStorage.setItem("fichero", fich + "Q:"+enunciado+"\nR:"+solucion+"\n\n");
                }
                cargarPagina();
                setTimeout(countdown, 1000);
            })
        })
    } else{
        cargarPagina();
        setTimeout(countdown, 1000);
    }
}

function cargarPagina(){

    document.getElementById("pregunta").innerHTML = enunciado;
    if(imagen !== "null"){
        let img = imagen.substring(54);
        document.getElementById("img").outerHTML = `<img width="100%" src="${img}" ` +
        `style="padding-left: 10%;padding-right: 10%; max-height: 35vw;" id="img" alt="question image"></img>`;
    } else {
        document.getElementById("escenario").innerHTML = "<video width='80%' style='margin-left:10%;margin-right:10%;max-height: 35vw;'"+
        "autoplay loop><source src='/videos/playing.mp4' type='video/mp4'>The video is not"+
        "compatible with your browser.</video>"
    }
    for (var i = 0; i < window.localStorage.getItem("comodin"); i++)
        document.getElementById("comodines").innerHTML += "🃏";
    for( var i=0; i<solucion.length; i++){
        if(solucion[i] === " ")
            document.getElementById("response").innerHTML += '<br>'//'<input type="text" id="solucion" size="1" maxlength="1" style="margin: 5px;background-color:black" readonly></input>';
        else
            document.getElementById("response").innerHTML += '<input type="text" id="solucion" size="1" maxlength="1" style="margin: 5px;"></input>';
    }
}

function comprobarRespuesta(){
    var r = "";
    var collection = document.getElementById("response").children;
    for (var i = 0; i < collection.length; i++) {
        if(collection[i].tagName == 'BR') r+=" ";
        else r += collection[i].value;
    }
    if(r.toLowerCase() === solucion.toLowerCase()){
        correcto = true;
        window.localStorage.setItem("score", parseInt(window.localStorage.getItem("score"))+1);
        window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
        window.localStorage.setItem("pregunta", parseInt(window.localStorage.getItem("pregunta"))+1);
        var collection = document.getElementsByTagName("input");
        for (let i = 0; i < collection.length; i++) {
            r += collection[i].style.backgroundColor = "green";
        }

        new swal({
            position:'center',
            title:'Good job!', 
            text:'Your score: '+window.localStorage.getItem("score"), 
            icon:'success',
            buttons: {
                catch: {
                    text: "Great!",
                    value: true,
                }
            }
        })
            .then((value) => {
                if(value){
                    window.localStorage.setItem("reloadFinal","OK");
                    if(parseInt(window.localStorage.getItem("pregunta"))>9) window.location.href="/aloneMode/final";
                    else window.location.reload();
                }
            })
    }
}

function countdown() {
    timeLeft = parseInt(window.localStorage.getItem("time"));
	timeLeft --;
    window.localStorage.setItem("time",timeLeft);
	document.getElementById("seconds").innerHTML = String( timeLeft );
	if (timeLeft > 0) {
		setTimeout(countdown, 1000);
        if(!correcto)comprobarRespuesta();
	}
    if(timeLeft == 0 && !correcto) {
        var collection = document.getElementsByTagName("input");
        window.localStorage.setItem("preguntaAnterior", window.localStorage.getItem("pregunta"));
        window.localStorage.setItem("pregunta", parseInt(window.localStorage.getItem("pregunta"))+1);
        for (let i = 0; i < collection.length; i++) {
            collection[i].style.backgroundColor = "red";
        }
        window.localStorage.setItem("comodin",parseInt(window.localStorage.getItem("comodin"))-1);
        
            window.localStorage.setItem("reloadFinal","ERROR");
            new swal({
                position:'center',
                title:'Oh nooo!', 
                text:'Your score: '+window.localStorage.getItem("score"), 
                icon:'error',
                buttons: {
                    catch: {
                        text: "OK",
                        value: true,
                    }
                }
            })
            .then((value) => {
                console.log("EE0")
                if(value){
                    console.log("EE1")
                    window.localStorage.setItem("reloadFinal","OK");
                    if(parseInt(window.localStorage.getItem("comodin"))<0 || parseInt(window.localStorage.getItem("pregunta"))>9){
                        console.log("EE2")
                        window.location.href="/aloneMode/final";
                    }
                    else{
                        console.log("EE3")
                        window.location.reload();
                    }
                }
            })
        
    }
}