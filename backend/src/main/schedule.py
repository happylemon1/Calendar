from event import Event
from PreReg import PreReg
from calendar_helper import Calendar
import heapq

class schedule:

    def _init_(self, pre_regs: list[PreReg] = None):
        self.cal = Calendar()
        self.schedule = [{} for _ in range(7)]
        self.eventList = []
        if pre_regs: 
            for pr in pre_regs: 
                added = self.cal.add_event(pr.to_event())
    
    def addEvent(self,event):
        heapq.heappush(self.eventList, event)
    
    def getNextEvent(self):
        if len(self.eventList) > 0:
            return heapq.heappop(self.eventList)
        else:
            return None

    def addPreRegEvents(self,preRegEvents):
        self.preRegEvents.append(preRegEvents)


    def createSchedule(self):
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
                                this_dict.

                                        
