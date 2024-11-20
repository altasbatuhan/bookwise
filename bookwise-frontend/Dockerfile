FROM node:18-slim AS build

WORKDIR /app


COPY package*.json ./
RUN npm install --omit=dev



COPY . .


RUN npm run build


FROM node:18-slim

WORKDIR /app


COPY --from=build /app/build /app/build


RUN npm install -g serve


CMD ["serve", "-s", "build", "-l", "80"]

EXPOSE 80
