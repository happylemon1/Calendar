from flask import Flask,request,jsonify
app = Flask(__name__)
from event import Event
from schedule import schedule
user_schedule = schedule()
from quickstart import load_Events_Into
from convert import convert, service

  
@app.route('/submitEvent', methods = ['POST'])
def getUserEvent():
        user_data = request.get_json()
        Event_Name = user_data.get('name')
        Event_Duration = user_data.get('duration')
        Event_Priority = user_data.get("priority")

        new_event = Event(Event_Name, Event_Duration, Event_Priority)

        user_schedule.addEvent(new_event)
        return jsonify({ 'This Event has been submitted'})
        
@app.route('/generateSchedule', methods = ['GET'])
def generateSchedule():
        loadPreEvents()
        user_schedule.sleepAdding()
        user_schedule.preRegAdding()
        schedule_list: list = user_schedule.createSchedule()
        converter = convert(schedule_list, service)
        #Now that we have the schedule_dictionary we need to create a method to create events and post it from that
        #We should probably also consider adding something for sleep or something???
        return jsonify({"schedule:"})

@app.route('loadPreEvents', methods = ['GET'])
def loadPreEvents():
        load_Events_Into(user_schedule)
        return jsonify({"Your pre registered events have been accounted for"})
        