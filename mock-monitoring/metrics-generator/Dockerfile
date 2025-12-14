FROM python:3.11-slim

WORKDIR /app

COPY metrics_generator.py .

EXPOSE 8000

CMD ["python", "-u", "metrics_generator.py"]
