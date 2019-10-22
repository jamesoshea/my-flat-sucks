FROM circleci/node:12.12-browsers


COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "index"]