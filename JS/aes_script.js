// Arquivo: aes_script.js - Código Completo Atualizado (formatBytes alterado)

(function() {
    const stepsArea = document.getElementById('stepsArea');
    const msgInput = document.getElementById('msgInput');
    const iniciarBtn = document.getElementById('iniciarBtn');

    // Variáveis globais para os dados da rodada (Estado 4x4)
    let stateMatrix = [];
    const KEY_128_BITS = "KEY128BITSCIPHER"; // Chave fixa de 16 caracteres (128 bits)

    // --- Funções Utilitárias ---

    function textToBytes(str){ 
        const bytes = Array.from(new TextEncoder().encode(str));
        while (bytes.length < 16) {
            bytes.push(0x00); // Padding simplificado
        }
        return bytes.slice(0, 16);
    }
    
    function bytesToMatrix(bytes) {
        const matrix = [];
        for (let i = 0; i < 4; i++) {
            matrix.push(bytes.slice(i * 4, (i * 4) + 4));
        }
        return matrix;
    }

    function matrixToBytes(matrix) {
        return matrix.flat();
    }

    // FUNÇÃO PARA FORMATAR A MATRIZ 4X4 (JÁ CORRIGIDA)
    function formatMatrix(matrix, title) {
        let html = `
            <div class="matrix-container my-3">
                <p class="font-semibold text-slate-300 text-center mb-2">${title}</p>
                <div class="aes-matrix"> 
        `;
        
        matrix.forEach(row => {
            row.forEach(byte => {
                const hex = byte.toString(16).padStart(2, '0').toUpperCase();
                const char = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·'; 
                
                html += `<div class="aes-cell" title="Dec: ${byte} | Char: ${char}">
                            <span class="text-cyan-400 font-mono text-lg block">${char}</span>
                            <span class="text-xs text-slate-400">Dec: ${byte}</span><br>
                            <span class="text-xs text-slate-200">Hex: 0x${hex}</span>
                        </div>`;
            });
        });
        
        html += '</div></div>';
        return html;
    }

    // FUNÇÃO ATUALIZADA PARA FORMATO DE TABELA/GRID CONSISTENTE
    function formatBytes(bytes) {
        // Usa a classe 'key-byte-list' para aplicar um grid de 8 colunas (para 16 bytes)
        let html = '<div class="key-byte-list">';
        bytes.forEach(b => {
            const hex = b.toString(16).padStart(2, '0').toUpperCase();
            const char = b >= 32 && b <= 126 ? String.fromCharCode(b) : '·'; 

            // Reusa a estrutura de célula, mas com estilos adaptados
            html += `<div class="key-byte-cell">
                        <span class="text-lg block text-cyan-300">${char}</span>
                        <span class="text-xs text-slate-400">Dec: ${b}</span>
                        <span class="text-xs text-slate-200">Hex: 0x${hex}</span>
                    </div>`;
        });
        html += '</div>';
        return html;
    }

    // --- SIMULAÇÕES SIMPLIFICADAS DAS TRANSFORMAÇÕES AES ---

    // 1. SubBytes (Substituição por S-Box) - Simulação: Inverte bits (NOT)
    function subBytesSimulated(matrix) {
        const newMatrix = matrix.map(row => 
            row.map(byte => (byte ^ 0xFF) & 0xFF) // NOT byte (inversão simples para demonstrar mudança)
        );
        return newMatrix;
    }

    // 2. ShiftRows (Deslocamento de Linhas) - Real: Deslocamento Cíclico
    function shiftRows(matrix) {
        const row1 = [...matrix[1]];
        matrix[1] = [...row1.slice(1), row1[0]];

        const row2 = [...matrix[2]];
        matrix[2] = [...row2.slice(2), ...row2.slice(0, 2)];

        const row3 = [...matrix[3]];
        matrix[3] = [...row3.slice(3), ...row3.slice(0, 3)];

        return matrix;
    }

    // 3. MixColumns (Mistura de Colunas) - Simulação: Combinação XOR entre colunas
    function mixColumnsSimulated(matrix) {
        const newMatrix = [[], [], [], []];
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 4; i++) {
                const nextCol = (j + 1) % 4;
                newMatrix[i][j] = matrix[i][j] ^ matrix[i][nextCol];
            }
        }
        return newMatrix;
    }

    // 4. AddRoundKey (Adição da Chave de Rodada)
    function addRoundKey(matrix, roundKey) {
        const newMatrix = [[], [], [], []];
        const roundKeyMatrix = bytesToMatrix(roundKey);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                newMatrix[i][j] = matrix[i][j] ^ roundKeyMatrix[i][j];
            }
        }
        return newMatrix;
    }


    // --- Lógica Principal (Botão) ---
    iniciarBtn.onclick = function() {
        const msg = msgInput.value;
        stepsArea.innerHTML = ''; 
        
        if (!msg || msg.length > 16) {
            stepsArea.innerHTML = '<div class="step-box" style="background: #FF6666;">Por favor, digite uma mensagem de 1 a 16 caracteres.</div>';
            return;
        }

        // 1. Preparar a Mensagem e a Chave
        const inputBytes = textToBytes(msg);
        let currentMatrix = bytesToMatrix(inputBytes);
        const roundKey = textToBytes(KEY_128_BITS);
        
        let content = `
            <strong>Passo 1: Bloco de Entrada e Inicialização do Estado</strong>
            <p>A mensagem (128 bits) é carregada em uma matriz 4x4.</p>
            ${msg.length < 16 ? `<p class="warning">Mensagem menor que 16 caracteres. O bloco de 128 bits (16 bytes) foi completado com <strong>padding</strong> (bytes 0x00).</p>` : ''}
            
            ${formatMatrix(currentMatrix, "Estado Inicial (Entrada na Rodada)")}
            
            <hr style="border-color: #1E252C; margin: 15px 0;">
            
            <strong>Passo 2: AddRoundKey Inicial</strong>
            <p>O estado inicial é combinado via XOR com a Subchave Zero (simulada aqui com a chave principal).</p>
            
            <div class="sub-key-box">
                <span class="font-semibold text-slate-300 block mb-2">Subchave (128 bits):</span>
                ${formatBytes(roundKey)}
            </div>
            
            `;

        currentMatrix = addRoundKey(currentMatrix, roundKey);
        content += `${formatMatrix(currentMatrix, "Estado Após AddRoundKey Inicial")}`;
        
        content += `<hr style="border-color: #00BCD4; margin: 20px 0;">`;

        // --- PASSO 3: Transformações (Uma Rodada Completa) ---

        // 3a. SubBytes
        content += `
            <strong>Passo 3a: SubBytes (Substituição Não-Linear)</strong>
            <p>Cada byte do estado é substituído usando uma S-Box (Simulação: Inversão simples para confusão).</p>
        `;
        currentMatrix = subBytesSimulated(currentMatrix);
        content += `${formatMatrix(currentMatrix, "Estado Após SubBytes (Confusão)")}`;

        // 3b. ShiftRows
        content += `
            <strong>Passo 3b: ShiftRows (Deslocamento de Linhas)</strong>
            <p>As linhas da matriz são deslocadas ciclicamente (0, 1, 2, 3 bytes). Isto aumenta a difusão.</p>
        `;
        currentMatrix = shiftRows(currentMatrix);
        content += `${formatMatrix(currentMatrix, "Estado Após ShiftRows (Difusão)")}`;
        
        // 3c. MixColumns
        content += `
            <strong>Passo 3c: MixColumns (Mistura de Colunas)</strong>
            <p>As colunas são combinadas usando multiplicação em campo finito. (Simulação: Combinação XOR entre colunas para forte difusão).</p>
        `;
        currentMatrix = mixColumnsSimulated(currentMatrix);
        content += `${formatMatrix(currentMatrix, "Estado Após MixColumns (Difusão Forte)")}`;
        
        // 3d. AddRoundKey Final da Rodada
        content += `
            <strong>Passo 3d: AddRoundKey (Adição da Chave de Rodada)</strong>
            <p>O estado é combinado via XOR com a Subchave da Rodada para finalizar a rodada.</p>
        `;
        // Usando a chave K0 novamente para simplificação didática
        currentMatrix = addRoundKey(currentMatrix, roundKey);
        content += `${formatMatrix(currentMatrix, "Estado Final da Rodada (Novo Ciphertext)")}`;


        const finalBytes = matrixToBytes(currentMatrix);
        
        content += `
            <hr style="border-color: #1E252C; margin: 15px 0;">

            <div class="final-message">
                <strong>Saída Cifrada da Rodada:</strong>
                <p>O resultado da Rodada 1 é o novo bloco de 128 bits para a próxima iteração, garantindo o máximo de embaralhamento.</p>
                ${formatBytes(finalBytes)}
            </div>

            <div class="final-message">
                Este processo se repetirá <strong>10, 12 ou 14 vezes</strong> (dependendo do tamanho da chave) para obter o bloco cifrado final.
            </div>
        `;

        const stepBox = document.createElement('div');
        stepBox.className = 'step-box';
        stepBox.innerHTML = content;
        stepsArea.appendChild(stepBox);
    };
})();