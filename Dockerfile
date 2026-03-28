FROM python:3.14-slim
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PIP_DEFAULT_TIMEOUT=120
ENV POETRY_REQUESTS_TIMEOUT=120

WORKDIR /app
COPY . .

RUN pip install poetry

RUN poetry config installer.max-workers 10
RUN poetry install --no-interaction --no-ansi --without dev
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]