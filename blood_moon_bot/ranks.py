"""
Blood Moon — Пирамида Нечисти (ранги 0–9).
Подключение: from ranks import get_user_rank, RANKS
"""

from __future__ import annotations
from typing import Any, Dict, Optional

# totalCards = сумма «карт» (вкладов), приведённых к E или твой score
RANKS = [
    {"level": 0, "name": "Смертный", "min_cards": 0, "aura": "#808080", "special": None},
    {"level": 1, "name": "Блуждающий Дух Крови", "min_cards": 50, "aura": "#ff9999", "special": None},
    {"level": 2, "name": "Злобный Упырь", "min_cards": 150, "aura": "#ffa500", "special": None},
    {"level": 3, "name": "Полувампир", "min_cards": 300, "aura": "#ffff00", "special": None},
    {"level": 4, "name": "Истинный Вампир", "min_cards": 500, "aura": "#00ff00", "special": None},
    {"level": 5, "name": "Офицер Тьмы", "min_cards": 800, "aura": "#00ffff", "special": None},
    {"level": 6, "name": "Генерал Ночи", "min_cards": 1500, "aura": "#0000ff", "special": None},
    {"level": 7, "name": "Святой Прародитель", "min_cards": 3500, "aura": "#8a2be2", "special": None},
    {"level": 8, "name": "Король Кровавой Луны", "min_cards": 5000, "aura": None, "special": "glass"},
    {"level": 9, "name": "Император Тьмы", "min_cards": 7000, "aura": None, "special": "glitch"},
]


def get_user_rank(total_cards: int) -> Dict[str, Any]:
    """
    Возвращает текущий ранг + прогресс до следующего.
    {
      level, name, aura, special,
      min_cards, next_min, progress_pct, cards_to_next, is_max
    }
    """
    total = max(0, int(total_cards or 0))
    current = RANKS[0]
    for r in RANKS:
        if total >= r["min_cards"]:
            current = r
        else:
            break

    level = current["level"]
    is_max = level >= 9
    if is_max:
        return {
            **current,
            "total_cards": total,
            "next_min": None,
            "progress_pct": 100.0,
            "cards_to_next": 0,
            "is_max": True,
        }

    nxt = RANKS[level + 1]
    span = nxt["min_cards"] - current["min_cards"]
    done = total - current["min_cards"]
    pct = 0.0 if span <= 0 else min(100.0, max(0.0, (done / span) * 100.0))
    return {
        **current,
        "total_cards": total,
        "next_min": nxt["min_cards"],
        "next_name": nxt["name"],
        "progress_pct": round(pct, 1),
        "cards_to_next": max(0, nxt["min_cards"] - total),
        "is_max": False,
    }


def rank_title_for_score(total_cards: int) -> str:
    return get_user_rank(total_cards)["name"]
