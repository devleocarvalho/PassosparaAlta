document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            text: "Existe HSA (hemorragia subaracnóidea)?",
            options: ["Não", "Sim"],
        },
        {
            text: "A HSA é fina ou espessa?",
            options: ["Fina (<1mm)", "Espessa (≥1mm)"],
        },
        {
            text: "Existe hemorragia intraventricular ?",
            options: ["Não", "Sim"],
        }
    ];

    let currentQuestion = 0;
    let answers = []; // Armazena o índice da opção selecionada (0 ou 1)

    // Elementos do DOM
    const questionContainer = document.getElementById("question-container");
    const questionText = document.getElementById("question-text");
    const optionsDiv = document.getElementById("options"); // Div que contém os botões de opção
    const resultDiv = document.getElementById("result");
    const resultGrauEl = document.getElementById("result-grau");
    const resultDescricaoEl = document.getElementById("result-descricao");
    const resultEspessuraEl = document.getElementById("result-espessura");
    const resultIncidenciaEl = document.getElementById("result-incidencia");
    const reportBox = document.getElementById("report");
    const restartBtn = document.getElementById("restartBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn"); // Novo botão

    function showQuestion() {
        // Garante que o quiz está visível e o resultado escondido
        questionContainer.classList.remove("hidden");
        resultDiv.classList.add("hidden");
        reportBox.classList.add("hidden"); // Esconde o relatório ao recomeçar/avançar pergunta
        restartBtn.classList.add("hidden"); // Esconde o botão de reiniciar durante o quiz

        questionText.textContent = questions[currentQuestion].text;
        optionsDiv.innerHTML = ""; // Limpa os botões anteriores

        questions[currentQuestion].options.forEach((option, index) => {
            const button = document.createElement("button");
            button.textContent = option;
            button.onclick = () => selectOption(index); // Ao clicar no botão, chama selectOption
            optionsDiv.appendChild(button);
        });
    }

    function selectOption(index) {
        answers[currentQuestion] = index; // Guarda o índice da opção selecionada
        currentQuestion++;

        if (currentQuestion < questions.length) {
            showQuestion(); // Avança para a próxima pergunta
        } else {
            showResult(); // Todas as perguntas respondidas, mostra o resultado
        }
    }

    function showResult() {
        // Esconde o quiz e mostra o resultado
        questionContainer.classList.add("hidden");
        resultDiv.classList.remove("hidden"); // Mostra a div de resultado
        resultDiv.classList.add("fadeIn"); // Aplica a animação

        let grau = 0;
        let descricao = "";
        let incidencia = "";
        let espessuraTexto = "";

        // Lógica da Escala de Fisher Modificada
        // answers[0] = HSA presente (0=Não, 1=Sim)
        // answers[1] = Espessura (0=Fina, 1=Espessa)
        // answers[2] = HIV presente (0=Não, 1=Sim)

        if (answers[1] === 0) {
            espessuraTexto = "Espessura do sangue: fina (<1mm)";
        } else if (answers[1] === 1) {
            espessuraTexto = "Espessura do sangue: espessa (≥1mm)";
        }

        if (answers[0] === 0 && answers[2] === 0) { // Sem HSA e sem HIV
            grau = 0;
            descricao = "Sem HSA e sem hemorragia intraventricular.";
            incidencia = "0%";
        } else {
            const hsaEspessa = answers[1] === 1;
            const hivPresente = answers[2] === 1;

            if (!hsaEspessa && !hivPresente) { // HSA fina, sem HIV
                grau = 1;
                descricao = "HSA fina (focal ou difusa), sem HIV.";
                incidencia = "24%";
            } else if (!hsaEspessa && hivPresente) { // HSA fina, com HIV
                grau = 2;
                descricao = "HSA fina (focal ou difusa), com HIV.";
                incidencia = "33%";
            } else if (hsaEspessa && !hivPresente) { // HSA espessa, sem HIV
                grau = 3;
                descricao = "HSA espessa, sem HIV.";
                incidencia = "33%";
            } else if (hsaEspessa && hivPresente) { // HSA espessa, com HIV
                grau = 4;
                descricao = "HSA espessa, com HIV.";
                incidencia = "40%";
            }
        }

        // Atualiza o HTML com os resultados
        resultGrauEl.innerHTML = `<strong>Grau:</strong> ${grau}`;
        resultDescricaoEl.innerHTML = `<strong>Descrição:</strong> ${descricao}`;
        resultEspessuraEl.innerHTML = `<strong>${espessuraTexto}</strong>`;
        resultIncidenciaEl.innerHTML = `<strong>Incidência de Vasoespasmo Sintomático:</strong> ${incidencia}`;

        // Mostra o botão de reiniciar e o relatório
        restartBtn.classList.remove("hidden"); // Usa .classList.remove("hidden")
        downloadReportBtn.classList.remove("hidden"); // Mostra o botão de download
        
        generateReport(false); // Gera o texto na textarea, mas não faz download ainda
    }

    function generateReport(shouldDownload = false) {
        let grau = 0; // Recalcula o grau e descrição para o relatório completo
        let descricao = "";
        let incidencia = "";
        let espessuraTexto = "";

        if (answers[1] === 0) {
            espessuraTexto = "Espessura do sangue: fina (<1mm)";
        } else if (answers[1] === 1) {
            espessuraTexto = "Espessura do sangue: espessa (≥1mm)";
        }

        if (answers[0] === 0 && answers[2] === 0) {
            grau = 0;
            descricao = "Sem HSA e sem hemorragia intraventricular.";
            incidencia = "0%";
        } else {
            const hsaEspessa = answers[1] === 1;
            const hivPresente = answers[2] === 1;

            if (!hsaEspessa && !hivPresente) {
                grau = 1;
                descricao = "HSA fina (focal ou difusa), sem HIV.";
                incidencia = "24%";
            } else if (!hsaEspessa && hivPresente) {
                grau = 2;
                descricao = "HSA fina (focal ou difusa), com HIV.";
                incidencia = "33%";
            } else if (hsaEspessa && !hivPresente) {
                grau = 3;
                descricao = "HSA espessa, sem HIV.";
                incidencia = "33%";
            } else if (hsaEspessa && hivPresente) {
                grau = 4;
                descricao = "HSA espessa, com HIV.";
                incidencia = "40%";
            }
        }

        const textoRelatorio =
            `RELATÓRIO DA ESCALA DE FISHER MODIFICADA\n\n` +
            `Data e Hora da Avaliação: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia' })}\n\n` +
            `Respostas Selecionadas:\n` +
            `1. ${questions[0].text}: ${questions[0].options[answers[0]]}\n` +
            `2. ${questions[1].text}: ${questions[1].options[answers[1]]}\n` +
            `3. ${questions[2].text}: ${questions[2].options[answers[2]]}\n\n` +
            `--- Resultado da Escala de Fisher Modificada ---\n` +
            `Grau: ${grau}\n` +
            `Descrição: ${descricao}\n` +
            `${espessuraTexto}\n` +
            `Incidência de Vasoespasmo Sintomático: ${incidencia}\n\n` +
            `Observação: Esta escala é uma ferramenta de avaliação de risco e deve ser interpretada por um profissional de saúde qualificado. Não substitui a avaliação clínica completa.`;

        reportBox.value = textoRelatorio; // Preenche a textarea

        if (shouldDownload) {
            const blob = new Blob([textoRelatorio], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const now = new Date();
            a.download = `Relatorio_Fisher_Modificada_${now.toISOString().slice(0, 10)}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            reportBox.classList.remove("hidden"); // Mostra a textarea se não for para download imediato
        }
    }

    restartBtn.addEventListener('click', () => {
        currentQuestion = 0;
        answers = [];
        reportBox.value = ''; // Limpa o conteúdo da textarea
        reportBox.classList.add('hidden'); // Esconde a textarea
        showQuestion(); // Reinicia o quiz
    });

    // Inicia o quiz quando a página carrega
    window.onload = () => {
        showQuestion();
    };
});