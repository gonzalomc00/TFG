class Room():
    def __init__(self,id,gameCode):
        self.id=id
        self.gameCode=gameCode
        self.players=[]
        self.questionNumber=0
        self.questions=[]


    def to_dict(self):
        return {
            "id": self.id,
            "gameCode": self.gameCode,
            "players": self.players,
            "questionNumber":self.questionNumber,
            "questions": self.questions
        }