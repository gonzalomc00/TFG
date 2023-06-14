import json
import urllib
from bson import ObjectId
from datetime import datetime
from bson.json_util import dumps
from pymongo import MongoClient
from modelo.user import User
from modelo.vitrina import Vitrina
from mail import enviarCorreoLogroToProfesor, enviarCorreoLogroToAlumno

############ FUNCIONES AUXILIARES ############

def parseJsontoUser(json) -> User:
  
    user=User(json['_id'],json['mail'], json['password'], json['name'],json['lastname'],json['image'],json['rol'],json['vitrina'],json['history'])
    return user



############ CLASE BBDD ############


class DataBase:
    def __init__(self) -> None:
        # establish connex
        conn = MongoClient("mongodb+srv://gonzalo:Contrasena1234@cchaseprueba.mtrqiqh.mongodb.net/?retryWrites=true&w=majority")
        # connect db
        self.db = conn.Juego
        #self.db = conn.test
        self.collection=self.db.User
        self.collectionHistorial=self.db.Historia
        

    def registrarAlumno(self, mail, password, name,lastname):
        collection = self.db.User
        aInsertar = {"mail": mail,
                     "password": password,
                     "name": name,
                     "lastname":lastname,
                     "image":"",
                     "rol": "Student",
                     "vitrina": {"medallaOro": 0,
                                 "medallaPlata": 0,
                                 "medallaBronce": 0,
                                 "trofeoOro": 0,
                                 "trofeoPlata":0,
                                 "trofeoBronce":0,
                                 "recordInfinito": 0,
                                 "numPartidas": 0},
                     "history":[]}
        collection.insert_one(aInsertar)

    def getUserById(self,id) -> User:
        myquery={"_id":{"$eq":ObjectId(id)}}
        lista = list(self.collection.find(myquery))
        json_data = json.loads(dumps(lista))
        if(len(json_data) == 0):
            return None
        return parseJsontoUser(json_data[0])

    def getUserByMail(self, correo) -> User:
        myquery = {"mail": {"$eq": correo}}
        lista = list(self.collection.find(myquery))
        json_data = json.loads(dumps(lista))
        if(len(json_data) == 0):
            return None
        return parseJsontoUser(json_data[0])


    def getAllUsers(self):
        toReturn = []
        lista = list(self.collection.find())
        json_data = dumps(lista, default=lambda o: str(o))
        for objeto in json.loads(json_data):
            toReturn.append(parseJsontoUser(objeto))
        return toReturn
    
    def getAllAlumnos(self):
        toReturn = []
        myquery = {"rol": {"$eq": "Student"}}
        lista = list(self.collection.find(myquery))
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(parseJsontoUser(objeto))
        return toReturn

    def getAllProfesores(self):
        toReturn = []
        myquery = {"rol": {"$eq": "Teacher"}}
        lista = list(self.collection.find(myquery))
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(objeto)
        return toReturn


    def updatePassword(self, mail, contra):
        myquery = {"mail": {"$eq": mail}}
        updt = {"$set": {"password": contra}}
        self.collection.find_one_and_update(myquery, updt)



    def updateProfileImage(self,id,image):
        myquery={"_id":{"$eq":ObjectId(id)}}
        updt={"$set":{"image": image}}
        self.collection.find_one_and_update(myquery,updt)



    def deleteUser(self, id):
        myquery = {"_id": {"$eq": ObjectId(id)}}
        self.collection.find_one_and_delete(myquery)

    def cambiarPreguntas(self, mail, preguntas):
        myquery = {"mail": {"$eq": mail}}
        updt = {"$set": {"temas": preguntas}}
        self.collection.find_one_and_update(myquery, updt)

    def aluToProf(self, mail):
       myquery = {"mail": {"$eq": mail}}
       updt={"$set":{"rol":"Teacher"}}
       
       self.collection.find_one_and_update(myquery, updt)
       

    def actualizarVitrina(self,id,vitrina):
        myquery = {"_id": {"$eq": ObjectId(id)}}
        updt = {"$set": {"vitrina": vitrina}}
        self.collection.find_one_and_update(myquery, updt)
    
    def getTopMedallas(self):
        return self.collection.aggregate([
               { "$match": { "rol": { "$eq": "Student" } } },
             {"$sort":{"vitrina.medallaOro":-1}},
        {"$limit":10},
         {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.medallaOro",
            "_id":0
         }
        }
        ])
    
    def getTopMedallasSilver(self):
        return self.collection.aggregate([
               { "$match": { "rol": { "$eq": "Student" } } },
             {"$sort":{"vitrina.medallaPlata":-1}},
        {"$limit":10},
         {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.medallaPlata",
            "_id":0
         }
        },
        ])
    
    def getTopMedallasBronce(self):
        return self.collection.aggregate([ 
               { "$match": { "rol": { "$eq": "Student" } } },
            {"$sort":{"vitrina.medallaBronce":-1}},
        {"$limit":10},
         {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.medallaBronce",
            "_id":0
         }
        }
        ])
    


    def getTopTrofeos(self):
        return self.collection.aggregate([
               { "$match": { "rol": { "$eq": "Student" } } },
            {"$sort":{"vitrina.trofeoOro":-1}},
        {"$limit":10},
         {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.trofeoOro",
            "_id":0
         }
        },
        {"$sort":{"score":-1}},
        {"$limit":10}
        ])
    
    def getTopTrofeosPlata(self):
        return self.collection.aggregate([
             { "$match": { "rol": { "$eq": "Student" } } },
               {"$sort":{"vitrina.trofeoPlata":-1}},
        {"$limit":10},
         {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.trofeoPlata",
            "_id":0
         }
        },
     
        ])
    
    def getTopTrofeosBronce(self):
        return self.collection.aggregate([
               { "$match": { "rol": { "$eq": "Student" } } },
        {"$sort":{"vitrina.trofeoBronce":-1}},
        {"$limit":10},
         {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.trofeoBronce",
            "_id":0
         }
        },
     
        ])
    
    
    def getTopInfinites(self):
        return self.collection.aggregate([
               { "$match": { "rol": { "$eq": "Student" } } },
          {"$sort":{"vitrina.recordInfinito":-1}},
        {"$limit":10},
        {
        "$project": {
            "name": "$name",
            "lastname": "$lastname",
            "score": "$vitrina.recordInfinito",
            "_id":0
         }
        },
        ])
    
    



    def saveRegistroPartida(self,id_user,datos):
        filtro={'_id': ObjectId(id_user)}
        actualizacion={'$push': {'history': datos}}
        self.collection.update_one(filtro,actualizacion)

