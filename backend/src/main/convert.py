from event import Event
from PreReg import PreReg
from schedule import schedule
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
from googleapiclient.discovery import build 

class convert:
    def __init__(self, listOfStuff: list[tuple[Event,int, int]] ):
        while len(listOfStuff) > 0:
            event_tuple = listOfStuff.pop(0)
            event, day_index, slot_index = event_tuple

            name = event.name
            duration = event.duration

            tz = ZoneInfo("America/Los_Angeles")
            slot_len = 15

            current_date = datetime.now(tz).date()
            event_date = current_date + timedelta(days=day_index)

            minutes_after_midnight = slot_index * slot_len
            event_time = (datetime.combine(date.min, time()) + 
                          timedelta(minutes=minutes_after_midnight)).time()
            start_dt = datetime.combine(event_date, event_time, tzinfo=tz)
            end_dt = start_dt + timedelta(minutes=duration*15)

            event = {
                'summary': name,
                'start': {
                    'dateTime': start_dt,
                    'timeZone': 'America/Los_Angeles',
                },
                'end': {
                    'dateTime': end_dt,
                    'timeZone': 'America/Los_Angeles',
                },
            },


            event = service.events().insert(calendarId='primary', body=event).execute()
            print 'Event created: %s' % (event.get('htmlLink'))
