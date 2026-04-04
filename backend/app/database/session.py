import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from dotenv import load_dotenv

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True, # Поставте True, щоб бачити SQL-запити в консолі
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session