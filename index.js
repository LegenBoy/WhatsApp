const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');

// Configuração obrigatória para o Render manter o bot online
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Logistica Zema Online!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

// Configuração do WhatsApp
wppconnect.create({ 
    session: 'logistica-zema',
    autoClose: false,
    authTimeout: 0, // <--- ADICIONE ESTA LINHA (0 significa tempo infinito)
    deviceName: 'Bot Logistica Zema',
    puppeteerOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
})
.then((client) => {
    console.log('Bot conectado e ouvindo!');
    
    // Barreira contra o "Loop" de eventos do sistema
    client.onMessage(async (message) => {
        if (!message || message.from === 'status@broadcast' || message.isStatus || message.type !== 'chat') {
            return; 
        }

        console.log('--- MENSAGEM DE TEXTO RECEBIDA ---');
        console.log('De:', message.from);
        console.log('Texto:', message.body);
        
        if (message.body && message.body.toLowerCase().includes('lacrado')) {
            console.log('✅ PALAVRA CHAVE ENCONTRADA!');
            
            try {
                await client.sendText(message.from, 'Processando seu lacrado...');
            } catch (err) {
                console.error('Erro ao enviar resposta:', err);
            }
        }
    });
})
.catch((err) => console.error('Erro fatal:', err));
