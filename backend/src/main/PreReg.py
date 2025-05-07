from datetime import Datetime
from event import Event

class PreReg:

    def __init__(self, Event_Name, Start_Time, End_Time, weekday, summary):
        self.Event_Name = Event_Name
        self.Start_time = Start_Time
        self.End_time = End_Time
        self.weekday = weekday
        self.summary = summary

    def to_event(self) -> Event: 
        return Event(self.name, self.start, self.end)
    
    def __repr__(self) -> str: 
        return f"<PreReg {self.name!r} {self.start.isoformat()}- {self.end.isoformat()}>"
