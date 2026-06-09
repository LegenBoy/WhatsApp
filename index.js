const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect.create({ 
    session: 'logistica-zema',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
})
.then((client) => {
    console.log('Bot conectado e ouvindo!');
    
    // Voltamos para o onMessage para evitar eventos invisíveis do sistema
    client.onMessage(async (message) => {
        // 1. A BARREIRA: Ignora nulos, status, e qualquer coisa que não seja texto ('chat')
        if (!message || message.from === 'status@broadcast' || message.isStatus || message.type !== 'chat') {
            return; // Interrompe a execução aqui mesmo
        }

        // 2. Se passou da barreira, é uma mensagem real enviada por alguém. Agora sim logamos.
        console.log('--- MENSAGEM DE TEXTO RECEBIDA ---');
        console.log('De:', message.from);
        console.log('Texto:', message.body);
        
        // 3. Verifica se contém "lacrado"
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
