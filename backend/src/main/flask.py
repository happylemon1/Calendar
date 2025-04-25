from flask import Flask,request,jsonify
app = Flask('Event.py')
from event import Event
from schedule import schedule
schedule = schedule()
from schedule import generateSchedule


  
@app.route('/submitEvent', methods = ['GET'])
def getUserEvent():
        user_data = request.get_json()
        Event_Name = user_data.get('name')
        Event_Duration = user_data.get('duration')
        Event_Priority = user_data.get("priority")

        new_event = Event(Event_Name, Event_Duration, Event_Priority)

        schedule.addEvent(new_event)
        return jsonify({ 'This Event has been submitted'})
        
@app.route('/generateSchedule', methods = ['POST'])
def generateSchedule():
       
        return jsonify({"schedule:"})