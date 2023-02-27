class Profesor:

    def __init__(self,correo,contrasena,nombre):
        self.mail = correo
        self.password = contrasena
        self.name = nombre
        self.alumnos = []
        self.temas = {
            "UK General knowledge" : False,
            "UK Geography" : False,
            "UK History" : False,
            "UK Society" : False,
            "UK Mix" : False,
            "USA General knowledge" : False,
            "USA Geography" : False,
            "USA History" : False,
            "USA Society" : False,
            "USA Mix" : False
        }
