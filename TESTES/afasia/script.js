document.addEventListener('DOMContentLoaded', () => {
    const perguntas = [
        { texto: "O paciente é fluente?", opcoes: ["SIM", "NÃO"] },
        { texto: "O paciente compreende?", opcoes: ["SIM", "NÃO"] },
        { texto: "O paciente repete?", opcoes: ["SIM", "NÃO"] }
    ];

    const resultados = {
        "SIM-SIM-SIM": {
            tipo: "Afasia Anômica",
            descricao: "Afasia caracterizada por dificuldade de encontrar palavras, com fluência, compreensão e repetição preservadas."
        },
        "SIM-SIM-NÃO": {
            tipo: "Afasia de Condução",
            descricao: "Afasia em que a repetição está gravemente comprometida, enquanto a fluência e a compreensão são relativamente boas."
        },
        "SIM-NÃO-SIM": {
            tipo: "Afasia Transcortical Sensorial",
            descricao: "Afasia com fluência e repetição preservadas, mas com grave comprometimento da compreensão da linguagem."
        },
        "SIM-NÃO-NÃO": {
            tipo: "Afasia de Wernicke",
            descricao: "Afasia caracterizada por fala fluente, mas sem sentido, e grave comprometimento da compreensão."
        },
        "NÃO-SIM-SIM": {
            tipo: "Afasia Transcortical Motora",
            descricao: "Afasia com redução da fluência verbal, mas com compreensão e repetição relativamente preservadas."
        },
        "NÃO-SIM-NÃO": {
            tipo: "Afasia de Broca",
            descricao: "Afasia caracterizada por fala não fluente, esforçada e telegráfica, com compreensão relativamente preservada."
        },
        "NÃO-NÃO-SIM": {
            tipo: "Afasia Transcortical Mista",
            descricao: "Uma forma rara de afasia onde a fluência e a compreensão são gravemente afetadas, mas a repetição é preservada."
        },
        "NÃO-NÃO-NÃO": {
            tipo: "Afasia Global",
            descricao: "A forma mais severa de afasia, afetando gravemente todas as áreas da linguagem: fluência, compreensão e repetição."
        }
    };

    let respostas = [];
    let etapa = 0;

    const afasiaContainer = document.getElementById('afasiaContainer');
    const perguntaEl = document.getElementById("perguntaAfasia");
    const botoesEl = document.getElementById("botoesAfasia");
    const resultadoEl = document.getElementById("resultadoAfasia");
    const descricaoResultadoEl = document.getElementById("descricaoResultado");
    const botoesAcaoEl = document.getElementById("botoesAcao");
    const gerarRelatorioBtn = document.getElementById("gerarRelatorio");
    const retestarBtn = document.getElementById("retestar");

    function mostrarPergunta() {
        
        afasiaContainer.style.display = 'block';
        perguntaEl.style.display = 'block';
        botoesEl.style.display = 'flex'; 

        
        resultadoEl.style.display = 'none';
        descricaoResultadoEl.style.display = 'none';
        botoesAcaoEl.style.display = 'none';


        const atual = perguntas[etapa];
        perguntaEl.textContent = atual.texto;
        botoesEl.innerHTML = "";

        atual.opcoes.forEach(opcao => {
            const btn = document.createElement("button");
            btn.textContent = opcao;
            btn.onclick = () => {
                respostas.push(opcao);
                etapa++;
                if (etapa < perguntas.length) {
                    mostrarPergunta();
                } else {
                    mostrarResultado();
                }
            };
            botoesEl.appendChild(btn);
        });
    }

    function mostrarResultado() {
       
        perguntaEl.style.display = "none";
        botoesEl.style.display = "none";
        afasiaContainer.style.display = "none"; 
        resultadoEl.style.display = "block";
        descricaoResultadoEl.style.display = "block";
        botoesAcaoEl.style.display = "flex"; 

        const chave = respostas.join("-");
        const resultadoObj = resultados[chave];

        let diagnostico = "Diagnóstico não encontrado.";
        let descricaoConclusao = "Não foi possível determinar um tipo de afasia com base nas respostas. Sugerimos buscar avaliação profissional.";

        if (resultadoObj) {
            diagnostico = resultadoObj.tipo;
            descricaoConclusao = `O paciente apresenta **${resultadoObj.tipo}**, de acordo com o fluxo de classificação de afasias baseado em fluência, compreensão e repetição. ${resultadoObj.descricao}`;
        }

        resultadoEl.innerHTML = `<p>✅ Diagnóstico final: <strong>${diagnostico}</strong></p>`;
        descricaoResultadoEl.innerHTML = `<em>Conclusão automática:</em> ${descricaoConclusao}`;
    }

    gerarRelatorioBtn.addEventListener('click', () => {
        const chave = respostas.join("-");
        const resultadoFinal = resultados[chave] || { tipo: "Não determinado", descricao: "Sem descrição específica." };

        const relatorioTexto = `
            RELATÓRIO DE CLASSIFICAÇÃO DE AFASIA

            Perguntas e Respostas:
            - Paciente é fluente? ${respostas[0] || 'Não respondido'}
            - Paciente compreende? ${respostas[1] || 'Não respondido'}
            - Paciente repete? ${respostas[2] || 'Não respondido'}

            Diagnóstico Provável: ${resultadoFinal.tipo}
            Descrição: ${resultadoFinal.descricao}

            Este relatório é uma classificação inicial baseada nas respostas fornecidas.
            Para um diagnóstico completo e acompanhamento adequado, é essencial a avaliação de um profissional de saúde qualificado.
        `;

        const novaJanela = window.open('', '_blank');
        novaJanela.document.write('<pre>' + relatorioTexto + '</pre>');
        novaJanela.document.close();
        novaJanela.focus();
        
    });

    retestarBtn.addEventListener('click', () => {
        respostas = []; 
        etapa = 0; 
        mostrarPergunta(); 
    });

    mostrarPergunta();
});