"""
AltRx · Database connection manager (asyncpg connection pool)
"""

import os
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv("../.env.local")

class Database:
    pool: asyncpg.Pool | None = None

    async def connect(self):
        dsn = os.getenv("DATABASE_URL")
        if not dsn:
            raise RuntimeError("DATABASE_URL environment variable not found.")
        self.pool = await asyncpg.create_pool(
            dsn,
            min_size=2,
            max_size=10,
            statement_cache_size=0,
            command_timeout=30,
            # Register JSON codec so JSONB comes back as dict
            init=_init_conn,
        )

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            self.pool = None


async def _init_conn(conn: asyncpg.Connection):
    """Per-connection initialisation: register custom codecs."""
    import json

    await conn.set_type_codec(
        "jsonb",
        encoder=json.dumps,
        decoder=json.loads,
        schema="pg_catalog",
        format="text",
    )
    await conn.set_type_codec(
        "json",
        encoder=json.dumps,
        decoder=json.loads,
        schema="pg_catalog",
        format="text",
    )


# Singleton instance imported everywhere
db = Database()