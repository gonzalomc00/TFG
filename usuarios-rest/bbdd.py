import json
import urllib
from bson import ObjectId
from bson.json_util import dumps
from pymongo import MongoClient
from modelo.alumno import Alumno
from modelo.profesor import Profesor
from modelo.vitrina import Vitrina
from mail import enviarCorreoLogroToProfesor, enviarCorreoLogroToAlumno

############ FUNCIONES AUXILIARES ############


def parseJsontoAlumno(json) -> Alumno:
    alumno = Alumno(json['_id'],json['mail'], json['password'], json['name'],json['lastname'],json['image'])
    vitrinaJson = json['vitrina']
    nuevoVitrina = Vitrina()
    nuevoVitrina.setMedallaOro(vitrinaJson['medallaOro'])
    nuevoVitrina.setMedallaPlata(vitrinaJson['medallaPlata'])
    nuevoVitrina.setMedallaBronce(vitrinaJson['medallaBronce'])
    nuevoVitrina.setTrofeo(vitrinaJson['trofeo'])
    nuevoVitrina.setRecordInfinito(vitrinaJson['recordInfinito'])
    nuevoVitrina.setNumPartidas(vitrinaJson['numPartidas'])
    alumno.setVitrina(nuevoVitrina)
    return alumno


def parseJsontoProfesor(json) -> Profesor:
    profesor = Profesor(json['mail'], json['password'], json['name'])
    profesor.temas = json['temas']
    return profesor




############ CLASE BBDD ############


class DataBase:
    def __init__(self) -> None:
        # establish connex
        conn = MongoClient("mongodb+srv://gonzalo:Contrasena1234@cchaseprueba.mtrqiqh.mongodb.net/?retryWrites=true&w=majority")
        # connect db
        #self.db = conn.Juego
        self.db = conn.test

    def registrarAlumno(self, mail, password, name,lastname):
        collection = self.db.Alumno
        aInsertar = {"mail": mail,
                     "password": password,
                     "name": name,
                     "lastname":lastname,
                     "image":"",
                     "vitrina": {"medallaOro": 0,
                                 "medallaPlata": 0,
                                 "medallaBronce": 0,
                                 "trofeo": 0,
                                 "recordInfinito": 0,
                                 "numPartidas": 0}}
        collection.insert_one(aInsertar)

    def getAlumnoById(self,id) -> Alumno:
        collection=self.db.Alumno
        myquery={"_id":{"$eq":ObjectId(id)}}
        lista = list(collection.find(myquery))
        json_data = json.loads(dumps(lista))
        if(len(json_data) == 0):
            return None
        return parseJsontoAlumno(json_data[0])

    def getAlumnoByMail(self, correo) -> Alumno:
        collection = self.db.Alumno
        myquery = {"mail": {"$eq": correo}}
        lista = list(collection.find(myquery))
        json_data = json.loads(dumps(lista))
        if(len(json_data) == 0):
            return None
        return parseJsontoAlumno(json_data[0])

    def getAllAlumnos(self):
        toReturn = []
        collection = self.db.Alumno
        lista = list(collection.find())
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(parseJsontoAlumno(objeto))
        return toReturn

    def getAllProfesores(self):
        toReturn = []
        collection = self.db.Profesor
        lista = list(collection.find())
        json_data = dumps(lista)
        for objeto in json.loads(json_data):
            toReturn.append(objeto)
        return toReturn

    def getProfesorByMail(self, correo) -> Profesor:
               
        collection = self.db.Profesor
        
        myquery = {"mail": {"$eq": correo}}
        lista = list(collection.find(myquery))
       
        json_data = json.loads(dumps(lista))
        
        if(len(json_data) == 0):
            return None
        return parseJsontoProfesor(json_data[0])

    def updatePassword(self, mail, contra):
        collection = self.db.Alumno
        myquery = {"mail": {"$eq": mail}}
        updt = {"$set": {"password": contra}}
        collection.find_one_and_update(myquery, updt)



    def updateProfileImage(self,id,image):
        collection=self.db.Alumno
        myquery={"_id":{"$eq":ObjectId(id)}}
        updt={"$set":{"image": image}}
        collection.find_one_and_update(myquery,updt)



    def deleteAlumno(self, alumno):
        collection = self.db.Alumno
        myquery = {"mail": {"$eq": alumno}}
        collection.find_one_and_delete(myquery)

    def cambiarPreguntas(self, mail, preguntas):
        collection = self.db.Profesor
        myquery = {"mail": {"$eq": mail}}
        updt = {"$set": {"temas": preguntas}}
        collection.find_one_and_update(myquery, updt)

    def aluToProf(self, mail):
        datos = self.getAlumnoByMail(mail)
        if(datos == None):
            return False
        self.deleteAlumno(mail)
        collection = self.db.Profesor
        aInsertar = {"mail": mail,
                     "password": datos.password,
                     "name": datos.name,
                     "temas": {
                         "UK General knowledge": False,
                         "UK Geography": False,
                         "UK History": False,
                         "UK Society": False,
                         "UK Mix": False,
                         "USA General knowledge": False,
                         "USA Geography": False,
                         "USA History": False,
                         "USA Society": False,
                         "USA Mix": False
                     }
                     }
        collection.insert_one(aInsertar)
        return True

    def addTrofeo(self,mail,trofeo,profesores):
        alumno = self.getAlumnoByMail(mail)
        
        v = alumno.getVitrinaJson()
        self.comprobacionLogros(v, trofeo, mail, profesores)

        alumno.addTrofeo(trofeo)

        v2 = alumno.getVitrinaJson()

        collection = self.db.Alumno
        myquery = {"mail": {"$eq": mail}}
        updt = {"$set": {"vitrina": v2}}
        collection.find_one_and_update(myquery, updt)
    
    def getTopMedallas(self):
        collection = self.db.Alumno
        return collection.find({},{"name":1,"vitrina.medallaOro":1,"_id":0}).sort("vitrina.medallaOro",-1).limit(5)

    def getTopTrofeos(self):
        collection = self.db.Alumno
        return collection.find({},{"name":1,"vitrina.trofeo":1,"_id":0}).sort("vitrina.trofeo",-1).limit(5)
    
    def getTopInfinites(self):
        collection = self.db.Alumno
        return collection.find({},{"name":1,"vitrina.recordInfinito":1,"_id":0}).sort("vitrina.recordInfinito",-1).limit(5)

    def getStatsUser(self, mail):
        toReturn = [0,0,0]
        collection = self.db.Alumno
        infinite = list(collection.find({},{"name":1,"mail":1,"vitrina.recordInfinito":1,"_id":0}).sort("vitrina.recordInfinito",-1))
        cont = 0
        for i in infinite:
            cont+=1
            if i.get('mail') == mail:
                toReturn[0] = {"mail":mail,"name": i.get('name'), "vitrina": {"recordInfinito": i.get('vitrina').get('recordInfinito')},"ind": cont}
        
        trof = list(collection.find({},{"name":1,"mail":1,"vitrina.trofeo":1,"_id":0}).sort("vitrina.trofeo",-1))
        cont = 0
        for i in trof:
            cont+=1
            if i.get('mail') == mail:
                toReturn[1] = {"mail":mail,"name": i.get('name'), "vitrina": {"trofeo": i.get('vitrina').get('trofeo')},"ind": cont}

        medal = list(collection.find({},{"name":1,"mail":1,"vitrina.medallaOro":1,"_id":0}).sort("vitrina.medallaOro",-1))
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
