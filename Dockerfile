# Build the entire app as a single docker image
FROM node:16-alpine

# Copy and build frontend first in /app/tmp
WORKDIR /app/tmp

COPY client/package.json ./
COPY client/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY client/public ./public
COPY client/src ./src

# Build the frontend
RUN yarn build

# Start working on the backend
FROM node:16-alpine
WORKDIR /app

# Copy the compiled frontend to its final destination and remove it
COPY --from=0 /app/tmp/build ./build

# Build the backend
COPY server/package.json ./
COPY server/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY server/src ./src

EXPOSE 8550

CMD [ "yarn", "start" ]
