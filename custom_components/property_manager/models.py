"""Data models for the Property Manager integration."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from .const import (
    CATEGORY_CUSTOM,
    GEOMETRY_POINT,
    STATUS_ACTIVE,
)


def _generate_id(prefix: str = "asset") -> str:
    """Generate a unique ID."""
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _now_iso() -> str:
    """Return current UTC time as ISO string."""
    return datetime.now(UTC).isoformat()


@dataclass
class Geometry:
    """GeoJSON-style geometry."""

    type: str = GEOMETRY_POINT
    coordinates: list[Any] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"type": self.type, "coordinates": self.coordinates}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Geometry:
        return cls(type=data.get("type", GEOMETRY_POINT), coordinates=data.get("coordinates", []))


@dataclass
class Calibration:
    """Two-point scale calibration."""

    point_a: list[float] = field(default_factory=list)
    point_b: list[float] = field(default_factory=list)
    distance_meters: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "point_a": self.point_a,
            "point_b": self.point_b,
            "distance_meters": self.distance_meters,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Calibration:
        return cls(
            point_a=data.get("point_a", []),
            point_b=data.get("point_b", []),
            distance_meters=data.get("distance_meters", 0.0),
        )


@dataclass
class Schedule:
    """Maintenance schedule for an asset."""

    id: str = field(default_factory=lambda: _generate_id("sched"))
    action: str = ""
    frequency: str = ""
    season: dict[str, int] | None = None
    next_due: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "action": self.action,
            "frequency": self.frequency,
            "season": self.season,
            "next_due": self.next_due,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Schedule:
        return cls(
            id=data.get("id", _generate_id("sched")),
            action=data.get("action", ""),
            frequency=data.get("frequency", ""),
            season=data.get("season"),
            next_due=data.get("next_due", ""),
        )


@dataclass
class MaintenanceLogEntry:
    """A single maintenance log entry."""

    date: str = ""
    action: str = ""
    notes: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {"date": self.date, "action": self.action, "notes": self.notes}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MaintenanceLogEntry:
        return cls(
            date=data.get("date", ""),
            action=data.get("action", ""),
            notes=data.get("notes", ""),
        )


@dataclass
class Photo:
    """A photo attached to an asset."""

    path: str = ""
    taken: str = ""
    caption: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {"path": self.path, "taken": self.taken, "caption": self.caption}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Photo:
        return cls(
            path=data.get("path", ""),
            taken=data.get("taken", ""),
            caption=data.get("caption", ""),
        )


@dataclass
class Asset:
    """A trackable item on the property map."""

    id: str = field(default_factory=lambda: _generate_id("asset"))
    name: str = ""
    type: str = ""
    category: str = CATEGORY_CUSTOM
    geometry: Geometry = field(default_factory=Geometry)
    status: str = STATUS_ACTIVE
    metadata: dict[str, Any] = field(default_factory=dict)
    linked_entities: list[str] = field(default_factory=list)
    photos: list[Photo] = field(default_factory=list)
    schedules: list[Schedule] = field(default_factory=list)
    maintenance_log: list[MaintenanceLogEntry] = field(default_factory=list)
    created: str = field(default_factory=_now_iso)
    updated: str = field(default_factory=_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "category": self.category,
            "geometry": self.geometry.to_dict(),
            "status": self.status,
            "metadata": self.metadata,
            "linked_entities": self.linked_entities,
            "photos": [p.to_dict() for p in self.photos],
            "schedules": [s.to_dict() for s in self.schedules],
            "maintenance_log": [m.to_dict() for m in self.maintenance_log],
            "created": self.created,
            "updated": self.updated,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Asset:
        return cls(
            id=data.get("id", _generate_id("asset")),
            name=data.get("name", ""),
            type=data.get("type", ""),
            category=data.get("category", CATEGORY_CUSTOM),
            geometry=Geometry.from_dict(data.get("geometry", {})),
            status=data.get("status", STATUS_ACTIVE),
            metadata=data.get("metadata", {}),
            linked_entities=data.get("linked_entities", []),
            photos=[Photo.from_dict(p) for p in data.get("photos", [])],
            schedules=[Schedule.from_dict(s) for s in data.get("schedules", [])],
            maintenance_log=[
                MaintenanceLogEntry.from_dict(m)
                for m in data.get("maintenance_log", [])
            ],
            created=data.get("created", _now_iso()),
            updated=data.get("updated", _now_iso()),
        )


@dataclass
class Zone:
    """A spatial zone on the property."""

    id: str = field(default_factory=lambda: _generate_id("zone"))
    name: str = ""
    category: str = CATEGORY_CUSTOM
    geometry: Geometry = field(default_factory=lambda: Geometry(type="Polygon"))
    color: str = "#9E9E9E"
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "geometry": self.geometry.to_dict(),
            "color": self.color,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Zone:
        return cls(
            id=data.get("id", _generate_id("zone")),
            name=data.get("name", ""),
            category=data.get("category", CATEGORY_CUSTOM),
            geometry=Geometry.from_dict(data.get("geometry", {})),
            color=data.get("color", "#9E9E9E"),
            metadata=data.get("metadata", {}),
        )


@dataclass
class Property:
    """The top-level property definition."""

    name: str = "Home"
    boundary: list[list[float]] = field(default_factory=list)
    calibration: Calibration = field(default_factory=Calibration)
    address: str = ""
    timezone: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "boundary": self.boundary,
            "calibration": self.calibration.to_dict(),
            "address": self.address,
            "timezone": self.timezone,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Property:
        return cls(
            name=data.get("name", "Home"),
            boundary=data.get("boundary", []),
            calibration=Calibration.from_dict(data.get("calibration", {})),
            address=data.get("address", ""),
            timezone=data.get("timezone", ""),
        )


@dataclass
class PropertyStore:
    """Root data structure for the entire property store."""

    version: int = 1
    property: Property = field(default_factory=Property)
    assets: list[Asset] = field(default_factory=list)
    zones: list[Zone] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "version": self.version,
            "property": self.property.to_dict(),
            "assets": [a.to_dict() for a in self.assets],
            "zones": [z.to_dict() for z in self.zones],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> PropertyStore:
        return cls(
            version=data.get("version", 1),
            property=Property.from_dict(data.get("property", {})),
            assets=[Asset.from_dict(a) for a in data.get("assets", [])],
            zones=[Zone.from_dict(z) for z in data.get("zones", [])],
        )
