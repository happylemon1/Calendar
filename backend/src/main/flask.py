from flask import Flask,request,jsonify
app = Flask('Event.py')
from calendar import Calendar
calendar = Calendar()
from event import Event
from scheduler import scheduler

  
@app.route('/submitEvent', methods = ['GET'])
def getUserEvent():
        user_data = request.get_json()
        PreReg = user_data.get('PreRegistered')
        Event_Name = user_data.get('Name')
        Event_Duration = user_data.get('Duration')
        Event_Priority = user_data.get("Priority")
        Event_Start = user_data.get('Start')
        Event_End = user_data.get('End')

        if (PreReg):
                new_event = Event(Event_Name,Event_Start,Event_End)
        else:
                new_event = Event(Event_Name, Event_Duration, Event_Priority)


        
        added = calendar.add_event(new_event)
        if (added):
                return jsonify({"The event has been added to Calender"})
        else:
                return jsonify({ 'Event was added and we moved some things around'})
        
@app.route('/generateSchedule', methods = ['POST'])
def generateSchedule():
       
        return jsonify({"schedule:"})