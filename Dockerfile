# Usa a imagem oficial do Puppeteer que já traz o Chrome instalado
FROM ghcr.io/puppeteer/puppeteer:22.12.1

# Define a pasta de trabalho
WORKDIR /usr/src/app

# Copia o package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia todo o resto do seu código
COPY . .

# Expõe a porta do servidor
EXPOSE 3000

# Inicia o seu bot
CMD [ "node", "index.js" ]
