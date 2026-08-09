# ====================== database.py ======================
# Blood Moon — SQLite database

import aiosqlite
from datetime import datetime, timedelta
from config import DATABASE_PATH


async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                nickname TEXT,
                joined_at TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS contributions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                rank TEXT,
                amount INTEGER,
                target TEXT,
                created_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                nickname TEXT,
                rank TEXT,
                amount INTEGER,
                period TEXT,
                created_at TEXT
            )
        """)
        await db.commit()


async def register_user(user_id: int, username: str | None, first_name: str | None):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            INSERT OR IGNORE INTO users (user_id, username, first_name, nickname, joined_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, username, first_name, first_name or username or str(user_id), datetime.utcnow().isoformat()))
        await db.commit()


async def add_contribution(user_id: int, rank: str, amount: int, target: str = "warehouse"):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            INSERT INTO contributions (user_id, rank, amount, target, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, rank.upper(), amount, target, datetime.utcnow().isoformat()))
        await db.commit()


async def get_top_contributions(period: str = "week", limit: int = 10):
    now = datetime.utcnow()
    if period == "hour":
        since = now - timedelta(hours=1)
    elif period == "day":
        since = now - timedelta(days=1)
    elif period == "week":
        since = now - timedelta(weeks=1)
    elif period == "month":
        since = now - timedelta(days=30)
    else:
        since = datetime(2020, 1, 1)

    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT u.nickname, c.rank, SUM(c.amount) as total
            FROM contributions c
            JOIN users u ON u.user_id = c.user_id
            WHERE c.created_at >= ?
            GROUP BY c.user_id, c.rank
            ORDER BY total DESC
            LIMIT ?
        """, (since.isoformat(), limit))
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
