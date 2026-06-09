# Usa uma imagem do Puppeteer oficial que já tem Chrome instalado
FROM ghcr.io/puppeteer/puppeteer:22.12.1

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código do bot
COPY . .

# Expõe a porta que o bot usa
EXPOSE 3000

# Comando para iniciar
CMD [ "node", "index.js" ]
