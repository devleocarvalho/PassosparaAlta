document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            question: "1. Nível de consciência",
            options: ["Alerta (0)", "Sonolento, mas despertável com mínima estimulação (1)", "Sonolento, requer estimulação repetida (2)", "Coma (3)"],
            values: [0, 1, 2, 3]
        },
        {
            question: "2. Orientação (pergunta de data e idade)",
            options: ["Responde a ambas corretamente (0)", "Responde a uma corretamente (1)", "Erra ambas (2)"],
            values: [0, 1, 2]
        },
        {
            question: "3. Comandos (abrir olhos, abrir boca)",
            options: ["Obedece corretamente (0)", "Erra uma ou ambas (1)", "Não obedece (2)"],
            values: [0, 1, 2]
        },
        {
            question: "4. Movimento ocular horizontal",
            options: ["Normal (0)", "Parcial (1)", "Desvio forçado (2)"],
            values: [0, 1, 2]
        },
        {
            question: "5. Campos visuais",
            options: ["Sem déficit (0)", "Hemianopsia parcial (1)", "Hemianopsia total (2)", "Amaurose cortical (3)"],
            values: [0, 1, 2, 3]
        },
        {
            question: "6. Paresia facial",
            options: ["Normal (0)", "Leve (1)", "Moderada (2)", "Paralisia total (3)"],
            values: [0, 1, 2, 3]
        },
        {
            question: "7. Força membro superior direito",
            options: ["Normal (0)", "Cai após 10s (1)", "Contra gravidade (2)", "Movimento fraco (3)", "Sem movimento (4)", "Não testável (9)"],
            values: [0, 1, 2, 3, 4, 9]
        },
        {
            question: "8. Força membro superior esquerdo",
            options: ["Normal (0)", "Cai após 10s (1)", "Contra gravidade (2)", "Movimento fraco (3)", "Sem movimento (4)", "Não testável (9)"],
            values: [0, 1, 2, 3, 4, 9]
        },
        {
            question: "9. Força membro inferior direito",
            options: ["Normal (0)", "Cai após 5s (1)", "Contra gravidade (2)", "Movimento fraco (3)", "Sem movimento (4)", "Não testável (9)"],
            values: [0, 1, 2, 3, 4, 9]
        },
        {
            question: "10. Ataxia",
            options: ["Ausente (0)", "Um membro (1)", "Dois membros (2)"],
            values: [0, 1, 2]
        },
        {
            question: "11. Linguagem",
            options: ["Normal (0)", "Leve a moderada (1)", "Grave (2)", "Muda (3)"],
            values: [0, 1, 2, 3]
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let answers = [];

    const quizContainer = document.getElementById("quizContainer");
    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const nextBtn = document.getElementById("next-btn");

    const resultContainer = document.getElementById("resultContainer");
    const totalScoreEl = document.getElementById("totalScore");
    const strokeLevelEl = document.getElementById("strokeLevel");
    const resultDescriptionEl = document.getElementById("resultDescription");
    const prognosisEl = document.getElementById("prognosis");

    const botoesAcaoEl = document.getElementById("botoesAcao");
    const gerarRelatorioBtn = document.getElementById("gerarRelatorio");
    const retestarBtn = document.getElementById("retestar");
    const reportBox = document.getElementById("report-box");

    function showQuestion(index) {
        quizContainer.classList.remove("hidden");
        nextBtn.classList.remove("hidden");

        resultContainer.classList.add("hidden");
        botoesAcaoEl.style.display = 'none';
        reportBox.classList.add("hidden");

        const q = questions[index];
        questionEl.textContent = q.question;
        optionsEl.innerHTML = "";

        q.options.forEach((opt, i) => {
            const label = document.createElement("label");
            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = "option";
            radioInput.value = q.values[i];

            const spanText = document.createElement("span");
            spanText.textContent = opt;

            label.appendChild(radioInput);
            label.appendChild(spanText);

            optionsEl.appendChild(label);
        });
    }

    function calculateResultAndPrognosis() {
        let level = "";
        let description = "";
        let prognosisInfo = "";

        if (score === 0) {
            level = "Exame neurológico normal.";
            description = "A pontuação NIHSS de 0 indica ausência de sinais neurológicos agudos de AVC.";
            prognosisInfo = "Prognóstico: Excelente recuperação é esperada. Risco de morte ou dependência funcional muito baixo.";
        } else if (score <= 4) {
            level = "AVC menor.";
            description = "Pontuação NIHSS de 1-4 sugere um AVC leve, mas ainda requer atenção médica imediata.";
            prognosisInfo = "Prognóstico: Boa recuperação funcional é comum, mas o risco de déficit residual existe. Risco de morte baixo.";
        } else if (score <= 15) {
            level = "AVC moderado.";
            description = "Pontuação NIHSS de 5-15 indica um AVC moderado, necessitando de intervenção e monitoramento intensivo.";
            prognosisInfo = "Prognóstico: A recuperação funcional é possível, mas muitos pacientes terão alguma dependência. O risco de morte é moderado.";
        } else if (score <= 20) {
            level = "AVC moderado a grave.";
            description = "Pontuação NIHSS de 16-20 é um AVC moderado a grave, com grande impacto na funcionalidade.";
            prognosisInfo = "Prognóstico: Alta probabilidade de dependência funcional significativa. Risco de morte elevado.";
        } else {
            level = "AVC grave.";
            description = "Pontuação NIHSS acima de 20 indica um AVC grave, com comprometimento neurológico significativo e prognóstico reservado.";
            prognosisInfo = "Prognóstico: Muito alta probabilidade de dependência grave ou morte. Recuperação funcional completa é rara.";
        }
        return { level, description, prognosisInfo };
    }

    nextBtn.addEventListener("click", () => {
        const selected = document.querySelector("input[name='option']:checked");
        if (!selected) {
            alert("Por favor, selecione uma opção antes de prosseguir.");
            return;
        }

        const val = parseInt(selected.value);
        score += val;
        answers.push({
            pergunta: questions[currentQuestion].question,
            resposta: selected.nextElementSibling.textContent,
            pontos: val
        });

        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion(currentQuestion);
        } else {
            quizContainer.classList.add("hidden");
            nextBtn.classList.add("hidden");

            resultContainer.classList.remove("hidden");
            resultContainer.classList.add("fadeIn");

            const result = calculateResultAndPrognosis();
            totalScoreEl.innerHTML = `Pontuação total: <strong>${score}</strong>`;
            strokeLevelEl.textContent = `Classificação: ${result.level}`;
            resultDescriptionEl.textContent = `Descrição: ${result.description}`;
            prognosisEl.textContent = `${result.prognosisInfo}`;

            botoesAcaoEl.style.display = 'flex';
        }
    });

    retestarBtn.addEventListener("click", () => {
        score = 0;
        currentQuestion = 0;
        answers = [];
        reportBox.value = '';
        reportBox.classList.add("hidden");

        showQuestion(currentQuestion);
    });

    gerarRelatorioBtn.addEventListener("click", () => {
        let reportContent = "RELATÓRIO DA ESCALA NIHSS\n\n";

        // Obtém a data e hora atual
        const now = new Date();
        const dateTime = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
        reportContent += `Data e Hora da Avaliação: ${dateTime}\n\n`;

        answers.forEach((ans, i) => {
            reportContent += `${i + 1}. ${ans.pergunta}\nResposta: ${ans.resposta} (Pontos: ${ans.pontos})\n\n`;
        });

        const finalResult = calculateResultAndPrognosis();
        reportContent += `--- Resumo Final ---\n`;
        reportContent += `Pontuação Total: ${score}\n`;
        reportContent += `Classificação do AVC: ${finalResult.level}\n`;
        reportContent += `Descrição: ${finalResult.description}\n`;
        reportContent += `Prognóstico: ${finalResult.prognosisInfo}\n\n`;
        reportContent += "Este relatório é uma ferramenta de avaliação inicial e educacional. Para um diagnóstico preciso, prognóstico individualizado e manejo adequado, consulte sempre um profissional de saúde qualificado. A Escala NIHSS é uma ferramenta de avaliação rápida e não substitui a avaliação clínica completa.";

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_NIHSS_${new Date().toISOString().slice(0, 10)}.txt`; 
        document.body.appendChild(a);
        a.click(); 
       
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        reportBox.value = reportContent;
        reportBox.classList.remove("hidden");
        reportBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    showQuestion(currentQuestion);
});