(function () {
    // CHAVE DE EXEMPLO (8 bytes). Somente para demonstração.
    const key = CryptoJS.enc.Utf8.parse('12345678');

    // Função auxiliar para limpar e extrair o texto Base64 ou Decifrado da caixa de saída
    function extractTextFromOutput(textContent) {
        const text = textContent.trim();
        if (!text) return '';

        // 1. Caso seja o resultado de uma CRIPTOGRAFIA (Base64 simples)
        // O Base64 sempre termina em '=' ou caracteres alfanuméricos.
        if (text.match(/^[a-zA-Z0-9+/=]+$/)) {
            return text;
        }

        // 2. Caso seja o resultado de uma DESCRIPTOGRAFIA (precisa reverter o processo)
        // Se a saída for 'TEXTO DECIFRADO:\n[O TEXTO]', pegamos só o texto para criptografar
        if (text.startsWith('TEXTO DECIFRADO:')) {
            // Se o usuário tentar descriptografar um texto que foi recém-descriptografado,
            // vamos pegar o último ciphertext conhecido que gerou esse plain.
            // Para simplificar, vou retornar uma string vazia ou exigir o ciphertext original.
            return ''; 
        }

        // 3. Remove mensagens de feedback (Copiado)
        const cleanedText = text.split('\n\n(Copiado')[0].trim();
        return cleanedText;
    }

    window.criptografar = function () {
        const entradaEl = document.getElementById('entrada');
        const saidaEl = document.getElementById('saida');
        const mensagem = entradaEl.value;

        if (!mensagem) {
            saidaEl.textContent = 'Por favor, digite um texto para criptografar.';
            return;
        }

        // 1. CRIPTOGRAFAR
        const cifrado = CryptoJS.DES.encrypt(mensagem, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        const ciphertextBase64 = cifrado.toString(); 

        // 2. EXIBIÇÃO: Agora aparece APENAS o texto criptografado.
        saidaEl.textContent = ciphertextBase64;
        
        // Colocamos o ciphertext na entrada para facilitar a descriptografia imediata
        // Isso é opcional, mas melhora a experiência.
        entradaEl.value = ciphertextBase64;
    };

    window.descriptografar = function () {
        const entradaEl = document.getElementById('entrada');
        const saidaEl = document.getElementById('saida');
        
        // 1. TENTA LER do campo de ENTRADA (se o usuário colou algo)
        let textoParaDescriptografar = entradaEl.value.trim();

        // 2. TENTA LER da caixa de SAÍDA (se o campo de entrada estava vazio)
        if (!textoParaDescriptografar) {
            textoParaDescriptografar = extractTextFromOutput(saidaEl.textContent);
        }
        
        // 3. VERIFICA SE HÁ ALGO PARA FAZER
        if (!textoParaDescriptografar) {
            saidaEl.textContent = 'Cole o texto criptografado no campo de entrada, ou gere um ciphertext primeiro.';
            return;
        }

        // Se o texto é o texto descriptografado (TEXTO DECIFRADO:...), 
        // alertamos que não podemos descriptografar o plain, apenas o cipher.
        if (textoParaDescriptografar.includes('TEXTO DECIFRADO:')) {
            saidaEl.textContent = 'ERRO: A caixa de saída já contém um texto decifrado. Você precisa do CIPHERTEXT para descriptografar!';
            return;
        }

        try {
            saidaEl.textContent = '... Descriptografando ...'; 

            const dec = CryptoJS.DES.decrypt(textoParaDescriptografar, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
            const plain = dec.toString(CryptoJS.enc.Utf8);

            if (!plain) {
                // Se a descriptografia falhar, tentamos identificar o erro
                throw new Error('Texto inválido, chave incorreta, ou padding errado.');
            }

            // 4. EXIBIÇÃO: Saída com o texto decifrado
            saidaEl.textContent = 'TEXTO DECIFRADO:\n' + plain;
            
            // Limpa a entrada para o próximo ciclo
            entradaEl.value = '';

        } catch (err) {
            saidaEl.textContent = 'Erro ao descriptografar. Verifique se o texto é um Base64 válido gerado por este demo. Detalhe: ' + err.message;
            console.error(err);
        }
    };

    window.copiarSaida = function () {
        const saidaEl = document.getElementById('saida');
        const txt = saidaEl.textContent.trim() || '';
        
        // Usamos a função auxiliar para garantir que copiamos o texto principal
        let textoParaCopiar = extractTextFromOutput(txt);
        
        // Se a saída for um texto decifrado, removemos o rótulo
        if (textoParaCopiar.startsWith('TEXTO DECIFRADO:\n')) {
             textoParaCopiar = textoParaCopiar.split('\n')[1].trim();
        }
        
        if (!textoParaCopiar || textoParaCopiar.includes('Erro')) return;

        navigator.clipboard?.writeText(textoParaCopiar).then(() => {
            const original = saidaEl.textContent;
            saidaEl.textContent = original + '\n\n(Copiado para a área de transferência)';
            setTimeout(() => { saidaEl.textContent = original; }, 1200);
        }).catch(() => {
            alert('Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.');
        });
    };
})();