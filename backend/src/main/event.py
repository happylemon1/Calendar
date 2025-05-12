from datetime import datetime

class Event:
    def __init__(self, name, duration, priority):
        self.name = name
        self.duration =  duration * 4
        self.priority = priority

    def to_dict(self):
        return {
            "name": self.name,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
        }
    
    
    def __lt__(self, other):
        # Override the less-than (<) comparison for priority
        return self.priority < other.priority

    def __repr__(self):
        return f"<Event {self.name!r} {self.priority}–{self.duration}>"
