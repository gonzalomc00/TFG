from pprint import pprint
import random
import json
from flask import Flask, Response, request, jsonify
from mail import enviarCorreoRegistro, enviarCorreoPassword
from modelo.alumno import Alumno
import base64

from bbdd import DataBase

app = Flask(__name__) #aquí creamos una nueva instancia del servidor Flask.
baseDatos = DataBase()
listAlumnos = []
diccionario = {}


"""
client = MongoClient('localhost', 27017)

db = client.tfg
global collectionAlumno
collectionAlumno = db.alumno
"""

@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

#################### FUNCIONES AUXILIARES ####################
def comprobarRegistro(correo) -> bool:
    if(not correo.endswith("@um.es")):
      return False
    for alumno in baseDatos.getAllAlumnos():
        if(alumno.mail == correo):
            return False
    return True

def comprobarLoginAlumno(correo, contrasena) -> Alumno:
    alumno = baseDatos.getAlumnoByMail(correo)
    print(alumno.mail)
    if(alumno != None and alumno.password == contrasena):
        return alumno
    return None

def comprobarLoginProfesor(correo, contrasena) -> Alumno:
    profesor = baseDatos.getProfesorByMail(correo)
    print(profesor);
  
   
    if(profesor != None and profesor.password == contrasena):
        return profesor
    return None

#################### COMIENZO API ####################

@app.route("/")
def index():
    return "<h1>Hello World!</h1>"


@app.route("/login", methods=['POST']) 
def login():
    jon = json.loads(request.data)
    mail = jon["mail"]
    #Decomentación de la contraseña
    password = base64.b64decode(jon["contrasena"]).__str__()[2:-1]
    print(password)
    #password = jon["contrasena"]
    alumno = comprobarLoginAlumno(mail,password)
    if(alumno != None):
        contenido = {
            "resultado":"OK",
            "alumno": True,
            "nombre": alumno.name,
            "correo": alumno.mail,
            "vitrina": {
                "medallaOro" : alumno.vitrina.medallaOro,
                "medallaPlata" : alumno.vitrina.medallaPlata,
                "medallaBronce" : alumno.vitrina.medallaBronce,
                "trofeo" : alumno.vitrina.trofeo,
                "recordInfinito" : alumno.vitrina.recordInfinito,
                "numPartidas" : alumno.vitrina.numPartidas
            }
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response
    profesor = comprobarLoginProfesor(mail,password)
    if(profesor != None):
        contenido = {
            "resultado":"OK",
            "alumno": False,
            "nombre": profesor.name,
            "correo": profesor.mail
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response
    else:
        contenido = {
            "resultado":"ERROR",
        }
        response = jsonify(contenido)
        response.status_code = 401
        return response

@app.route("/alumno", methods=['POST']) 
def registro():
    jon = json.loads(request.data)
    mail = jon["mail"]
    password = jon["passw"]
    name = jon["name"]
    codigo = jon["code"]
    print("ComprobarRegistro:"+comprobarRegistro(mail).__str__())
    print("diccionario:"+(diccionario.get(mail)==int(codigo)).__str__())
    if(comprobarRegistro(mail)):
   # if(comprobarRegistro(mail) and diccionario.get(mail)==int(codigo)):
        baseDatos.registrarAlumno(mail,password,name)
        contenido = {
            "resultado": "OK"
        }
        print("registroOK")
        response = jsonify(contenido)
        response.status_code = 200
        return response
    else:
        print("registroERR")
        contenido = {
            "resultado": "ERROR"
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response

@app.route("/mensaje", methods=['POST'])
def sendMail():
    destinatario = request.form.get("email")
    foo = random.SystemRandom()
    code = foo.randint(10000,100000)
    enviarCorreoRegistro(destinatario,code)
    contenido = {
      "resultado": "OK"
    }
    resp = jsonify(contenido)
    resp.status_code = 200
    diccionario.update({destinatario:code})
    return resp

@app.route("/usuarios/mensajeContra", methods=['POST'])
def sendMailContrasena():
    destinatario = request.form.get("mail")
    contrasena = request.form.get("password")
    if(comprobarLoginAlumno(destinatario, contrasena) == None):
        contenido = {
      "resultado": "ERROR",
      "mensaje": "The password or mail was incorrect"
    }
    else:
        foo = random.SystemRandom()
        code = foo.randint(10000,100000)
        enviarCorreoPassword(destinatario,code)
        contenido = {
        "resultado": "OK"
        }
        diccionario.update({destinatario:code})
    
    resp = jsonify(contenido)
    resp.status_code = 200
    return resp

@app.route("/usuarios/chngPsswrd", methods=['POST'])
def cambioContrasena():
    code = request.form.get("code")
    mail = request.form.get("mail")
    contra = request.form.get("password")
    if(diccionario.get(mail)==int(code)):
        baseDatos.updatePassword(mail, contra)
        contenido = {
            "resultado" : "OK"
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response
    else:
        contenido = {
            "resultado" : "ERROR",
            "mensaje" : "The code was wrong"
        }
        response = jsonify(contenido)
        response.status_code = 400
        return response

@app.route("/usuarios", methods=['GET'])
def getAllAlumnos():
    lista = baseDatos.getAllAlumnos()
    listaJson = []
    for alumno in lista:
        doc = {
            "name" : alumno.name,
            "mail" : alumno.mail,
            "vitrina" : alumno.getVitrinaJson()
        }
        listaJson.append(doc)

    contenido = {
        "resultado" : "OK",
        "lista" : listaJson
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response

@app.route("/usuarios/rmvAlumno", methods=['POST'])
def rmvAlumno():
    jon = json.loads(request.data)
    mailA = jon["mailAlumno"]
    baseDatos.deleteAlumno(mailA)
    contenido = {
        "resultado" : "OK"
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response

@app.route("/usuarios/chngTemas", methods=['POST'])
def cambioTemas():
    jon = json.loads(request.data)
    mail = jon["mail"]
    preguntas = jon["preguntas"]

    baseDatos.cambiarPreguntas(mail, preguntas)
    contenido = {
        "resultado" : "OK"
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response

@app.route("/usuarios/getTemas", methods=['POST'])
def getTemas():
    jon = json.loads(request.data)
    mail = jon["mail"]
    profesor = baseDatos.getProfesorByMail(mail)
    contenido = {
        "resultado" : "OK",
        "temas" : profesor.temas
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response

@app.route("/usuarios/aluToProf", methods=['POST'])
def aluToProf():
    jon = json.loads(request.data)
    mail = jon["mail"]
    if(baseDatos.aluToProf(mail)):
        contenido = {
            "resultado" : "OK"
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response
    else:
        contenido = {
            "resultado" : "ERROR"
        }
        response = jsonify(contenido)
        response.status_code = 400
        return response

@app.route("/usuarios/temasDisponibles", methods=['GET'])
def getAllTemas():
    toReturn = []
    profesores = baseDatos.getAllProfesores()
    for p in profesores:
        profesor = baseDatos.getProfesorByMail(p["mail"])
        temas = profesor.temas
        for t in temas:
            if(temas.get(t) and not toReturn.__contains__(t)):
                toReturn.append(t)
    contenido = {
        "resultado" : "OK",
        "temas" : toReturn
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response

@app.route("/usuarios/addTrophy", methods=['POST'])
def addTrophy():
    jon = json.loads(request.data)
    mail = jon["mail"]
    trofeo = jon["trofeo"]

    alumno = baseDatos.getAlumnoByMail(mail)
    v = alumno.getVitrinaJson()

    flag = not (type(trofeo) == str)

    if(trofeo == "null" or ( flag and int(trofeo) <v["recordInfinito"])):
        contenido = {
            "resultado" : "NADA"
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response
    else:
        profesores = baseDatos.getAllProfesores()
        prof=[]
        for p in profesores:
            prof.append(p["mail"])
        baseDatos.addTrofeo(mail,trofeo,prof)
        contenido = {
            "resultado" : "OK"
        }
        response = jsonify(contenido)
        response.status_code = 200
        return response

@app.route("/usuarios/top", methods=['GET','POST'])
def getusersTop():

    medallas = list(baseDatos.getTopMedallas())
    trofeos = list(baseDatos.getTopTrofeos())
    infins = list(baseDatos.getTopInfinites())

    i=1
    for medal in medallas:
        medal['ind'] = i
        i +=1

    i=1
    for trof in trofeos:
        trof['ind'] = i
        i +=1

    i=1
    for inf in infins:
        inf['ind'] = i
        i +=1

    if request.method == 'POST':
        jon = json.loads(request.data)
        mail = jon["mail"]
        stats = baseDatos.getStatsUser(mail)
        infins.append(stats[0])
        trofeos.append(stats[1])
        medallas.append(stats[2])


    contenido = {
        "resultado" : "OK",
        "medallas" : json.dumps(medallas),
        "trofeos" : json.dumps(trofeos),
        "infinites" : json.dumps(infins)
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response


if __name__ == '__main__':
    from waitress import serve
    app.run(ssl_context=('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.crt', 'C://Users/Gonzalo/Desktop/Universidad/app/security/cert.key'), host='0.0.0.0',port=8384)
    
