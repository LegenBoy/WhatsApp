const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const axios = require('axios'); // Adicionado para suas chamadas de API
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
        // Verifica se a mensagem contém "lacrado" (ignora maiúsculas/minúsculas)
        if (message.body && message.body.toLowerCase().includes('lacrado')) {
            console.log('Comando detectado:', message.body);
            
            try {
                // EX: axios.post('SUA_URL_AQUI', { status: 'LACRADO' }, { headers: { Authorization: 'Bearer SEU_TOKEN' } });
                
                console.log('API Zema atualizada!');
                await client.sendText(message.from, '✅ Sucesso: Status atualizado na Zema!');
            } catch (error) {
                console.error('Erro na API:', error);
                await client.sendText(message.from, '❌ Erro ao atualizar API.');
            }
        }
    });
})
.catch((error) => console.error('Erro no WPPConnect:', error));
