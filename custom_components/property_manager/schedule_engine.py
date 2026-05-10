"""Maintenance scheduling engine for Property Manager."""

from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any

from .models import Asset, Schedule


def parse_frequency(freq: str) -> timedelta | None:
    """Parse a frequency string like '14d', '3m', 'yearly' into a timedelta."""
    if freq == "yearly":
        return timedelta(days=365)
    if freq == "monthly":
        return timedelta(days=30)
    if freq == "weekly":
        return timedelta(days=7)

    match = re.match(r"^(\d+)(d|w|m)$", freq)
    if not match:
        return None

    value = int(match.group(1))
    unit = match.group(2)
    if unit == "d":
        return timedelta(days=value)
    if unit == "w":
        return timedelta(weeks=value)
    if unit == "m":
        return timedelta(days=value * 30)
    return None


def is_in_season(schedule: Schedule, check_date: date | None = None) -> bool:
    """Check if a schedule is currently in its active season."""
    if schedule.season is None:
        return True

    d = check_date or date.today()
    start = schedule.season.get("start_month", 1)
    end = schedule.season.get("end_month", 12)

    if start <= end:
        return start <= d.month <= end
    # Wraps around year (e.g., Nov-Feb)
    return d.month >= start or d.month <= end


def compute_next_due(schedule: Schedule, from_date: date | None = None) -> str:
    """Compute the next due date for a schedule after marking it done."""
    d = from_date or date.today()
    delta = parse_frequency(schedule.frequency)
    if delta is None:
        return ""

    next_date = d + delta

    # If seasonal, skip forward until we're in-season
    if schedule.season:
        attempts = 0
        while not is_in_season(schedule, next_date) and attempts < 365:
            next_date += timedelta(days=1)
            attempts += 1

    return next_date.isoformat()


def get_overdue_assets(assets: list[Asset], check_date: date | None = None) -> list[Asset]:
    """Return assets that have at least one overdue schedule."""
    d = check_date or date.today()
    overdue = []
    for asset in assets:
        for sched in asset.schedules:
            if sched.next_due and sched.next_due < d.isoformat():
                if is_in_season(sched, d):
                    overdue.append(asset)
                    break
    return overdue


def get_due_soon_assets(
    assets: list[Asset], days_ahead: int = 7, check_date: date | None = None
) -> list[Asset]:
    """Return assets with schedules due within the given number of days."""
    d = check_date or date.today()
    cutoff = (d + timedelta(days=days_ahead)).isoformat()
    due_soon = []
    for asset in assets:
        for sched in asset.schedules:
            if sched.next_due and d.isoformat() <= sched.next_due <= cutoff:
                if is_in_season(sched, d):
                    due_soon.append(asset)
                    break
    return due_soon
