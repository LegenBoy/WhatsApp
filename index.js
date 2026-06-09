sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // 1. Ignora mensagens vazias ou de status
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        // =========================================================
        // 2. CONFIGURE SEUS IDs AQUI
        // =========================================================
        // ID do Grupo que você capturou
        const ID_DO_GRUPO = '120363425613612495@g.us'; 
        
        // Coloque o SEU NÚMERO PESSOAL aqui (Código do País + DDD + Número)
        // Exemplo: '5534999999999@s.whatsapp.net'
        const MEU_NUMERO = '553499311672@s.whatsapp.net'; 

        const chatDeOrigem = msg.key.remoteJid;
        
        // Descobre quem enviou a mensagem dentro do grupo
        let quemEnviou = msg.key.participant;
        
        // Se você estiver enviando a mensagem usando o MESMO WhatsApp em que o bot está logado
        if (msg.key.fromMe) {
            quemEnviou = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        }

        // =========================================================
        // 3. O FILTRO BLINDADO
        // =========================================================
        // Se o ID do grupo for diferente OU se quem enviou NÃO for você, o bot ignora silenciosamente.
        if (chatDeOrigem !== ID_DO_GRUPO || quemEnviou !== MEU_NUMERO) {
            return; 
        }

        // 4. Se chegou até aqui, é VOCÊ enviando no GRUPO CORRETO!
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (texto.toLowerCase().includes('lacrado')) {
            console.log('\n--- COMANDO AUTORIZADO RECEBIDO ---');
            console.log('Autorizado por:', quemEnviou);
            console.log('Texto:', texto);
            
            try {
                // AQUI ENTRARÁ O SEU CÓDIGO DA API (Axios)
                
                // Responde no grupo confirmando e marcando a sua mensagem
                await sock.sendMessage(chatDeOrigem, { text: '✅ Atualizando status do baú lacrado no sistema...' }, { quoted: msg });
            } catch (err) {
                console.error('Erro na integração:', err);
                await sock.sendMessage(chatDeOrigem, { text: '❌ Erro de comunicação com a API.' });
            }
        }
    });
