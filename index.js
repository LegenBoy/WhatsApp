const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// O Render precisa de uma porta aberta para saber que o serviço está "vivo"
app.get('/', (req, res) => res.send('Bot esta rodando!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

wppconnect.create({ 
    session: 'session-logistica',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] } // Necessário para o Render
})
.then((client) => {
    client.onMessage((message) => {
        console.log('Mensagem recebida:', message.body);
        // Coloque sua lógica aqui
    });
})
.catch((error) => console.log(error));
