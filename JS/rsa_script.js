// Arquivo: rsa_script.js (Versão com Estrutura de Caixas Separadas)

(function() {
    const stepsArea = document.getElementById('stepsArea');
    const pInput = document.getElementById('pInput');
    const qInput = document.getElementById('qInput');
    const mInput = document.getElementById('mInput');
    const iniciarBtn = document.getElementById('iniciarBtn');

    // --- Funções Matemáticas Essenciais ---

    function gcd(a, b) {
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    function extendedGcd(a, b) {
        if (a === 0n) {
            return [b, 0n, 1n];
        }
        const [g, x1, y1] = extendedGcd(b % a, a);
        const x = y1 - (b / a) * x1;
        const y = x1;
        return [g, x, y];
    }

    function modInverse(a, m) {
        const [g, x] = extendedGcd(a, m);
        if (g !== 1n) {
            return 0n;
        }
        return (x % m + m) % m;
    }

    function modPow(base, exponent, modulus) {
        let result = 1n;
        base %= modulus;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            base = (base * base) % modulus;
            exponent /= 2n;
        }
        return result;
    }

    function isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        for (let i = 5; i * i <= num; i = i + 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        return true;
    }

    // --- Função Auxiliar para Display de Fórmulas ---
    function formatCalculation(expression, result, colorClass = 'text-cyan-300') {
        return `<div class="math-step-simple bg-slate-900 p-3 rounded font-mono text-lg ${colorClass} text-center">
                    ${expression} = ${result}
                </div>`;
    }

    // --- Lógica Principal (Botão) ---
    iniciarBtn.onclick = function() {
        const P = BigInt(pInput.value || 0);
        const Q = BigInt(qInput.value || 0);
        const M = BigInt(mInput.value || 0);
        stepsArea.innerHTML = ''; 

        // Validação
        if (P <= 1n || Q <= 1n || M <= 0n) {
            stepsArea.innerHTML = '<div class="step-box warning">Erro: Por favor, insira valores positivos para P, Q e M.</div>';
            return;
        }
        if (!isPrime(Number(P)) || !isPrime(Number(Q))) {
             stepsArea.innerHTML = '<div class="step-box warning">Erro: P e Q devem ser números primos válidos.</div>';
            return;
        }
        if (P === Q) {
             stepsArea.innerHTML = '<div class="step-box warning">Erro: P e Q devem ser primos distintos.</div>';
            return;
        }

        let content = '';

        // --- 1. GERAÇÃO DE CHAVES ---

        // 1a. Cálculo de n (Módulo)
        const N = P * Q;
        
        content += `
            <div class="step-content-box border-b-2 border-slate-600 pb-6 mb-6">
                <span class="font-bold text-xl text-cyan-400 block mb-2">Passo 1: Definindo a Base do Sistema (Módulo N)</span>
                <p>Calculamos o Módulo <span class="font-bold">N</span> multiplicando os dois primos escolhidos, <span class="font-bold">P</span> e <span class="font-bold">Q</span>. N é o número que torna o sistema seguro. Ele será parte da sua chave pública e privada.</p>
                ${formatCalculation('N = P * Q = ' + P + ' * ' + Q, N, 'text-green-300')}
                <p class="mt-2 text-sm text-yellow-300"><span class="font-bold">Segredo:</span> A força do RSA está no fato de que ninguém consegue descobrir P e Q apenas sabendo o valor de N.</p>
            </div>
        `;
        
        // Validação da Mensagem M
        if (M >= N) {
             stepsArea.innerHTML = `<div class="step-box warning">Erro: A mensagem M (${M}) deve ser um número menor que o Módulo N (${N}).</div>`;
            return;
        }

        // 1b. Cálculo de PHI (Totiente de Euler)
        const PHI = (P - 1n) * (Q - 1n);
        content += `
            <div class="step-content-box border-b-2 border-slate-600 pb-6 mb-6">
                <span class="font-bold text-xl text-cyan-400 block mb-2">Passo 2: Calculando o Nível de Dificuldade (PHI)</span>
                <p>Calculamos o <span class="font-bold">PHI</span> (Totiente de Euler), que nos diz quantos números são úteis para as operações. Ele é essencial para encontrar a Chave Privada, mas deve ser mantido em segredo.</p>
                ${formatCalculation('PHI = (P-1) * (Q-1) = (' + P + '-1) * (' + Q + '-1)', PHI, 'text-green-300')}
            </div>
        `;

        // 1c. Escolha do Expoente Público 'E'
        let E = 65537n;
        if (gcd(E, PHI) !== 1n) {
             E = 3n;
             while (E < PHI && gcd(E, PHI) !== 1n) {
                 E += 2n;
             }
        }
        
        content += `
            <div class="step-content-box border-b-2 border-slate-600 pb-6 mb-6">
                <span class="font-bold text-xl text-cyan-400 block mb-2">Passo 3: Definindo a Chave Pública (E)</span>
                <p>O expoente <span class="font-bold">E</span> é escolhido de forma que ele não tenha divisores em comum com PHI (exceto 1). E e N formam a <span class="font-bold">Chave Pública</span>, que é distribuída para quem quiser te enviar mensagens.</p>
                <div class="p-3 bg-slate-800 rounded">
                    <div class="text-lg text-white font-semibold">Chave Pública: <span class="text-green-400">(E=${E}, N=${N})</span></div>
                    <p class="text-sm text-slate-400 mt-1">Use esta para Criptografar!</p>
                </div>
            </div>
        `;

        // 1d. Cálculo do Expoente Privado 'D'
        const D = modInverse(E, PHI);
        if (D === 0n) {
             stepsArea.innerHTML = `<div class="step-box warning">Erro: Não foi possível calcular D.</div>`;
            return;
        }

        content += `
            <div class="step-content-box mb-8">
                <span class="font-bold text-xl text-cyan-400 block mb-2">Passo 4: Calculando a Chave Secreta (D)</span>
                <p>O expoente <span class="font-bold">D</span> é o "segredo" que desfaz a operação de E. Ele é calculado usando PHI. O par (D, N) é a <span class="font-bold">Chave Privada</span>, que é mantida em total sigilo.</p>
                <div class="p-3 bg-slate-800 rounded">
                    <div class="text-lg text-white font-semibold">Chave Privada: <span class="text-red-400">(D=${D}, N=${N})</span></div>
                    <p class="text-sm text-slate-400 mt-1">Use esta para Descriptografar!</p>
                </div>
            </div>
            <hr class="border-slate-400 my-6">
        `;
        
        // --- 2. CRIPTOGRAFIA ---
        
        const C = modPow(M, E, N);
        content += `
            <div class="step-content-box mb-8">
                <span class="font-bold text-xl text-cyan-400 block mb-3">Passo 5: Criptografia (Enviando a Mensagem Secreta)</span>
                <p>Usamos a <span class="font-bold">Chave Pública (E, N)</span> para criptografar a mensagem <span class="font-bold">M</span>.</p>
                
                <p class="text-sm text-yellow-200 mt-3">
                    <span class="font-bold">IMPORTANTE:</span> O resultado é o <span class="font-bold">resto da divisão</span> da exponenciação pelo Módulo N.
                </p>

                <p class="text-sm text-slate-400 mt-2">Fórmula: C = (M elevado a E) MÓDULO N (o resto da divisão por N)</p>
                ${formatCalculation('C = ' + M + ' ^ ' + E + ' (mod ' + N + ')', C, 'text-cyan-300')}
                
                <p class="mt-3 text-cyan-400 font-semibold">Texto Cifrado (C): ${C}</p>
            </div>
            <hr class="border-slate-400 my-6">
        `;

        // --- 3. DESCRIPTOGRAFIA ---
        
        const M_DECRYPTED = modPow(C, D, N);
        content += `
            <div class="step-content-box mb-8">
                <span class="font-bold text-xl text-cyan-400 block mb-3">Passo 6: Descriptografia (Lendo a Mensagem)</span>
                <p>Usamos a <span class="font-bold">Chave Privada (D, N)</span> (o segredo) para reverter o Texto Cifrado <span class="font-bold">C</span> e encontrar a mensagem original <span class="font-bold">M</span>.</p>
                
                
                <p class="text-sm text-slate-400 mt-2">Fórmula: M = (C elevado a D) MÓDULO N (o resto da divisão por N)</p>
                ${formatCalculation('M = ' + C + ' ^ ' + D + ' (mod ' + N + ')', M_DECRYPTED, 'text-red-300')}
                
                <p class="mt-3 text-red-400 font-semibold">Mensagem Original Descriptografada: ${M_DECRYPTED}</p>
            </div>
        `;
        
        content += `
            <div class="final-message p-4 bg-slate-700 rounded-lg text-white font-medium text-center">
                <span class="font-bold">Conclusão:</span> A mensagem original ${M} foi recuperada com sucesso.
            </div>
        `;

        stepsArea.innerHTML = content;
    };
})();