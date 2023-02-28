function validate(){
    var strErrorMessage = "";
    var booValid = true;
    if(document.getElementById("question").value == ""){
        strErrorMessage="The question field cannot be empty";
        booValid = false;
    }
    else if(document.getElementById("response").value == ""){
        strErrorMessage="The response field cannot be empty";
        booValid = false;
    }
    if(!booValid){
        swal("There was an error", strErrorMessage, "error");
        return false;
    } 
    else return true;
}

async function enviarForm(){
    
    if(!validate()) return;
    else {
        let question = $('#question').val();
        let response = $('#response').val();
        let category = $('#category').val();

        var fD = new FormData();
        fD.append("question",question);
        fD.append("response",response);
        fD.append("category",category);
        fD.append("image",document.getElementById('image').files[0]);

        let res = await fetch('/profesor/addPregunta', {
            method: 'POST',
            redirect : 'follow',
            body: fD
        })
            .then(res => res.json())
        if(res['resultado'] == 'OK') {
            swal("All is right", "The question was saved succesfully","success")
        } else {
            swal("There was an error", "The question cannot be saved, due to a server error", "error");
        }
    }
}

async function enviarFile(){

    var fD = new FormData();
    fD.append("fileTxt",document.getElementById('fileTxt').files[0]);

    let res = await fetch('https://127.0.0.1:8385/preguntas/registerFile', {
        method: 'POST',
        redirect : 'follow',
        body: fD
    })
        .then(res => res.json())
    if(res['resultado'] == 'OK') {
        swal("All is right", "The question was saved succesfully","success")
    } else {
        swal("There was an error", "The question cannot be saved, due to a server error", "error");
    }
}