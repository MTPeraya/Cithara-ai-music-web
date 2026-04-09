FROM python:3.11-slim

WORKDIR /app

# Ensure python output is sent straight to terminal
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run migrations automatically then start server
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000
