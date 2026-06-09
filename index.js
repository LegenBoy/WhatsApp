const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect.create({ 
    session: 'logistica-zema',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
})
.then((client) => {
    console.log('Bot conectado e ouvindo!');
    
    // Usamos client.onAnyMessage para pegar TUDO e ver o que está travando
    client.onAnyMessage(async (message) => {
        // Ignora mensagens de status e mensagens nulas
        if (!message || message.from === 'status@broadcast') return;

        console.log('--- MENSAGEM RECEBIDA ---');
        console.log('Tipo:', message.type);
        console.log('Texto:', message.body);
        
        // Verifica se é texto e contém "lacrado"
        if (message.type === 'chat' && message.body && message.body.toLowerCase().includes('lacrado')) {
            console.log('✅ PALAVRA CHAVE ENCONTRADA!');
            await client.sendText(message.from, 'Processando seu lacrado...');
        }
    });
})
.catch((err) => console.error('Erro:', err));
