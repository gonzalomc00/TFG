function alumnoToProfesor(mail) {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        buttons: {
            cancel: true,
            confirm: true,
          }
      }).then((result) => {
        if (result == true) {
            fetch("http://127.0.0.1:8384/usuarios/aluToProf", {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({'mail':mail})
            })
            .then( res => res.json())
            .then(res => {
                if(res['resultado'] == 'OK') swal('Changed!',mail + ' is a professor now','success');
                else swal("There was an error", "The change cannot be saved, due to a server error", "error");
            })
            
        }
      })
}

function rmvAlumno(mail) {

    fetch("http://127.0.0.1:8384/usuarios/rmvAlumno", {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({'mailAlumno':mail})
    })
    .then( res => res.json())
    .then( res => {
        if(res['resultado'] == 'OK') {
            swal({
                position: 'center',
                title:"All is right",
                text: "The student was removed succesfully",
                icon:"success"
            })
        } else {
            swal("There was an error", "The student cannot be removed, due to a server error. Please, try it later.", "error");
        }
    })
}

window.onload = function () {

    fetch("/stylesheets/footer.html").then(response => { return response.text() })
        .then(data => { document.querySelector("body").insertAdjacentHTML('beforeend', data); });

    var header;
    if(window.localStorage.getItem("tipo")==="Profesor"){
        header = "/stylesheets/headerProfesor.html";
    } else {
        header = "/stylesheets/header.html";
    }
    fetch(header).then(response => { return response.text() })
        .then(data => { return data.replace('<li><label id="typeUser"></label></li>','<li style="background: mediumaquamarine;"><label id="typeUser">'+ window.localStorage.getItem("tipo") +'</label></li>')})
        .then(data => { return data.replace('<li><label id="nameUser"></label></li>','<li><label id="nameUser">'+ window.localStorage.getItem("nombre") +'</label></li>')})
        .then(data => { return data.replace('<li><label id="mailUser"></label></li>','<li><label id="mailUser">'+ window.localStorage.getItem("correo") +'</label></li>')})
        .then(data => { document.querySelector("body").insertAdjacentHTML('beforebegin', data); })

    fetch("http://127.0.0.1:8384/usuarios", {
        method: 'GET',
        redirect: 'follow'
    })
    .then( res => res.json())
    .then( res => {
        let lista = res["lista"];
        let tabla = document.getElementById("tBody");
        let i = 0;
        for (var alumno of Object.entries(lista)) {
            i=i+1;
            var hilera = document.createElement("tr");
            hilera.innerHTML = '<th scope="row">'+i+'</th><td>'+alumno[1]["name"]+'</td><td>'+alumno[1]["mail"]+'</td>'+

            `<button type="button" style="background:red" onclick="rmvAlumno('${alumno[1]["mail"]}')" class="btn btn-danger">Delete</button>`

            + `<button class="buttonBlank" onclick="alumnoToProfesor('${alumno[1]["mail"]}')"><span class="button_top">Change to professor</span></button></td>`;
            tabla.appendChild(hilera);
        }
    })
    
    fetch("http://127.0.0.1:8384/usuarios/getTemas", {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({'mail': window.localStorage.getItem("correo")})
    })
    .then( res => res.json())
    .then( res => {
        document.getElementById("UKgk").checked = res["temas"]["UK General knowledge"];
        document.getElementById("UKgeo").checked = res["temas"]["UK Geography"];
        document.getElementById("UKhist").checked = res["temas"]["UK History"];
        document.getElementById("UKsoc").checked = res["temas"]["UK Society"];
        document.getElementById("UKmix").checked = res["temas"]["UK Mix"];
        document.getElementById("USAgk").checked= res["temas"]["USA General knowledge"];
        document.getElementById("USAgeo").checked= res["temas"]["USA Geography"];
        document.getElementById("USAhist").checked= res["temas"]["USA History"];
        document.getElementById("USAsoc").checked= res["temas"]["USA Society"];
        document.getElementById("USAmix").checked= res["temas"]["USA Mix"];
    })

}

function updateTemas(){
    let UKgk = document.getElementById("UKgk").checked;
    let UKgeo = document.getElementById("UKgeo").checked;
    let UKhist = document.getElementById("UKhist").checked;
    let UKsoc = document.getElementById("UKsoc").checked;
    let UKmix = document.getElementById("UKmix").checked;
    let USAgk = document.getElementById("USAgk").checked;
    let USAgeo = document.getElementById("USAgeo").checked;
    let USAhist = document.getElementById("USAhist").checked;
    let USAsoc = document.getElementById("USAsoc").checked;
    let USAmix = document.getElementById("USAmix").checked;

    let mail = window.localStorage.getItem("correo");

    let preguntas = {
        "UK General knowledge" : UKgk,
        "UK Geography" : UKgeo,
        "UK History" : UKhist,
        "UK Society" : UKsoc,
        "UK Mix" : UKmix,
        "USA General knowledge" : USAgk,
        "USA Geography" : USAgeo,
        "USA History" : USAhist,
        "USA Society" : USAsoc,
        "USA Mix" : USAmix
    }

    fetch("http://127.0.0.1:8384/usuarios/chngTemas", {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({'mail':mail , 'preguntas':preguntas})
    })
    .then( res => res.json())
    .then( res => {
        if(res['resultado'] == 'OK') {
            swal({
                position: 'center',
                title:"All is right",
                text: "The units have been updated succesfully",
                icon:"success"
            })
        } else {
            swal("There was an error", "The student cannot be updated, due to a server error. Please, try it later.", "error");
        }
    })
}