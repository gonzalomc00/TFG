function sendMail(){
   
    const data = new FormData(document.getElementById('code'));
    var request = new Request('http://127.0.0.1:8384/mensaje',{
        method: 'POST',
        mode: 'no-cors',
        redirect: 'follow',
        body: data
    })

    fetch(request)
    .then(function(response) {
        document.getElementById("cierre-modal").click();
    })
    .catch(function(err) {
        console.log(err);
    });
}

async function envioRegistro(){
    var mail = document.getElementById("floatingMail").value;
    var name = document.getElementById("floatingUserName").value;
    var passw = document.getElementById("floatingPassword1").value;
    var code = document.getElementById("floatingCode").value;
    var request = new Request('http://127.0.0.1:8384/alumno',{
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({"mail":mail,"name":name,"passw":window.btoa(passw),"code":code})
    });
    
    return fetch(request)
    .then(function(response) {
        if(response.status==200)
            return response.json()
    })
    .then(function(j){
        if(j['resultado'] == "OK"){
            return true;
        }
        else{
            return false;
        }
    })
    .catch(function(err) {
        console.log(err);
    });
}

function registrar(){
    if(validate()){
        const flag = envioRegistro();
        
        const  printModal = async () => {
            const v = await flag;
            if(v){
                swal("You are registered succesfully", "Everything is okey", "success");
                location.href="/users/login"
            } else {
                swal("Ouuh have ocurred a problem", "There are a registered's account with this mail or you use a not UMU mail", "error");
            }
        }
        printModal();
    }
}

window.onload = function () {

    let btnLogin = document.querySelector('#btn-login')
    btnLogin.addEventListener('click', () => {location.href="/users/login"})

    let btnSend = document.querySelector('#send-code');
    btnSend.addEventListener('click',sendMail);

	let btnsingin = document.querySelector('#btn-register')
    btnsingin.addEventListener('click', registrar);

    fetch("/stylesheets/footer.html").then(response => { return response.text() })
        .then(data => { document.querySelector("body").insertAdjacentHTML('beforeend', data); });
}