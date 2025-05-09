from event import Event
from PreReg import PreReg
from calendar_helper import Calendar
import heapq

class schedule:

    def _init_(self, pre_regs: list[PreReg] = None):
        self.cal = Calendar()
        self.schedule = [{} for _ in range(7)]
        self.eventList = []
        if pre_regs: 
            for pr in pre_regs: 
                added = self.cal.add_event(pr.to_event())
    
    def addEvent(self,event):
        heapq.heappush(self.eventList, event)
    
    def getNextEvent(self):
        if len(self.eventList) > 0:
            return heapq.heappop(self.eventList)
        else:
            return None

    def addPreRegEvents(self,preRegEvents):
        self.preRegEvents.append(preRegEvents)


    def create_schedule(self) -> list[tuple[Event, int, int]]:
        """
        Attempt to place all queued events into the weekly grid.
        Returns a list of tuples (event, day_index, start_slot).
        """
        placements = []
        # Process until queue is empty
        while self.event_list:
            event = self.get_next_event()
            placed = False
            # Try each day of week
            for day_idx, day_slots in enumerate(self.schedule):
                # Slot indices 0..95
                max_start = 96 - event.duration
                for start in range(0, max_start + 1):
                    # Check availability
                    if all(slot not in day_slots for slot in range(start, start + event.duration)):
                        # Place event
                        for slot in range(start, start + event.duration):
                            day_slots[slot] = event
                        placements.append((event, day_idx, start))
                        placed = True
                        break
                if placed:
                    break
            if not placed:
                # Event could not be placed in weekly grid
                placements.append((event, None, None))
        return placements

    def list_weekly(self) -> dict[int, dict[int, Event]]:
        """
        Return the internal weekly grid as a mapping from day index (0=Monday)
        to slot index to Event.
        """
        return {day: slots.copy() for day, slots in enumerate(self.schedule)}

    def __repr__(self):
        return f"<Schedule events_in_queue={len(self.event_list)} weekslots=7>"

    
    # def createSchedule(self):
    #     while len (self.eventList) > 0:  
    #         event = self.getNextEvent 

    #         for i in range (len(self.schedule)):
    #             dict = self.schedule[i]
    #             for j in range(96):
    #                 if j not in dict: 
    #                     for j in range( j + event.duration):
    #                         isAvailable = True
    #                         if j in dict:
    #                             isAvailable = False
    #                     if isAvailable:
    #                         for j in range (j + event.duration):
    #                             this_dict.

                                        
