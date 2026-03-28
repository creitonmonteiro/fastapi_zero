import asyncio
import sys

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from task_manager.routers import auth, todos, users

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI()

Instrumentator().instrument(app).expose(app, include_in_schema=False)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(todos.router)
