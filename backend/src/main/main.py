from datetime import datetime
from event import Event
from calendar import Calendar

cal = Calendar()

e1 = Event("Write report", 
           start=datetime.fromisoformat("2025-04-20T09:00"), 
           end=datetime.fromisoformat("2025-04-20T10:30"))

if cal.add_event(e1):
    print("Added:", e1)
else:
    print("Conflict, couldn't add", e1)

print("All events:", cal.list_events())
print("Free between 8–12:", cal.find_free_slots(
    window_start=datetime(2025,4,20,8,0),
    window_end=datetime(2025,4,20,12,0)
))
