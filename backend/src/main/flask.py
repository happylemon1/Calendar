from flask import Flask,request,jsonify
app = Flask('Event.py')
from calendar import Calendar
calendar = Calendar()
from event import Event
from scheduler import scheduler
from scheduler import generateSchedule


  
@app.route('/submitEvent', methods = ['GET'])
def getUserEvent():
        user_data = request.get_json()
        Event_Name = user_data.get('name')
        Event_Duration = user_data.get('duration')
        Event_Priority = user_data.get("priority")

        new_event = Event(Event_Name, Event_Duration, Event_Priority)

        added = calendar.add_event(new_event)
        if (added):
                return jsonify({"The event has been added to Calender"})
        else:
                return jsonify({ 'Event was added and we moved some things around'})
        
@app.route('/generateSchedule', methods = ['POST'])
def generateSchedule():
       
        return jsonify({"schedule:"})