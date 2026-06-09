const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot de Logistica Zema Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

wppconnect.create({ 
    session: 'logistica-zema',
    autoClose: false,
    puppeteerOptions: {
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
})
.then((client) => {
    console.log('Bot conectado com sucesso!');
    
    client.onMessage(async (message) => {
        console.log('--- DEBUG DE MENSAGEM ---');
        console.log('Conteúdo:', message.body);
        console.log('Chat ID (Grupo):', message.chatId);
        console.log('Sender ID (Quem enviou):', message.sender.id);
        console.log('-------------------------');
    });
})
.catch((error) => {
    console.error('Erro fatal ao iniciar WPPConnect:', error);
    process.exit(1);
});
