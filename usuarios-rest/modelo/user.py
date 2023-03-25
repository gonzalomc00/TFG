from modelo.vitrina import Vitrina


class User:

    def __init__(self,id,correo,contrasena,nombre,lastname,image,rol,vitrina):
        self._id=id
        self.mail = correo
        self.password = contrasena
        self.name = nombre
        self.lastname=lastname
        self.image=image
        self.rol=rol
        self.vitrina = vitrina

    def to_dict(self):
        return {
            "_id": str(self._id['$oid']),
            "nombre": self.name,
            "lastname":self.lastname,
            "correo": self.mail,
            "image":self.image,
            "rol": self.rol,
            "vitrina": self.vitrina
        }

    def setVitrina(self, vitrin):
        self.vitrina = vitrin

    def addTrofeo(self, trofeo):
        if(trofeo == "medallaOro"): self.vitrina.medallaOro +=1
        elif(trofeo == "medallaPlata"): self.vitrina.medallaPlata +=1
        elif(trofeo == "medallaBronce"): self.vitrina.medallaBronce +=1
        elif(trofeo == "trofeo"): self.vitrina.trofeo +=1
        elif(self.vitrina.recordInfinito < trofeo): self.vitrina.recordInfinito = trofeo
        self.vitrina.numPartidas +=1
