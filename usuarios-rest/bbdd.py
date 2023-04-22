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
  
    user=User(json['_id'],json['mail'], json['password'], json['name'],json['lastname'],json['image'],json['rol'],json['vitrina'])
    return user



############ CLASE BBDD ############


class DataBase:
    def __init__(self) -> None:
        # establish connex
        conn = MongoClient("mongodb+srv://gonzalo:Contrasena1234@cchaseprueba.mtrqiqh.mongodb.net/?retryWrites=true&w=majority")
        # connect db
        #self.db = conn.Juego
        self.db = conn.test
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
                                 "trofeo": 0,
                                 "recordInfinito": 0,
                                 "numPartidas": 0}}
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
        return self.collection.find({},{"name":1,"vitrina.medallaOro":1,"_id":0}).sort("vitrina.medallaOro",-1).limit(5)

    def getTopTrofeos(self):
        return self.collection.find({},{"name":1,"vitrina.trofeo":1,"_id":0}).sort("vitrina.trofeo",-1).limit(5)
    
    def getTopInfinites(self):
        return self.collection.find({},{"name":1,"vitrina.recordInfinito":1,"_id":0}).sort("vitrina.recordInfinito",-1).limit(5)

    def getStatsUser(self, mail):
        toReturn = [0,0,0]
        infinite = list(self.collection.find({},{"name":1,"mail":1,"vitrina.recordInfinito":1,"_id":0}).sort("vitrina.recordInfinito",-1))
        cont = 0
        for i in infinite:
            cont+=1
            if i.get('mail') == mail:
                toReturn[0] = {"mail":mail,"name": i.get('name'), "vitrina": {"recordInfinito": i.get('vitrina').get('recordInfinito')},"ind": cont}
        
        trof = list(self.collection.find({},{"name":1,"mail":1,"vitrina.trofeo":1,"_id":0}).sort("vitrina.trofeo",-1))
        cont = 0
        for i in trof:
            cont+=1
            if i.get('mail') == mail:
                toReturn[1] = {"mail":mail,"name": i.get('name'), "vitrina": {"trofeo": i.get('vitrina').get('trofeo')},"ind": cont}

        medal = list(self.collection.find({},{"name":1,"mail":1,"vitrina.medallaOro":1,"_id":0}).sort("vitrina.medallaOro",-1))
        cont = 0
        for i in medal:
            cont+=1
            if i.get('mail') == mail:
                toReturn[2] = {"mail":mail,"name": i.get('name'), "vitrina": {"medallaOro": i.get('vitrina').get('medallaOro')},"ind": cont}
        
        return toReturn

    def comprobacionLogros(self, v, t, mail, profesores):
        if(t == "medallaPlata" or t == "medallaBronce" and (v["medallaOro"] + v["medallaPlata"] + v["medallaBronce"] == 19)):
            self.activarLogro(mail,4,profesores)
        elif(t == "medallaOro"):
            if(v["recordInfinito"] > 9 and v["medallaOro"] == 0):
                self.activarLogro(mail,1,profesores)
            if(v["medallaOro"] + v["medallaPlata"] + v["medallaBronce"] == 19):
                self.activarLogro(mail,4,profesores)
            if(v["medallaOro"] == 9):
                self.activarLogro(mail,5,profesores)
                if(v["trofeo"]>0 and v["recordInfinito"]>14):
                    self.activarLogro(mail,7,profesores)
            elif(v["medallaOro"]==19 and v["trofeo"]>2 and v["recordInfinito"]>24):
                self.activarLogro(mail,8,profesores)
            elif(v["medallaOro"]==14 and v["trofeo"]>1 and v["recordInfinito"]>19):
                self.activarLogro(mail,9,profesores)
            elif(v["medallaOro"]==4 and v["recordInfinito"]>19):
                self.activarLogro(mail,10,profesores)
        elif(t == "trofeo"):
            if(v["trofeo"] == 0):
                self.activarLogro(mail,2,profesores)
                if(v["recordInfinito"]>14):
                    self.activarLogro(mail,6,profesores)
                    if(v["medallaOro"] > 9):
                        self.activarLogro(mail,7,profesores)
            elif(v["trofeo"]==2 and v["recordInfinito"]>24 and v["medallaOro"]>19):
                self.activarLogro(mail,8,profesores)
            elif(v["trofeo"]==1 and v["recordInfinito"]>19 and v["medallaOro"]>14):
                self.activarLogro(mail,9,profesores)
        else:
            if(t > v["recordInfinito"]):
                if(t >9 and v["recordInfinito"]<10 and v["medallaOro"]>0):
                    self.activarLogro(mail,1,profesores)
                if(v["recordInfinito"]<15 and t>14):
                    self.activarLogro(mail,3,profesores)
                    if(v["trofeo"]>0):
                        self.activarLogro(mail,6,profesores)
                    if(v["medallaOro"]>9):
                        self.activarLogro(mail,7,profesores)
                if(v["recordInfinito"]<25 and t>24):
                    if(v["trofeo"]>2 and v["medallaOro"]>19):
                        self.activarLogro(mail,8,profesores)
                if(v["recordInfinito"]<20 and t>19):
                    if(v["medallaOro"]>4):
                        self.activarLogro(mail,10,profesores)
                    if(v["trofeo"]>1 and v["medallaOro"]>14):
                        self.activarLogro(mail,9,profesores)
    
    def activarLogro(self, mail, entero, profesores):
        if(entero==1):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Good Start", i)
            enviarCorreoLogroToAlumno(mail,"Good Start")
        elif(entero==2):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Best teammate", i)
            enviarCorreoLogroToAlumno(mail,"Best teammate")
        elif(entero==3):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Unstoppable",i)
            enviarCorreoLogroToAlumno(mail,"Unstoppable")
        elif(entero==4):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Wessex's Count",i)
            enviarCorreoLogroToAlumno(mail,"Wessex's Count")
        elif(entero==5):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"York's Duke",i)
            enviarCorreoLogroToAlumno(mail,"York's Duke")
        elif(entero==6):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Cambridge's Prince",i)
            enviarCorreoLogroToAlumno(mail,"Cambridge's Prince")
        elif(entero==7):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Cambridge's Duke",i)
            enviarCorreoLogroToAlumno(mail,"Cambridge's Duke")
        elif(entero==8):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"UK's Queen",i)
            enviarCorreoLogroToAlumno(mail,"UK's Queen")
        elif(entero==9):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Wales's Prince",i)
            enviarCorreoLogroToAlumno(mail,"Wales's Prince")
        elif(entero==10):
            for i in profesores:
                enviarCorreoLogroToProfesor(mail,"Sussex's Duke",i)
            enviarCorreoLogroToAlumno(mail,"Sussex's Duke")


    def saveRegistroPartida(self,datos):
        current_date = datetime.now()
        datos["fecha"] = current_date
        self.collectionHistorial.insert_one(datos)

    def getPartidasById(self,id):
        toReturn = []
        myquery = {"userId": {"$eq": id}}
        lista = list(self.collectionHistorial.find(myquery))
        json_data = dumps(lista)
        return json.loads(json_data)
        
