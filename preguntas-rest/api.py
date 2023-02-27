import base64
import json
from os import getcwd, remove
import codecs
import random
from flask import Flask, Blueprint, request, jsonify
from model.pregunta import Pregunta

from bbdd import DataBase

app = Flask(__name__) #aquí creamos una nueva instancia del servidor Flask.
baseDatos = DataBase()

routes_files = Blueprint("routes_files", __name__)

PATH_FILE = getcwd() + '/images/'

dicCategory = {
    1 : "UK General knowledge",
    2 : "UK Geography",
    3 : "UK History",
    4 : "UK Society",
    5 : "UK Mix",
    6 : "USA General knowledge",
    7 : "USA Geography",
    8 : "USA History",
    9 : "USA Society",
    10 : "USA Mix"
}

#################### FUNCIONES AUXILIARES ####################

@app.route("/")
def index():
    return "<h1>Hello World!</h1>"
	
@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

#################### COMIENZO API ####################

@app.route("/preguntas/register", methods=['POST']) 
def register():
    jon = json.loads(request.data)
    enunciado = jon['question']
    solucion = jon['response']
    categoria = jon['category']
    image = jon['image']

    idPregunta = baseDatos.registrarPregunta(enunciado, solucion, categoria, image)

    contenido = {
        "resultado":"OK",
        "id":idPregunta.__str__()
    }

    response = jsonify(contenido)
    response.status_code = 200
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

@app.route("/preguntas/registerFile", methods=['POST']) 
def register_from_file():

    numPreguntas=0
    uploaded_file = request.files['fileTxt']
    if uploaded_file.filename != '':
        uploaded_file.save(uploaded_file.filename)
        with codecs.open(uploaded_file.filename, mode='r', encoding='iso-8859-1') as f:
            cadena = repr(f.read().replace("\x96", "-").replace("\x92", "\"").replace("\x91", "\"").replace("\x85","...").replace("\x97","-")).split("\\r\\n")
            for i in cadena:
                c = i.split("¡")
                if c.__len__() == 3:
                    q = c[0]
                    r = c[1]
                    k = c[2]
                    baseDatos.registrarPregunta(q,r,dicCategory.get(int(k)),"null")
                    numPreguntas=numPreguntas+1
        remove(uploaded_file.filename)

    contenido = {
        "resultado":"OK",
        "numPreguntas":numPreguntas.__str__()
    }

    response = jsonify(contenido)
    response.status_code = 200
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response
        

@app.route("/preguntas/una", methods=['POST']) 
def getPregunta():
    jon = json.loads(request.data)
    temas = jon['temas']

    preguntas = baseDatos.getPreguntasPorCategorias(temas)
    preg = random.choice(preguntas)

    contenido = {
        "resultado":"OK",
        "enunciado": preg["enunciado"],
        "solucion" : base64.b64encode(bytes(preg["solucion"], encoding = "latin-1")).__str__(),
        "image" : preg["image"]
    }

    response = jsonify(contenido)
    response.status_code = 200
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

@app.route("/preguntas", methods=['GET']) 
def getPreguntas():

    preguntas = list(baseDatos.getAllPreguntas())

    for p in preguntas:
        if p['image'] == "null":
            p['image'] = False

    contenido = {
        "resultado":"OK",
        "questions" : json.dumps(preguntas)
    }

    response = jsonify(contenido)
    response.status_code = 200
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response

if __name__ == '__main__':
    from waitress import serve
    app.run(ssl_context=('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.crt', 'C://Users/Gonzalo/Desktop/Universidad/app/security/cert.key'), host='0.0.0.0',port=8385)
    
