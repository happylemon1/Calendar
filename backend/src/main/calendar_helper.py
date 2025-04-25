from datetime import datetime
from event import Event

class CalendarHelper:
    """
    A per-day hash-table calendar with fixed-time buckets.
    Uses datetime slots of SLOT_MINUTES for conflict checking.
    """
    SLOT_MINUTES = 15

    def __init__(self):
        # date -> {slot_start_datetime: Event}
        self._days: dict[datetime.date, dict[datetime, Event]] = defaultdict(dict)
        self._slot_delta = timedelta(minutes=self.SLOT_MINUTES)

    def _generate_slots(self, start: datetime, end: datetime):
        """Yield each slot start between start (inclusive) and end (exclusive)."""
        cur = start
        while cur < end:
            yield cur
            cur += self._slot_delta

    def can_place(self, start: datetime, end: datetime) -> bool:
        """Return True if no conflict between start and end on that day."""
        day_slots = self._days[start.date()]
        for slot in self._generate_slots(start, end):
            if slot in day_slots:
                return False
        return True

    def add_event(self, event: Event) -> bool:
        """Place event into slots if no conflict. Return True on success."""
        slots = list(self._generate_slots(event.start, event.end))
        day_slots = self._days[event.start.date()]
        # conflict check
        if any(slot in day_slots for slot in slots):
            return False
        # occupy slots
        for slot in slots:
            day_slots[slot] = event
        return True

    def list_events(self) -> list[Event]:
        """Return all scheduled events, sorted by start time."""
        seen, out = set(), []
        for day_slots in self._days.values():
            for ev in day_slots.values():
                if ev not in seen:
                    seen.add(ev)
                    out.append(ev)
        return sorted(out, key=lambda e: e.start)