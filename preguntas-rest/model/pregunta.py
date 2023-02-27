class Pregunta:

    def __init__(self,enunciado,solucion,categoria):
        self.enunciado = enunciado
        self.solucion = solucion
        self.categoria = categoria
        self.rutaImagen = None

    def setImagen(self,imagen):
        self.rutaImagen = imagen