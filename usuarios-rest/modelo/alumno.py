
from modelo.vitrina import Vitrina
from modelo.user import User

class Alumno(User):

    def __init__(self,id,correo,contrasena,nombre,lastname,image,vitrina):
        super().__init__(id,correo,contrasena,nombre,lastname,image,"Student",vitrina)
    
    def to_dict(self):
        data = super().to_dict()
        return data

    

