from datetime import datetime
from event import Event

class Calendar:
    def __init__(self):
        # attach an instance‐level list
        self.events = []

    def add_event(self, event: Event) -> bool:
        """Add an Event if it doesn’t conflict; returns True on success."""
        if self._has_conflict(event):
            return False
        self.events.append(event)
        # keep events sorted by start time
        self.events.sort(key=lambda e: e.start)
        return True

    def _has_conflict(self, new_ev: Event) -> bool:
        """Return True if new_ev overlaps any existing event."""
        for ev in self.events:
            # if not (new_ev is entirely before or entirely after ev) → conflict
            if not (new_ev.end <= ev.start or new_ev.start >= ev.end):
                return True
        return False

    def list_events(self):
        return list(self.events)
    
    def _has_conflict(self, new_ev: Event) -> bool:
        """Checks for any overlap with existing events."""
        for ev in self.events:
            # no overlap iff new_ev ends <= ev.start or new_ev.start >= ev.end
            if not (new_ev.end <= ev.start or new_ev.start >= ev.end):
                return True
        return False

    def find_free_slots(self, window_start: datetime, window_end: datetime):
        """
        Given a time window, return a list of (start, end) gaps
        where no events live.
        """
        free = []
        cursor = window_start

        for ev in self.events:
            if ev.start > cursor:
                free.append((cursor, ev.start))
            cursor = max(cursor, ev.end)

        if cursor < window_end:
            free.append((cursor, window_end))

        return free