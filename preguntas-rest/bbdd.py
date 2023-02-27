import json
from bson.json_util import dumps
from pymongo import MongoClient
from bson.objectid import ObjectId

from model.pregunta import Pregunta

############ FUNCIONES AUXILIARES ############

############ CLASE BBDD ############
class DataBase:
    def __init__(self) -> None:
        # establish connex
        conn = MongoClient("mongodb+srv://gonzalo:Contrasena1234@cchaseprueba.mtrqiqh.mongodb.net/?retryWrites=true&w=majority")
        #conn = MongoClient("localhost",27017)
        # connect db
        self.db = conn.test

    def registrarPregunta(self,enunciado, solucion, categoria, image) :
        collection = self.db.Pregunta
        aInsertar = {
            "enunciado":enunciado,
            "solucion":solucion,
            "categoria":categoria,
            "image": image
        }
        result = collection.insert_one(aInsertar)
        return result.inserted_id

    def getPreguntaById(self, id) -> json:
        collection = self.db.Pregunta
        jd = collection.find_one({ "_id": ObjectId(id) })
        json_data = json.loads(dumps(jd))
        if(len(json_data)==0):
            return None
        return json_data
    
    def getAllPreguntas(self):
        toReturn = []
        collection = self.db.Pregunta
        lista = list(collection.find())
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(objeto)
        return toReturn

    def removeById(self, id):
        collection = self.db.Pregunta
        myquery = { "_id": { "$eq": id } }
        collection.find_one_and_delete(myquery)

    def updateById(self,id, pregunta):
        collection = self.db.Pregunta
        myquery = { "_id": { "$eq": id } }
        collection.update_one(myquery, pregunta)

    def updateImagen(self, id, imagen):
        p = self.getPreguntaById(id)
        pre = Pregunta(p['enunciado'],p['solucion'],p['categoria'])
        pre.setImagen(imagen)
        self.updateById(id,p)

    def getPreguntasPorCategorias(self, lista):
        collection = self.db.Pregunta
        toReturn = []
        for i in lista:
            myquery = { "categoria": { "$eq": i } }
            list = collection.find(myquery)
            for j in list:
                toReturn.append(j)
        return toReturn
