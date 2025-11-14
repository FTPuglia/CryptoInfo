(function() {
  const stepsArea = document.getElementById('stepsArea');
  const FIXED_KEY_STR = 'CHAVE_8B'; 
  
  // Variáveis globais para os dados da rodada
  let L0 = []; 
  let R0 = [];
  let keyBytes = [];
  let fR = []; // Armazena o resultado de f(R0, K1)

  // --- Funções Utilitárias ---
  function textToBytes(str){ return Array.from(new TextEncoder().encode(str)); }

  function formatBytes(bytes) {
    let html = '<div class="byte-list">';
    bytes.forEach(b => {
      const hex = b.toString(16).padStart(2, '0').toUpperCase();
      const char = b >= 32 && b <= 126 ? String.fromCharCode(b) : '·'; 

      html += `<div class="byte">
                <span class="char-repr">${char}</span>
                Dec: ${b}<br>
                Hex: 0x${hex}
              </div>`;
    });
    html += '</div>';
    return html;
  }
  
  function keyToBytes(keyStr){
    const b = textToBytes(keyStr);
    const out = new Array(8).fill(0);
    for(let i=0;i<8 && i<b.length;i++) out[i]=b[i];
    return out;
  }
  
  function xorBytes(a, b) {
    const len = Math.min(a.length, b.length); 
    const result = new Array(len);
    for(let i = 0; i < len; i++) {
      result[i] = a[i] ^ b[i];
    }
    return result;
  }

  // --- FUNÇÃO DE FEISTEL SIMPLIFICADA (f) ---
  function fSimplified(rBytes, kBytes){
    // Simulação didática: Rotação e XOR com K1
    const rotatedR = rBytes.map(b => ((b<<1)|(b>>>7)) & 0xFF); 
    const result = new Array(4);
    for(let i=0;i<4;i++) {
      result[i] = rotatedR[i] ^ kBytes[i];
    }
    return result;
  }

  // --- Lógica Principal (Botão) ---
  document.getElementById('iniciarBtn').onclick = function() {
    const msg = document.getElementById('msgInput').value;
    stepsArea.innerHTML = ''; 
    
    if (!msg) {
      stepsArea.innerHTML = '<div class="step-box" style="background: #FF6666;">Por favor, digite uma mensagem.</div>';
      return;
    }
    
    // 1. Preparar a Mensagem (L0 e R0)
    let warningMsg = '';
    // **Manter <strong>padding</strong> para destaque de termo único.**
    if (msg.length < 8) {
        warningMsg = '<p class="warning"><br> Mensagem menor que 8 caracteres. O bloco será completado com <strong>padding</strong> (bytes 0x00).</p>';
    }

    const allBytes = textToBytes(msg);
    const block = allBytes.slice(0, 8); 
    while (block.length < 8) {
        block.push(0); 
    }
    L0 = block.slice(0, 4); 
    R0 = block.slice(4, 8); 
    
    // 2. Preparar a Chave e Subchave K1
    keyBytes = keyToBytes(FIXED_KEY_STR);
    const subkeyK1 = keyBytes.slice(0, 4);
    
    // --- PASSO 3: Cálculo da Função f(R, K1) ---
    fR = fSimplified(R0, subkeyK1); 
    
    // --- PASSO 4: CÁLCULO XOR ---
    const R1 = xorBytes(L0, fR);
    
    // --- PASSO 5: TROCA DE METADES (SWAP) ---
    const L1 = R0; 
    
    // 3. Exibir o resultado (Passos 1 a 5)
    const stepBox = document.createElement('div');
    stepBox.className = 'step-box';
    
    // Usando Template Literal (backticks) para um HTML mais limpo
    let content = `
      <strong>Passo 1: Bloco de Entrada e Divisão</strong>
      ${warningMsg}
      <div class="p-2 my-2 rounded text-left bg-slate-800 border border-slate-700">
        <p><strong>L0 (Esquerda):</strong> ${formatBytes(L0)}</p>
        <p><strong>R0 (Direita):</strong> ${formatBytes(R0)}</p>
      </div>
      
      <hr style="border-color: #1E252C; margin: 15px 0;">
      
      <strong>Passo 2: Geração de Subchave</strong>
      <p>Chave Principal (64 bits): ${formatBytes(keyBytes)}</p>
      <p>No DES, a chave é dividida em 16 subchaves. Usamos a primeira subchave (K1) para esta rodada.</p>
      <div class="sub-key-box">Subchave Simplificada K1 (32 bits): ${formatBytes(subkeyK1)}</div>
      
      <hr style="border-color: #1E252C; margin: 15px 0;">

      <strong>Passo 3: Aplicação da Função de Feistel F(R, K1)</strong>
      <p>O bloco direito R é processado pela Função de Feistel (F) usando a subchave K1. É aqui que a criptografia acontece.</p>
      
      <div class="detail-list"><strong>O que acontece na Função F?</strong>
        <ul>
          <li><strong>1. Expansão e Embaralhamento:</strong> No DES real, o R0 (32 bits) é expandido para 48 bits. <br></li>
          <li><strong>2. XOR com K1:</strong> Os 48 bits resultantes são combinados com a subchave K1 (48 bits) usando XOR.</li>
          <li><strong>3. Substituição S-Boxes:</strong> O resultado é reduzido de volta para 32 bits através das S-Boxes, que são tabelas de substituição que garantem que o processo seja difícil de reverter.</li>
          <li><strong>4. Permutação P-Box:</strong> Os 32 bits são reordenados para terminar o embaralhamento.</li>
        </ul>
      </div>

      <div class="p-2 my-2">
        <p>Entrada R0: ${formatBytes(R0)}</p>
        <p>Subchave K1: ${formatBytes(subkeyK1)}</p>
      </div>
      
      <div class="f-explanation">
        Observe que a saída da função F é um dado embaralhado. Por isso, a maioria dos bytes resultantes não corresponde a caracteres de texto visíveis, sendo representados pelo ponto (·). Isso é um sinal de que a criptografia está aplicando a confusão com sucesso.
      </div>

      <p>Resultado da função F(R0, K1):</p>
      <div class="f-box">${formatBytes(fR)}</div>

      <hr style="border-color: #00BCD4; margin: 20px 0;"> 

      <strong>Passo 4: Combinação XOR (Cálculo do Novo R)</strong>
      <p>O resultado da Função F (F(R<sub>0</sub>, K<sub>1</sub>)) é agora combinado com o bloco esquerdo original (L<sub>0</sub>) através da operação XOR (&oplus;).</p>
      
      <h4>Cálculo: R1 = L0 &oplus; F(R0, K1)</h4>
      <div class="p-2 my-2">
        <p>L0 (Bloco Esquerdo Antigo): ${formatBytes(L0)}</p>
        <p>F(R0, K1) (Resultado da Função F): ${formatBytes(fR)}</p>
      </div>
      
      <div class="xor-box">Resultado (Novo Bloco R1): ${formatBytes(R1)}</div>
      
      <hr style="border-color: #1E252C; margin: 15px 0;">

      <strong>Passo 5: Troca de Metades (Swap)</strong>
      <p>O antigo bloco <i>R</i><sub>0</sub> torna-se o Novo L1, e o resultado do XOR é o Novo R1.</p>
      
      <div class="final-output">
        <strong>Saída da Rodada 1 (L1, R1):</strong>
        <p style="margin-top: 10px;"><strong>L1:</strong> (Igual a R0)</p>${formatBytes(L1)}
        <p style="margin-top: 10px;"><strong>R1:</strong> (Resultado do XOR)</p>${formatBytes(R1)}
      </div>

      <div class="final-message">
        Esta é a conclusão da Rodada 1. No algoritmo DES completo, este processo se <strong>repetiria mais 15 vezes</strong> (total de 16 rodadas), utilizando uma subchave diferente em cada rodada, para obter a mensagem final criptografada.
      </div>
    `;

    stepBox.innerHTML = content;
    stepsArea.appendChild(stepBox);
  };
})();