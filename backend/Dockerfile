# Use an official Python image as the base
FROM python:3.11

# Define build arguments
ARG OPENAI_API_KEY
ARG MONGODB_URI
ARG DATABASE_NAME

# Set environment variables
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV MONGODB_URI=$MONGODB_URI
ENV DATABASE_NAME=$DATABASE_NAME

# Set the working directory
WORKDIR /backend

# Copy only requirements first for efficient builds
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

RUN printenv

# Run the FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
