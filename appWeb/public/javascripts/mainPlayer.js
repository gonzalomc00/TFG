function singleMode() {
    new swal({
        title:'SINGLE MODE',
        text:'In this mode you must answer 10 questions. To answer a question, you must fill in each ‘square’ with a letter that completes the answer. If you answer correctly, you will win a point. You will have 45 seconds to read and provide an answer for each question. If time runs out before you answer correctly, you will not win any points. There are 5 wildcards in this mode. You can use the wildcards to skip questions that you are unable to answer, but you will not win any points. If you fail to answer, you will be dropped from the game and lose. Scoring 10 points earns you a gold medal, 9 points earn you a silver medal and 8-7 points earn you a bronze medal.',
        icon:'info',
        showDenyButton: true,
        confirmButtonText: 'PLAY',
        denyButtonText: `Go back`
    }).then((result) => {
            if (result.isConfirmed)
                initAloneMode();
        })
}

function battleMode() {
    new swal({
        title:'BATTLE MODE',
        text:'In this mode you can challenge with your friends in a game. To answer a question, you must fill in each ‘square’ with a letter that completes the answer. If you answer correctly, you will win a point. You have 45 seconds to read each question and provide the correct answer. If time runs out before you answer, you will not win any points. You will have 3 wildcards. You can use the wildcard when you want to skip a question, but you will not get a point. If you fail to answer, you will be dropped from the game and lose. The last player who remains standing by the end of the game with max points in 15 questions, he win.',
        icon:'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Join',
        denyButtonText: `Create`
    }).then((result) => {
        if (result.isConfirmed){
            //JOIN
            initJoinBattle();
        }
        else if(result.isDenied){
            //CREATE
            initCreateBattle();
        }
    })
}

function infiniteMode() {
    new swal({
        title:'INFINITE MODE',
        text:'In this mode, you must answer as many questions as you can. To answer a question, you must fill in each ‘square’ with a letter that completes the answer. If you answer correctly, you will win a point. You will have 45 seconds to read and then answer the question. If time runs out and you are unable to answer, you will not win any points. There are no wildcards available. If you answer incorrectly, you will fall and lose the game. Let’s see how far you can get without falling down!',
        icon:'info',
        showDenyButton: true,
        confirmButtonText: 'PLAY',
        denyButtonText: `Go back`
    }).then((result) => {
        if (result.isConfirmed)
            initInfiniteMode();
    })
}

function challengeMode() {
    Swal.fire({
        title:'CLASSROOM CHALLENGE MODE',
        text:'In this mode you will take part in a class competition. To answer a question, you must fill in each gap ‘square’ with a letter that completes the answer. If you answer correctly, you will win a point.You have 45 seconds to read each question and provide the correct answer. If time runs out before you answer, you will not win any points.There are 5 wildcards. You can use the wildcards to skip questions that you are unable to answer, but you will not win any points. Answer as many questions as you can to win more points.The students with the most points by the end of the game will win a gold trophy.',
        icon:'info',
        showDenyButton: true,
        confirmButtonText: 'PLAY',
        denyButtonText: `Go back`
    }).then((result) => {
        if (result.isConfirmed)
            initCC();
    })
}

function initAloneMode() {
    window.localStorage.setItem("score", 0);
    window.localStorage.setItem("pregunta", 0);
    window.localStorage.setItem("preguntaAnterior", -1);
    window.localStorage.setItem("comodin", 5);
    window.localStorage.setItem("fichero", "");
    location.href = "/aloneMode";
}

function initInfiniteMode() {
    window.localStorage.setItem("score", 0);
    window.localStorage.setItem("pregunta", 0);
    window.localStorage.setItem("preguntaAnterior", -1);
    window.localStorage.setItem("fichero", "");
    location.href = "/infiniteMode";
}

function initCC() {
    window.localStorage.setItem("score", 0);  
    window.localStorage.setItem("pregunta", 0);
    window.localStorage.setItem("preguntaAnterior", -1);   
    window.localStorage.setItem("fichero", "");
    window.localStorage.setItem("comodin", 5);
    location.href = "/classroomChallenge/game";
}

function initJoinBattle() {
    window.localStorage.setItem("score", 0);  
    window.localStorage.setItem("pregunta", 0);
    window.localStorage.setItem("preguntaAnterior", -1);   
    window.localStorage.setItem("fichero", "");
    window.localStorage.setItem("comodin", 3);
    window.location.href="/battle?mode=join"
}

function initCreateBattle() {
    window.localStorage.setItem("score", 0);
    window.localStorage.setItem("pregunta", 0);
    window.localStorage.setItem("preguntaAnterior", -1); 
    window.localStorage.setItem("fichero", "");
    window.localStorage.setItem("comodin", 3);
    window.location.href="/battle?mode=create"
}