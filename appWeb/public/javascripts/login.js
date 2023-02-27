function login(e) {
    let mail = $('#floatingMail').val()
    let pass = $('#floatingPassword').val()

    fetch('/users/signin', {
        method:'post',                    
        redirect : 'follow',
        headers : new Headers({'Content-Type':'application/json'}),
        body: JSON.stringify({'mail':mail, 'contrasena':window.btoa(pass) })})
        .then(res => res.json())
        .then(res => {
            if(res['resultado'] == 'OK') {
                if(res['alumno']){
                    window.localStorage.setItem("correo",res['correo']);
                    window.localStorage.setItem("nombre",res['nombre']);
                    window.localStorage.setItem("vitrina",res['vitrina']);
                    window.localStorage.setItem("tipo","Alumno");
                    location.href = "/";
                } else {
                    window.localStorage.setItem("correo",res['correo']);
                    window.localStorage.setItem("nombre",res['nombre']);
                    window.localStorage.setItem("tipo","Profesor");
                    location.href = "/";
                }
                
            } else{
                return swal("There was an error", "Credentials are invalid", "error");
            }        
        })

}


window.onload = function () {

    let btnRegister = document.querySelector('#btn-register');
    btnRegister.addEventListener('click', () => {location.href="/users/register"});

	let btnsingin = document.querySelector('#btn-singin');
    btnsingin.addEventListener('click', login);

    fetch("/stylesheets/footer.html").then(response => { return response.text() })
        .then(data => { document.querySelector("body").insertAdjacentHTML('beforeend', data); });
}