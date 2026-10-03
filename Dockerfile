FROM cypress/base:latest

# Playwright browsers to install, separated by spaces (chromium, chrome, msedge, firefox, webkit).
ARG PLAYWRIGHT_BROWSERS=chromium

ENV TZ=Europe/Paris
# Shared location so Playwright browsers are found whatever the user running the container.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /app/e2e

COPY package.json package-lock.json ./
RUN npm ci && \
    npx playwright install --with-deps $PLAYWRIGHT_BROWSERS && \
    rm -rf /var/lib/apt/lists/*

COPY . .

CMD [ "npm", "run", "start" ]
