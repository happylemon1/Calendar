from datetime import datetime
from event import Event as e
from schedule import schedule as sc


def main():
    event1 = e("Running", 4, 1)
    event2 = e("Studying", 8, 3)
    event3 = e("Football", 1, 2)
    schedule = sc()
    schedule.addEvent(event1)
    schedule.addEvent(event2)
    schedule.addEvent(event3)
    

    placements = schedule.createSchedule()

    dict = schedule.list_weekly()
    print(dict)

if __name__ == "__main__":
    main()




