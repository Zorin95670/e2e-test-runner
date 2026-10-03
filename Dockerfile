FROM node:22-trixie-slim

# Playwright browsers to install, separated by spaces (chromium, chrome, msedge, firefox, webkit).
ARG PLAYWRIGHT_BROWSERS=chromium

ENV TZ=Europe/Paris
# Shared location so Playwright browsers are found whatever the user running the container.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Security updates, timezone and system libraries required by Cypress (https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        tzdata \
        libgtk2.0-0t64 \
        libgtk-3-0t64 \
        libgbm1 \
        libnotify4 \
        libnss3 \
        libxss1 \
        libasound2t64 \
        libxtst6 \
        xauth \
        xvfb && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*

# npm bundled with the Node image is outdated and brings vulnerabilities.
RUN npm install -g npm@12.2.0

WORKDIR /app/e2e

COPY package.json package-lock.json ./
# Development dependencies (lint, release) are not needed to run the tests.
RUN npm ci --omit=dev && \
    npx cypress verify && \
    npx playwright install --with-deps $PLAYWRIGHT_BROWSERS && \
    rm -rf /var/lib/apt/lists/*

COPY . .

CMD [ "npm", "run", "start" ]
