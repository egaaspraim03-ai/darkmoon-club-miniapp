"""
Blood Moon — серверная рулетка (CS:GO-style).
НИКОГДА не доверяй фронту: только spin_roulette() выдаёт приз.
"""

from __future__ import annotations
import random
import secrets
from typing import Any, Dict, List

RARITY_WEIGHTS = {
    "common": 70,
    "rare": 25,
    "epic": 4,
    "legend": 1,
}

PRIZES: List[Dict[str, Any]] = [
    {"id": "e10", "name": "10 E", "ico": "🃏", "rarity": "common", "weight": 40},
    {"id": "e50", "name": "50 E", "ico": "🃏", "rarity": "common", "weight": 30},
    {"id": "e100", "name": "100 E", "ico": "🃏", "rarity": "common", "weight": 20},
    {"id": "d1", "name": "1 D", "ico": "💎", "rarity": "rare", "weight": 40},
    {"id": "c1", "name": "1 C", "ico": "💜", "rarity": "rare", "weight": 35},
    {"id": "b1", "name": "1 B", "ico": "🔵", "rarity": "rare", "weight": 25},
    {"id": "soap", "name": "Святое мыло", "ico": "🧼", "rarity": "epic", "weight": 50},
    {"id": "title_night", "name": "Титул ночи", "ico": "🌙", "rarity": "epic", "weight": 50},
    {"id": "obana_chip", "name": "Шанс Обаны", "ico": "😱", "rarity": "legend", "weight": 60},
    {"id": "blood_x3", "name": "Кровь ×3", "ico": "🩸", "rarity": "legend", "weight": 40},
]


def _pick_rarity() -> str:
    r = random.uniform(0, 100)
    acc = 0.0
    for rarity, w in RARITY_WEIGHTS.items():
        acc += w
        if r <= acc:
            return rarity
    return "common"


def _pick_prize_in_rarity(rarity: str) -> Dict[str, Any]:
    pool = [p for p in PRIZES if p["rarity"] == rarity]
    if not pool:
        pool = [p for p in PRIZES if p["rarity"] == "common"]
    total = sum(p["weight"] for p in pool)
    r = random.uniform(0, total)
    acc = 0.0
    for p in pool:
        acc += p["weight"]
        if r <= acc:
            return p
    return pool[-1]


def spin_roulette(strip_length: int = 56, win_zone_start: int = 40) -> Dict[str, Any]:
    """
    Серверный спин.
    prize_id, prize, rarity, strip_index, spin_id, strip_length
    """
    rarity = _pick_rarity()
    prize = _pick_prize_in_rarity(rarity)
    lo = max(0, min(win_zone_start, strip_length - 5))
    hi = strip_length - 2
    strip_index = random.randint(lo, hi)
    return {
        "spin_id": secrets.token_hex(8),
        "prize_id": prize["id"],
        "prize": prize,
        "rarity": prize["rarity"],
        "strip_index": strip_index,
        "strip_length": strip_length,
    }
