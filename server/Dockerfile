FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# multer writes here before each import; the dir must exist up front.
RUN mkdir -p uploads

EXPOSE 2000

CMD ["sh", "-c", "npm run seed && npm start"]
