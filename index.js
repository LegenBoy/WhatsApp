const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Zema Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

wppconnect.create({ 
    session: 'logistica-zema',
    autoClose: false,
    puppeteerOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
})
.then((client) => {
    console.log('Bot conectado!');
    
    client.onMessage(async (message) => {
        // IDs que você pegou no DEBUG anterior
        const ID_GRUPO = '123456789@g.us'; // COLOQUE O ID REAL DO SEU LOG
        const MEU_NUMERO = '553499999999@c.us'; // COLOQUE O SEU ID REAL DO LOG

        if (message.chatId === ID_GRUPO && message.sender.id === MEU_NUMERO && message.body && message.body.toLowerCase().includes('lacrado')) {
            console.log('✅ Comando identificado:', message.body);
            try {
                // await axios.post('SUA_URL', { status: 'LACRADO' }, { headers: { Authorization: 'Bearer ...' } });
                await client.sendText(message.from, '✅ Sucesso: Baú atualizado na Zema!');
            } catch (err) {
                await client.sendText(message.from, '❌ Erro na integração.');
            }
        }
    });
})
.catch((err) => { console.error('Erro:', err); process.exit(1); });
