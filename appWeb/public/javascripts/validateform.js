function validate(){
    var strErrorMessage = "";
    var booValid = true;
    var expreg = /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/;
    if(!expreg.test(document.getElementById("floatingPassword1").value)){
        strErrorMessage="The password must be between 8 and 16 characters long, at least one digit, at least one lowercase, at least one uppercase, and at least one non-alphanumeric character.";
        booValid = false;
    }
    else if(document.getElementById("floatingMail").value == ""){
        strErrorMessage="The email field cannot be empty";
        booValid = false;
    }
    else if(document.getElementById("floatingCode").value == ""){
        strErrorMessage="The code field cannot be empty";
        booValid = false;
    }
    else if(document.getElementById("floatingUserName").value == ""){
        strErrorMessage="The full-name field cannot be empty";
        booValid = false;
    }
    else if(document.getElementById("floatingPassword1").value == ""){
        strErrorMessage="The password field cannot be empty";
        booValid = false;
    }
    else if(document.getElementById("floatingPassword1").value!=document.getElementById("floatingPassword2").value){
        strErrorMessage="The passwords should be equals";
        booValid = false;
    }
    if(!booValid){
        swal("There was a error",strErrorMessage,"error");
        return false;
    }
    else return true;
}

function validateLogin(){
    var strErrorMessage = "";
    var booValid = true;
    if(document.getElementById("floatingMail").value == ""){
        strErrorMessage="The email field cannot be empty";
        booValid = false;
    }
    if(document.getElementById("floatingPassword").value == ""){
        strErrorMessage="The password field cannot be empty";
        booValid = false;
    }
    if(!booValid){
        alert(strErrorMessage);
        return false;
    } 
    else return true;
}