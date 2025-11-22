# Step 1: Use a lightweight Python base image
FROM python:3.9-slim

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy requirements file and install dependencies
# Using Docker cache: if only app code changes, this step is reused
COPY requirements /app/requirements
RUN pip install --no-cache-dir -r requirements

# Step 4: Copy the rest of your application code
COPY . .

# Step 5: Expose the port your app runs on (matches app.py)
EXPOSE 5001

# Step 6: Environment variables (optional defaults)
ENV PORT=5001
ENV REDIS_HOST=redis-server

# Step 7: Run the app
# Option A: Simple Eventlet server (fine for coursework demo)
CMD ["python", "-u", "app.py"]

# Option B: Gunicorn with Eventlet workers (recommended for production)
# Uncomment this line instead of the CMD above if you want Gunicorn:
# CMD ["gunicorn", "-k", "eventlet", "-w", "1", "-b", "0.0.0.0:5001", "app:app"]