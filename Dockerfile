FROM node:22-trixie-slim

# Playwright browsers to install, separated by spaces (chromium, chrome, msedge, firefox, webkit).
ARG PLAYWRIGHT_BROWSERS=chromium

ENV TZ=Europe/Paris
# Shared location so Playwright browsers are found whatever the user running the container.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Timezone and system libraries required by Cypress (https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).
RUN apt-get update && \
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

WORKDIR /app/e2e

COPY package.json package-lock.json ./
RUN npm ci && \
    npx cypress verify && \
    npx playwright install --with-deps $PLAYWRIGHT_BROWSERS && \
    rm -rf /var/lib/apt/lists/*

COPY . .

CMD [ "npm", "run", "start" ]
