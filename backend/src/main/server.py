import os
from flask import Flask,request,jsonify, session, redirect, url_for
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
from event import Event
from schedule import schedule
user_schedule = schedule()
from quickstart import load_Events_Into
# from convert import convert, service
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials      import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery      import build
from convert import sched_to_calender
SCOPES = ['https://www.googleapis.com/auth/calendar.events']
CLIENT_SECRETS = 'credentials.json'
app.secret_key = os.urandom(24)

# allow the React dev server (localhost:5000) to share cookies
CORS(app,
     supports_credentials=True,
     resources={r"/*": {"origins": "http://localhost:5000"}})

# make sure the session cookie can be sent cross-site
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=False     # <-- dev only; remove in prod
)

@app.route('/status')
def status():
    svc = get_user_calendar_service()
    return jsonify({ 'logged_in': bool(svc) })

@app.route('/authorize')
def authorize():
        flow = Flow.from_client_secrets_file(
                'credentials.json', 
                scopes=SCOPES,
                # redirect_uri=url_for('oauth2callback', _external=True)
                redirect_uri = 'https://localhost:8000/oauth2callback'
        )
        auth_url, state = flow.authorization_url(
        access_type='offline', 
        include_granted_scopes='true'
        )
        session['oauth_state'] = state
        return redirect(auth_url)

@app.route('/oauth2callback')
def oauth2callback():
    state = session.pop('oauth_state', None)
    flow = Flow.from_client_secrets_file(
        'credentials.json', 
        scopes=SCOPES,
        state=state,
        # redirect_uri=url_for('oauth2callback', _external=True)
        redirect_uri = 'https://localhost:8000/oauth2callback'
    )
    flow.fetch_token(authorization_response=request.url)
    creds = flow.credentials
    session['credentials'] = {
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_uri': creds.token_uri,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }
    # return redirect(url_for('index'))
    return redirect('http://localhost:5000/')

def get_user_calendar_service():
    data = session.get('credentials')
    if not data:
        return None
    creds = Credentials(
        data['token'],
        refresh_token=data['refresh_token'],
        token_uri=data['token_uri'],
        client_id=data['client_id'],
        client_secret=data['client_secret'],
        scopes=data['scopes']
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        session['credentials']['token'] = creds.token
    return build('calendar','v3',credentials=creds)

  
@app.route('/submitEvent', methods = ['POST'])
def getUserEvent():
        user_data = request.get_json()
        Event_Name = user_data.get('name')
        Event_Duration = user_data.get('duration')
        Event_Priority = user_data.get("priority")

        new_event = Event(Event_Name, Event_Duration, Event_Priority)

        user_schedule.addEvent(new_event)
        return jsonify({ 'message': 'This Event has been submitted'}), 200
        
@app.route('/generateSchedule', methods = ['GET'])
def generateSchedule():
        service = get_user_calendar_service()
        if not service:
            return redirect(url_for('authorize'))
        load_Events_Into(user_schedule,service)
        user_schedule.sleepAdding()
        user_schedule.preRegEventsAdding()
        schedule_list = user_schedule.createSchedule()
        sched_to_calender(schedule_list,service)
        return jsonify({'status: schedule has been imported'})

@app.route('/loadPreEvents', methods = ['GET'])
def loadPreEvents():
        load_Events_Into(user_schedule)
        return jsonify({"Your pre registered events have been accounted for"})

if __name__ == '__main__':
    # listen on all interfaces, port 8000, with live-reload turned on
    app.config['SERVER_NAME'] = 'localhost:8000'
    app.run(host='0.0.0.0', port=8000, debug=True, ssl_context='adhoc')