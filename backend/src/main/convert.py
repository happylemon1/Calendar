import os
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
from event import Event
from PreReg import PreReg
from schedule import schedule
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build, Resource

SCOPES = ['https://www.googleapis.com/auth/calendar.events']
creds = None
if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES
        )
        creds = flow.run_local_server(port=0)
    with open('token.json', 'w') as token:
        token.write(creds.to_json())

service = build('calendar', 'v3', credentials=creds)

class convert:
    def __init__(self, listOfStuff: list[tuple[Event,int, int]], service: Resource ):
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
            print('Event created: %s' % (event.get('htmlLink')))
