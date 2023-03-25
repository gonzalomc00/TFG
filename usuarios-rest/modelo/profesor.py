from modelo.user import User

class Profesor(User):

    def __init__(self,id,correo,contrasena,nombre,lastname,image,temas,vitrina):
        super().__init__(id,correo,contrasena,nombre,lastname,image,"Teacher",vitrina)
        self.temas = temas

    def to_dict(self):
        data = super().to_dict()
        data["temas"] = self.temas
        return data
