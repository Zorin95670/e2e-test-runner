FROM cypress/base:latest
WORKDIR /app/e2e
COPY . .
RUN npm ci
CMD [ "npm", "run", "start" ]