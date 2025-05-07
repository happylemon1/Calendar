from event import Event
from PreReg import PreReg
from calendar_helper import Calendar
import heapq

class schedule:

    def __init__(self):
        self.cal = Calendar()
        self.schedule = [{} for _ in range(7)]
        self.eventList = []
        self.preRegEvents = []

    def addEvent(self,event):
        heapq.heappush(self.eventList, event)
    
    def getNextEvent(self):
        if len(self.eventList) > 0:
            return heapq.heappop(self.eventList)
        else:
            return None

    def addPreRegEvents(self, preRegEvent):
        self.preRegEvents.append(preRegEvent)


    def preRegAdding(self):
        while len(self.preRegEvents >0):
            curr_preReg: PreReg = self.preRegEvents.pop(0)
            start = curr_preReg.Start_time
            end = curr_preReg.End_time
            weekday = curr_preReg.weekday
            summary = curr_preReg.summary
            for i in range (start, end):
                self.schedule[weekday][i] = summary



    def createSchedule(self) -> dict:
        while len (self.eventList) > 0:  
            event = self.getNextEvent 

            for i in range (len(self.schedule)):
                dict = self.schedule[i]
                for j in range(96):
                    if j not in dict: 
                        for j in range( j + event.duration):
                            isAvailable = True
                            if j in dict:
                                isAvailable = False
                        if isAvailable:
                            for j in range (j + event.duration):
                                isTrue = True

                                        
