function validarModal() {
    pssw = document.getElementById("floatingPassword1").value;

    if(pssw == ""){
        swal("There was an error", "The password field in modal cannot be empty. Please, reload the page.", "error");
        return false;
    } else return true;
}

function pedirDatos() {
    if(validarModal()){
        fD = new FormData();
        fD.append("password", window.btoa(document.getElementById("floatingPassword1").value));
        fD.append("mail", window.localStorage.getItem("correo"));

        fetch('http://127.0.0.1:8384/usuarios/mensajeContra', {
            method: 'POST',
            redirect : 'follow',
            body: fD
        })
        .then(r => r.json())
        .then( res => {
            if(res["resultado"] === "OK") swal("All right", "The mail was sent to your account.", "success");
            else swal("There was an error", res["mensaje"], "error");
        })
    }
}

function validarFormulario(){
    code = document.getElementById("floatingCode").value;
    password = document.getElementById("floatingPassword").value;
    password2 = document.getElementById("floatingPassword2").value;

    var strErrorMessage = "";
    var booValid = true;
    if(code == ""){
        strErrorMessage="The code field cannot be empty";
        booValid = false;
    }
    else if(password == "" || password2 == ""){
        strErrorMessage="The password fields cannot be empty";
        booValid = false;
    }else if(password !== password2){
        strErrorMessage="The password fields should be equals.";
        booValid = false;
    }if(!booValid){
        swal("There was an error", strErrorMessage, "error");
        return false;
    } 
    else return true;    
}

function enviarDatos() {
    if(validarFormulario()){
        fD = new FormData();
        fD.append("password", document.getElementById("floatingPassword").value);
        fD.append("code",document.getElementById("floatingCode").value);
        fD.append("mail", window.localStorage.getItem("correo"));

        fetch('http://127.0.0.1:8384/usuarios/chngPsswrd', {
            method: 'POST',
            redirect : 'follow',
            body: fD
        })
        .then(r => r.json())
        .then( res => {
            if(res["resultado"] == "OK"){
                document.getElementById("cierre-modal").click();
                swal("All right", "The mail was sent to your account.", "success");

            }
            else swal("There was an error", res["mensaje"], "error");
        })
    }
}