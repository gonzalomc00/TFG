class Pregunta:

    def __init__(self,enunciado,pais,solucion,categoria):
        self.enunciado = enunciado
        self.solucion = solucion
        self.pais =pais
        self.categoria = categoria
        self.image = None

    def setImagen(self,imagen):
        self.image = imagen