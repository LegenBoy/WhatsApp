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
        // Ignora mensagens de grupos se não desejar ou mensagens do próprio bot
        if (message.isGroupMsg && message.body && message.body.toLowerCase().includes('lacrado')) {
            console.log('Comando detectado:', message.body);
            
            try {
                // Substitua com os dados reais da Zema
                await axios.post('SUA_URL_API_ZEMA', { 
                    status: 'LACRADO',
                    mensagem_original: message.body 
                }, { 
                    headers: { 'Authorization': 'Bearer SEU_TOKEN' } 
                });
                
                console.log('API Zema atualizada!');
                await client.sendText(message.from, '✅ Sucesso: Status atualizado na Zema!');
            } catch (error) {
                console.error('Erro na API Zema:', error.message);
                await client.sendText(message.from, '❌ Erro ao atualizar API.');
            }
        }
    });
})
.catch((error) => {
    console.error('Erro fatal ao iniciar WPPConnect:', error);
    process.exit(1); // Força o Render a reiniciar o bot se ele não abrir o navegador
});
