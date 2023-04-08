import base64
import json
from os import getcwd, remove
import codecs
import os
import random
import uuid
from flask import Flask, Blueprint, Response, flash, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from model.pregunta import Pregunta

from bbdd import DataBase


UPLOAD_FOLDER = getcwd() + '/images/'
ALLOWED_EXTENSIONS={'jpg','jpeg','png','webp'}

app = Flask(__name__) #aquí creamos una nueva instancia del servidor Flask.
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
baseDatos = DataBase()

routes_files = Blueprint("routes_files", __name__)



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
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization,enctype"
    return response


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_foto(file,idPregunta):

    if file.filename =='':
        flash('No selected file')
        return Response(status=400)
    
    if file and allowed_file(file.filename):
        filename=secure_filename(file.filename)
        #Evitamos nombres repetidos
        nombre_archivo= str(uuid.uuid1())+"_"+filename

        #Eliminamos la foto antigua, para ello obtenemos su nombre primero 
        question= baseDatos.getPreguntaById(idPregunta)
        if(question['image'] != ""):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'],question['image']))
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'],nombre_archivo))
        baseDatos.updateImagen(idPregunta,nombre_archivo)
        return nombre_archivo




#################### COMIENZO API ####################

@app.route("/preguntas", methods=['POST']) 
def register():
    enunciado = request.form["question"]
    solucion = request.form["answer"]
    pais= request.form["country"]
    categoria = request.form["topic"]
    informacion=request.form.get('information', '')
    


    idPregunta = baseDatos.registrarPregunta(enunciado, solucion,pais, categoria,informacion)
    if 'files' in request.files:
        file= request.files['files']
        upload_foto(file,idPregunta)


    return Response(status=200)

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

    preguntas = baseDatos.getAllPreguntas()
    listaJson=[]
    for pregunta in preguntas:
        doc= pregunta.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code =200
    return response


@app.route("/preguntas/<id>", methods=['DELETE'])
def deletePregunta(id):
    baseDatos.deletePregunta(id)
    return Response(status=200)

@app.route("/preguntas/<id>",methods=['PUT'])
def editPregunta(id):

    enunciado = request.form["question"]
    solucion = request.form["answer"]
    pais= request.form["country"]
    categoria = request.form["topic"]
    informacion=request.form.get('information', '')
    if 'files' in request.files:
        file= request.files['files']
        image=upload_foto(file,id)

    baseDatos.editarPregunta(id,enunciado,solucion,pais,categoria,informacion)


    return Response(status=200)

@app.route("/temas",methods=['POST'])
def crearTemas():
    baseDatos.crearTemas()
    return Response(status=200)

@app.route("/temas",methods=['GET'])
def getTemas():
    contenido=baseDatos.getTemas()
    contenido_response={
        "UK": contenido['UK'],
        "USA":contenido['USA']
    }
    response = jsonify(contenido_response)
    response.status_code = 200
    return response

@app.route("/temas",methods=['PUT'])
def updateTemas():
    jon = json.loads(request.data)
    UK = jon["UK"]
    USA = jon["USA"]
    baseDatos.updateTemas(UK,USA)
    return Response(status=200)

@app.route("/games",methods=['POST'])
def crearGame():
    jon = json.loads(request.data)
    nombre = jon["nombre"]
    preguntas = jon["preguntas"]
    foo = random.SystemRandom()
    code = foo.randint(10000,100000)
    baseDatos.crearJuego(nombre,preguntas,code)
    return Response(status=200)

@app.route("/games",methods=['GET'])
def getGames():
    games=baseDatos.getGames()
    listaJson=[]
    for game in games:
        doc= game.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code =200
    return response

@app.route("/games",methods=['PUT'])
def updateGame():
    jon= json.loads(request.data)
    id = jon["_id"]
    nombre= jon["name"]
    preguntas = jon["questions"]
    status= jon["status"]
    baseDatos.updateGame(id,nombre,preguntas,status)
    return Response(status=200)

@app.route("/games/<id>",methods=['DELETE'])
def deleteGame(id):
    baseDatos.deleteGame(id)
    return Response(status=200)

@app.route("/games/<id>/preguntas",methods=['GET'])
def getPreguntasGame(id):
    preguntas= baseDatos.getQuestionsGame(id)
    listaJson=[]
    for pregunta in preguntas:
        doc= pregunta.to_dict()
        listaJson.append(doc)

    response=jsonify(listaJson)
    response.status_code =200
    return response



#ACTUALIZAR FOTOS
@app.route("/preguntas/<id>", methods=['POST'])
def uploadFotoPregunta(id):

    if 'files' not in request.files:
        flash('No file part')
        return Response(status=400)
    
    file= request.files['files']
    
    
    nombre_archivo= upload_foto(file)
    contenido = {
        
        "image" : nombre_archivo,
    }
    response = jsonify(contenido)
    response.status_code = 200
    return response
    
    
@app.route('/imagen/<filename>')
def imagenRequest(filename):
    print("eo")
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename, as_attachment=True)

if __name__ == '__main__':
    from waitress import serve
    #app.run(ssl_context=('C://Users/Gonzalo/Desktop/Universidad/app/security/cert.crt', 'C://Users/Gonzalo/Desktop/Universidad/app/security/cert.key'), host='0.0.0.0',port=8385)
    app.run(host='127.0.0.1',port=8385)

