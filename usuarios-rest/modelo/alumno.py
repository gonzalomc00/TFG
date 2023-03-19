from modelo.vitrina import Vitrina


class Alumno:

    def __init__(self,correo,contrasena,nombre):
        self.mail = correo
        self.password = contrasena
        self.name = nombre
        self.vitrina = Vitrina()

    def setVitrina(self, vitrin):
        self.vitrina = vitrin

    def addTrofeo(self, trofeo):
        if(trofeo == "medallaOro"): self.vitrina.medallaOro +=1
        elif(trofeo == "medallaPlata"): self.vitrina.medallaPlata +=1
        elif(trofeo == "medallaBronce"): self.vitrina.medallaBronce +=1
        elif(trofeo == "trofeo"): self.vitrina.trofeo +=1
        elif(self.vitrina.recordInfinito < trofeo): self.vitrina.recordInfinito = trofeo
        self.vitrina.numPartidas +=1

    def getVitrinaJson(self):
        return {
            "medallaOro": self.vitrina.medallaOro,
            "medallaPlata": self.vitrina.medallaPlata,
            "medallaBronce": self.vitrina.medallaBronce,
            "trofeo": self.vitrina.trofeo,
            "recordInfinito": self.vitrina.recordInfinito,
            "numPartidas": self.vitrina.numPartidas
        }
    
    

