"""Tests for the maintenance scheduling engine."""

from datetime import date

from custom_components.property_manager.models import Asset, Schedule
from custom_components.property_manager.schedule_engine import (
    compute_next_due,
    get_due_soon_assets,
    get_overdue_assets,
    is_in_season,
    parse_frequency,
)


class TestParseFrequency:
    def test_days(self):
        delta = parse_frequency("14d")
        assert delta is not None
        assert delta.days == 14

    def test_weeks(self):
        delta = parse_frequency("2w")
        assert delta is not None
        assert delta.days == 14

    def test_months(self):
        delta = parse_frequency("3m")
        assert delta is not None
        assert delta.days == 90

    def test_yearly(self):
        delta = parse_frequency("yearly")
        assert delta is not None
        assert delta.days == 365

    def test_weekly(self):
        delta = parse_frequency("weekly")
        assert delta is not None
        assert delta.days == 7

    def test_invalid(self):
        assert parse_frequency("invalid") is None
        assert parse_frequency("") is None


class TestIsInSeason:
    def test_no_season(self):
        s = Schedule(season=None)
        assert is_in_season(s) is True

    def test_in_season(self):
        s = Schedule(season={"start_month": 4, "end_month": 10})
        assert is_in_season(s, date(2026, 6, 15)) is True

    def test_out_of_season(self):
        s = Schedule(season={"start_month": 4, "end_month": 10})
        assert is_in_season(s, date(2026, 1, 15)) is False

    def test_wrap_around(self):
        s = Schedule(season={"start_month": 11, "end_month": 2})
        assert is_in_season(s, date(2026, 12, 1)) is True
        assert is_in_season(s, date(2026, 1, 15)) is True
        assert is_in_season(s, date(2026, 6, 15)) is False


class TestComputeNextDue:
    def test_basic(self):
        s = Schedule(frequency="14d")
        result = compute_next_due(s, date(2026, 5, 1))
        assert result == "2026-05-15"

    def test_seasonal_skip(self):
        s = Schedule(
            frequency="30d",
            season={"start_month": 4, "end_month": 10},
        )
        # From September 15 + 30 days = October 15, which is in season
        result = compute_next_due(s, date(2026, 9, 15))
        assert result == "2026-10-15"


class TestOverdueAssets:
    def test_finds_overdue(self):
        asset = Asset(
            name="Test",
            schedules=[
                Schedule(
                    frequency="14d",
                    next_due="2026-05-01",
                    season={"start_month": 1, "end_month": 12},
                )
            ],
        )
        overdue = get_overdue_assets([asset], date(2026, 5, 10))
        assert len(overdue) == 1

    def test_not_overdue(self):
        asset = Asset(
            name="Test",
            schedules=[Schedule(frequency="14d", next_due="2026-05-20")],
        )
        overdue = get_overdue_assets([asset], date(2026, 5, 10))
        assert len(overdue) == 0


class TestDueSoonAssets:
    def test_finds_due_soon(self):
        asset = Asset(
            name="Test",
            schedules=[
                Schedule(
                    frequency="14d",
                    next_due="2026-05-15",
                    season={"start_month": 1, "end_month": 12},
                )
            ],
        )
        due = get_due_soon_assets([asset], days_ahead=7, check_date=date(2026, 5, 10))
        assert len(due) == 1

    def test_not_due_soon(self):
        asset = Asset(
            name="Test",
            schedules=[Schedule(frequency="14d", next_due="2026-06-01")],
        )
        due = get_due_soon_assets([asset], days_ahead=7, check_date=date(2026, 5, 10))
        assert len(due) == 0
