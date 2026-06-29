"""
AltRx · Database connection manager (asyncpg connection pool)
"""

import os
import asyncpg


class Database:
    pool: asyncpg.Pool | None = None

    async def connect(self):
        dsn = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:Hitesh%4069@localhost:5432/altrx_db",
        )
        self.pool = await asyncpg.create_pool(
            dsn,
            min_size=2,
            max_size=10,
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
