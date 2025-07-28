FROM cypress/base:latest
ENV TZ=Europe/Paris
RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone
WORKDIR /app/e2e
COPY . .
RUN npm ci
CMD [ "npm", "run", "start" ]