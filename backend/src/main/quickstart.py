import datetime
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from event import Event
from datetime import datetime
from PreReg import PreReg
# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar"]


def load_Events_Into(sched):
  """Shows basic usage of the Google Calendar API.
  Prints the start and name of the next 10 events on the user's calendar.
  """
  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
      flow = InstalledAppFlow.from_client_secrets_file(
          "credentials.json", SCOPES
      )
      creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())

  try:
    service = build("calendar", "v3", credentials=creds)

    # Call the Calendar API
    now = datetime.datetime.now(tz=datetime.timezone.utc)
    sevenDays = datetime.timedelta(days =7)
    now_iso = now.isoformat() + 'Z'
    sevenDays_iso = sevenDays.isoformat() + 'Z'

    print("Getting the upcoming 10 events")
    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=now_iso,
            timeMax=sevenDays_iso,  # <-- get events *up to* 7 days later
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    events = events_result.get("items", [])

    if not events:
      print("No upcoming events found.")
      return

    # Prints the start and name of the next 10 events
    for event in events:
      start = event["start"].get("dateTime", event["start"].get("date"))
      print(start, event.get("summary", "No Title"))

    # let's create a new PreReg event constructor for pre registered events regardless ngl.
      #This will help us when we use the greedy. Just add until the list of these Events are done
      start_str = event["start"].get("dateTime", event["start"].get("date"))
      end_str = event["end"].get("dateTime", event["end"].get("date"))
      #This is all just converting into a integer format for us.
      #It's chatted tho so idk how accurate this is, we can just debug using print statements
      start_dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
      end_dt = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
      weekday_index = start_dt.weekday()

      start_hour = 4 * (start_dt.hour + start_dt.minute / 60)
      end_hour = 4 * (end_dt.hour + end_dt.minute / 60)
      summary = event.get("summary","no title")

      new_PreReg = PreReg(summary, start_hour, end_hour, weekday_index)

      sched.addPreRegEvents(new_PreReg)

  except HttpError as error:
    print(f"An error occurred: {error}")

