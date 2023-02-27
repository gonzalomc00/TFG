var arrayM=[];
var arrayI=[];
var arrayT=[];
window.localStorage.removeItem("preguntas");
window.localStorage.removeItem("time");
window.localStorage.removeItem("sala");
window.localStorage.removeItem("fichero");
window.localStorage.removeItem("imagen");
window.localStorage.removeItem("preguntasLength");
window.localStorage.removeItem("pregunta");
window.localStorage.removeItem("enunciado");
window.localStorage.removeItem("solucion");
window.localStorage.removeItem("preguntaAnterior");

$("#btn-dwnld1").click(function(){
    rankMedals();
});

$("#btn-dwnld2").click(function(){
    rankTrophies();
});

$("#btn-dwnld3").click(function(){
    rankInfinites();
});

fetch('https://192.168.1.132:8384/usuarios',{
    method: 'GET'
})
.then(res => res.json())
.then(res => {
    //Tomar datos
    arrayM = [['Name','Mail','Gold','Silver','Bronze']];
    arrayI = [['Name','Mail','Record']];
    arrayT = [['Name','Mail','Trophies']];

    var lista = res["lista"];
    for(var i=0;i<lista.length;i++){
        var miniMArray = [lista[i]["name"],lista[i]["mail"],lista[i]["vitrina"]["medallaOro"],lista[i]["vitrina"]["medallaPlata"],lista[i]["vitrina"]["medallaBronce"]];
        var miniRArray = [lista[i]["name"],lista[i]["mail"],lista[i]["vitrina"]["recordInfinito"]];
        var miniTArray = [lista[i]["name"],lista[i]["mail"],lista[i]["vitrina"]["trofeo"]];
        
        arrayM.push(miniMArray);
        arrayI.push(miniRArray);
        arrayT.push(miniTArray);
    }    
})

function s2ab(s) { 
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;    
}

function rankMedals(){
    //Añadir libro
    var wb = XLSX.utils.book_new();
    let date = new Date();
    let output = String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
    //Añadir propiedades
    wb.Props = {
        Title: "Ranking-Medals_CChase",
        Subject: "Medals",
        Author: "Universidad de Murcia",
        CreatedDate: output
    };
    //Añadir hoja
    wb.SheetNames.push("Medals");
    var ws_data = arrayM;
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Medals"] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'Cchase.xlsx');
}

function rankTrophies(){
    //Añadir libro
    var wb = XLSX.utils.book_new();
    let date = new Date();
    let output = String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
    //Añadir propiedades
    wb.Props = {
        Title: "Ranking-Trophies_CChase",
        Subject: "trophies",
        Author: "Universidad de Murcia",
        CreatedDate: output
    };
    //Añadir hoja
    wb.SheetNames.push("Trophies");
    var ws_data = arrayT;
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Trophies"] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'Cchase.xlsx');
}

function rankInfinites(){
    //Añadir libro
    var wb = XLSX.utils.book_new();
    let date = new Date();
    let output = String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
    //Añadir propiedades
    wb.Props = {
        Title: "Ranking-Records_CChase",
        Subject: "infinite",
        Author: "Universidad de Murcia",
        CreatedDate: output
    };
    //Añadir hoja
    wb.SheetNames.push("Infinite");
    var ws_data = arrayI;
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Infinite"] = ws;
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'Cchase.xlsx');
}