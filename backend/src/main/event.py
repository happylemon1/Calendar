from datetime import datetime

class Event:
    def __init__(self, name: str, start: datetime, end: datetime):
        # you forgot the self. here
        self.name = name
        self.start = start
        self.end = end

    def _init_(self, name, duration, priority):
        self.name = name
        self.duration = duration
        self.priority = priority

    def duration(self):
        return self.end - self.start

    def to_dict(self):
        return {
            "name": self.name,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
        }

    def __repr__(self):
        return f"<Event {self.name!r} {self.start.isoformat()}–{self.end.isoformat()}>"
