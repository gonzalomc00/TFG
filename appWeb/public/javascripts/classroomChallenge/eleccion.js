
function start(){
    var table = document.getElementById("myTable");
    var inputs = table.getElementsByTagName("input");
    var array = [];

    for (i = 0; i < inputs.length; i++) {
        if(inputs[i].checked){
            var pregunta={};
            pregunta["enunciado"] = table.rows[i+1].cells[1].innerHTML;
            pregunta["solucion"] = window.btoa(table.rows[i+1].cells[2].innerHTML);
            pregunta["img"] = table.rows[i+1].cells[4].id.replaceAll(/\\/ig,"/");
            array.push(pregunta);
        }
    }
    window.localStorage.setItem("preguntas",JSON.stringify(array));
    window.localStorage.setItem("preguntasLength",array.length);
    window.location.href="/classroomChallenge/inicio";
}

function back(){
  window.localStorage.removeItem("preguntas");
  location.href="/";
}

function myFunction() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
}