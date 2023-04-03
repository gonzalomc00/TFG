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
        self.collection=self.db.Pregunta

    def registrarPregunta(self,enunciado, solucion,pais, categoria,informacion) :
   
        aInsertar = {
            "enunciado":enunciado,
            "solucion":solucion,
            "pais":pais,
            "categoria":categoria,
            "informacion":informacion
     
        }
        result = self.collection.insert_one(aInsertar)
        return result.inserted_id

    def getPreguntaById(self, id) -> json:

        jd = self.collection.find_one({ "_id": ObjectId(id) })
        json_data = json.loads(dumps(jd))
        if(len(json_data)==0):
            return None
        return json_data
    
    def getAllPreguntas(self):
        toReturn = []
        lista = list(self.collection.find())
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(objeto)
        return toReturn

    def removeById(self, id):
        myquery = { "_id": { "$eq": ObjectId(id) } }
        self.collection.find_one_and_delete(myquery)

    def updateById(self,id, pregunta):
        myquery = { "_id": { "$eq": ObjectId(id) } }
        self.collection.update_one(myquery, pregunta)

    def updateImagen(self, id, image):
        myquery={"_id":{"$eq":ObjectId(id)}}
        updt={"$set":{"image": image}}
        self.collection.find_one_and_update(myquery,updt)

    def getPreguntasPorCategorias(self, lista):
        toReturn = []
        for i in lista:
            myquery = { "categoria": { "$eq": i } }
            list = self.collection.find(myquery)
            for j in list:
                toReturn.append(j)
        return toReturn
