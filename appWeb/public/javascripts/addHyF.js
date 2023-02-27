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
}