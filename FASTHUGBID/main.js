const NUM_BEDS = 10;
let currentBed = 1;
let currentStep = 0;
const beds = {};

const fastHugsFields = [
    { name: "feeding", label: "F - Feeding / Fluids", desc1: "Adequate [→ Garantindo aporte nutricional adequado para evitar desnutrição e perda muscular.]", desc2: "Needs Adjustment", autoOptions: ["Revisar via de alimentação", "Ajustar calorias/líquidos", "Iniciar ou ajustar suplementação"] },
    { name: "analgesia", label: "A - Analgesia", desc1: "Adequate [Sem sedação excessiva ou controle insuficiente da dor.]", desc2: "Needs Adjustment", autoOptions: ["Aumentar dose/frequência", "Mudar tipo de analgésico", "Reavaliar causa da dor"] },
    { name: "sedation", label: "S - Sedation", desc1: "Adequate [→ Monitorar com escala RASS e ajustar para evitar sedação profunda desnecessária.]", desc2: "Needs Adjustment", autoOptions: ["Aumentar sedação", "Reduzir sedação", "Considerar suspensão diária"] },
    { name: "thromboprophylaxis", label: "T - Thromboprophylaxis", desc1: "Adequate [→ Sim, farmacológica (heparina/enoxaparina) ou mecânica (meias compressivas, compressão pneumática).]", desc2: "Needs Adjustment", autoOptions: ["Iniciar profilaxia", "Trocar tipo de profilaxia", "Avaliar contraindicações"] },
    { name: "headup", label: "H - Head-up Position", desc1: "Adequate [A cabeceira está elevada a pelo menos 30-45°]", desc2: "Needs Adjustment", autoOptions: ["Elevar cabeceira", "Contraindicação por instabilidade"] },
    { name: "ulcer", label: "U - Ulcer Prophylaxis", desc1: "Adequate [Proteção Gástrica/de Decubito/ocular]", desc2: "Needs Adjustment", autoOptions: ["Ajustar proteção gástrica", "Reavaliar risco de úlcera de pressão", "Cuidados oculares"] },
    { name: "glycemic", label: "G - Glycemic Control", desc1: "Adequate [Entre 80 e 180 mg/dl?alvo]", desc2: "Needs Adjustment", autoOptions: ["Ajustar para hiperglicemia", "Ajustar para hipoglicemia"] },
    { name: "breathing", label: "S - Spontaneous Breathing Trial", desc1: "Adequate [Estável e atendendo critérios gasométricos e clínicos.DESMAME VM/DESMAME O2]", desc2: "Needs Adjustment", autoOptions: ["Iniciar desmame da VM", "Ajustar suporte ventilatório", "Ajustar para desmame de O2"] },
    { name: "bowel", label: "B - Bowel Care", desc1: "Adequate [Dejeções e micções]", desc2: "Needs Adjustment", autoOptions: ["Constipação", "Diarréia", "Retenção urinária"] },
    { name: "catheter", label: "I - Indwelling Catheter Removal", desc1: "Adequate [Remoção ou troca em caso de necessidade/dispositivos]", desc2: "Needs Adjustment", autoOptions: ["Remover cateter", "Trocar cateter"] },
    { name: "antibiotics", label: "D - De-escalation of Antibiotics", desc1: "Adequate [Suspensão ou troca conforme cultura e antibiograma.]", desc2: "Needs Adjustment", autoOptions: ["Troca de antibiótico", "Suspender antibiótico", "Ajustar dose"] }
];
const examFields = [
    { id: "clinicalExam", label: "Clinical Exam" },
    { id: "labExam", label: "Laboratory Exam" },
    { id: "physicalExam", label: "Physical Exam" },
    { id: "imagingExam", label: "Imaging Exam" }
];

window.onload = init;

function init() {
    const bedSelect = document.getElementById('bedSelect');
    bedSelect.innerHTML = '';
    for (let i = 1; i <= NUM_BEDS; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Bed ${String(i).padStart(2, '0')}`;
        bedSelect.appendChild(opt);
    }
    bedSelect.value = currentBed;
    bedSelect.addEventListener('change', e => {
        saveBedData();
        currentBed = parseInt(e.target.value);
        loadBedData();
        showStep(0);
    });

    const evaluationDateInput = document.getElementById('evaluationDate');
    evaluationDateInput.valueAsDate = new Date();
    evaluationDateInput.addEventListener('change', () => {
        saveBedData();
        loadBedData();
    });

    renderCardsAndCharts();
    
    document.getElementById('btnPrev').onclick = () => prevStep();
    document.getElementById('btnNext').onclick = () => nextStep();
    document.getElementById('btnBedReport').onclick = () => generateBedReport();
    document.getElementById('btnAllReport').onclick = () => generateFinalReport();
    document.getElementById('btnSkip').onclick = () => skipBed();
    
    document.getElementById('btnPrev2').onclick = () => prevStep();
    document.getElementById('btnNext2').onclick = () => nextStep();
    document.getElementById('btnBedReport2').onclick = () => generateBedReport();
    document.getElementById('btnAllReport2').onclick = () => generateFinalReport();
    document.getElementById('btnSkip2').onclick = () => skipBed();
    
    // Adiciona os event listeners para os botões de rádio
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            const container = event.target.closest('.card');
            const autoOptionsContainer = container.querySelector('.auto-options-container');
            const checkboxes = container.querySelectorAll('.auto-options-container input[type="checkbox"]');
            
            if (event.target.value === 'Needs Adjustment') {
                autoOptionsContainer.style.display = 'block';
            } else {
                autoOptionsContainer.style.display = 'none';
                checkboxes.forEach(cb => cb.checked = false);
            }
        });
    });

    loadBedData();
    showStep(0);
}

function renderCardsAndCharts() {
    const container = document.getElementById('cardsAndChartsContainer');
    container.innerHTML = '';
    
    fastHugsFields.forEach(field => {
        let checkboxesHtml = field.autoOptions.map(opt => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${opt}" id="${field.name}-${opt.replace(/\s/g, '-')}-checkbox">
                <label class="form-check-label" for="${field.name}-${opt.replace(/\s/g, '-')}-checkbox">
                    ${opt}
                </label>
            </div>
        `).join('');

        const cardHtml = `
            <div class="col-md-6 mb-4">
                <div class="card p-3">
                    <h5>${field.label}</h5>
                    <div class="radio-group">
                        <div class="form-check">
                            <input type="radio" name="${field.name}" value="Adequate" class="form-check-input">
                            <label class="form-check-label">${field.desc1}</label>
                        </div>
                        <div class="form-check">
                            <input type="radio" name="${field.name}" value="Needs Adjustment" class="form-check-input">
                            <label class="form-check-label">${field.desc2}</label>
                        </div>
                    </div>
                    <textarea class="form-control mt-2 obs" data-field="${field.name}" placeholder="Observations"></textarea>
                    <div class="mt-2 auto-options-container" style="display: none;">
                        <p>Reasons for Adjustment:</p>
                        ${checkboxesHtml}
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card p-3">
                    <h5>${field.label} - Daily Progress</h5>
                    <canvas id="chart-${field.name}"></canvas>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });

    examFields.forEach(exam => {
        container.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="card p-3">
                    <h5>${exam.label}</h5>
                    <textarea class="form-control" id="${exam.id}" placeholder="${exam.label} Observations"></textarea>
                </div>
            </div>
        `;
    });
}

function showStep(idx) {
    document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
    });
    currentStep = idx;
    updatePrevButtons();
}

function nextStep() {
    saveBedData();
    if (currentStep < 1) {
        showStep(currentStep + 1);
    } else {
        nextBed();
    }
}

function prevStep() {
    saveBedData();
    if (currentStep > 0) {
        showStep(currentStep - 1);
    } else if (currentStep === 0 && currentBed > 1) {
        currentBed--;
        document.getElementById('bedSelect').value = currentBed;
        loadBedData();
        showStep(1);
    }
}

function nextBed() {
    saveBedData();
    if (currentBed < NUM_BEDS) {
        currentBed++;
        document.getElementById('bedSelect').value = currentBed;
        loadBedData();
        showStep(0);
    } else {
        alert("Último leito! Você pode gerar o relatório final.");
        loadBedData();
        showStep(0);
    }
}

function skipBed() {
    beds[currentBed] = { status: "Vago" };
    alert(`Leito ${currentBed} marcado como vago.`);
    if (currentBed < NUM_BEDS) {
        currentBed++;
        document.getElementById('bedSelect').value = currentBed;
        loadBedData();
        showStep(0);
    } else {
        alert("Último leito! Você pode gerar o relatório final.");
        loadBedData();
        showStep(0);
    }
}

function saveBedData() {
    const patientId = document.getElementById('patientId').value;
    const admissionDate = document.getElementById('admissionDate').value;
    const dischargeDate = document.getElementById('dischargeDate').value;
    const evaluationDate = document.getElementById('evaluationDate').value;

    if (!beds[currentBed]) {
        beds[currentBed] = { patientId, admissionDate, dischargeDate, days: {} };
    }
    // Salva as informações do paciente apenas se houver uma nova entrada
    if (patientId) beds[currentBed].patientId = patientId;
    if (admissionDate) beds[currentBed].admissionDate = admissionDate;
    if (dischargeDate) beds[currentBed].dischargeDate = dischargeDate;

    const evaluation = {};
    fastHugsFields.forEach(field => {
        const radios = document.querySelectorAll(`input[name="${field.name}"]`);
        let value = '';
        radios.forEach(r => { if (r.checked) value = r.value; });

        let reasons = [];
        if (value === 'Needs Adjustment') {
            const checkboxes = document.querySelectorAll(`input[type="checkbox"][id^="${field.name}-"]`);
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    reasons.push(cb.value);
                }
            });
        }
        
        const obs = document.querySelector(`textarea[data-field="${field.name}"]`)?.value || '';
        evaluation[field.name] = { value, reasons: reasons.join(', '), observation: obs };
    });
    examFields.forEach(exam => {
        evaluation[exam.id] = document.getElementById(exam.id)?.value || '';
    });
    
    beds[currentBed].days[evaluationDate] = { evaluation, costs: { feeding: 0, analgesia: 0 } };
}

function loadBedData() {
    const bed = beds[currentBed] || {};
    document.getElementById('patientId').value = bed.patientId || '';
    document.getElementById('admissionDate').value = bed.admissionDate || '';
    document.getElementById('dischargeDate').value = bed.dischargeDate || '';
    const evaluationDate = document.getElementById('evaluationDate').value;

    fastHugsFields.forEach(field => {
        document.querySelectorAll(`input[name="${field.name}"]`).forEach(r => r.checked = false);
        const obsTextarea = document.querySelector(`textarea[data-field="${field.name}"]`);
        if (obsTextarea) obsTextarea.value = '';
        const autoOptionsContainer = document.querySelector(`.card input[name="${field.name}"]`)?.closest('.card')?.querySelector('.auto-options-container');
        if (autoOptionsContainer) {
            autoOptionsContainer.style.display = 'none';
        }
    });
    examFields.forEach(exam => {
        const examTextarea = document.getElementById(exam.id);
        if (examTextarea) examTextarea.value = '';
    });
    
    const evals = bed.days?.[evaluationDate]?.evaluation || {};
    fastHugsFields.forEach(field => {
        if (evals[field.name]) {
            const value = evals[field.name].value;
            document.querySelectorAll(`input[name="${field.name}"]`).forEach(r => {
                r.checked = (r.value === value);
            });
            const obsTextarea = document.querySelector(`textarea[data-field="${field.name}"]`);
            if (obsTextarea) obsTextarea.value = evals[field.name].observation || '';
            
            const autoOptionsContainer = document.querySelector(`.card input[name="${field.name}"]`)?.closest('.card')?.querySelector('.auto-options-container');
            if (autoOptionsContainer) {
                autoOptionsContainer.style.display = (value === 'Needs Adjustment') ? 'block' : 'none';
            }
            
            document.querySelectorAll(`input[type="checkbox"][id^="${field.name}-"]`).forEach(cb => cb.checked = false);
            if (evals[field.name].reasons) {
                const reasons = evals[field.name].reasons.split(', ');
                reasons.forEach(reason => {
                    const checkbox = document.getElementById(`${field.name}-${reason.replace(/\s/g, '-')}-checkbox`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
    });
    examFields.forEach(exam => {
        if (evals[exam.id]) document.getElementById(exam.id).value = evals[exam.id];
    });

    renderCharts(bed.days);
    updatePrevButtons();
}

let charts = {};

function renderCharts(daysData) {
    if (!daysData) {
        // Limpa os gráficos se não houver dados
        for (let chartName in charts) {
            if (charts[chartName]) {
                charts[chartName].destroy();
            }
        }
        charts = {};
        return;
    }

    // Destroi os gráficos existentes para evitar duplicidade
    for (let chartName in charts) {
        if (charts[chartName]) {
            charts[chartName].destroy();
        }
    }
    charts = {};

    const dates = Object.keys(daysData).sort();
    const formattedDates = dates.map(d => new Date(d + 'T12:00:00').toLocaleDateString());

    fastHugsFields.forEach(field => {
        const scores = dates.map(date => {
            const evaluation = daysData[date].evaluation[field.name];
            return evaluation && evaluation.value === 'Adequate' ? 1 : 0;
        });

        const ctx = document.getElementById(`chart-${field.name}`).getContext('2d');
        charts[field.name] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedDates,
                datasets: [{
                    label: field.label,
                    data: scores,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.2,
                        ticks: {
                            callback: function(value) {
                                if (value === 1) return 'Adequate';
                                if (value === 0) return 'Needs Adjustment';
                                return '';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                if (value === 1) return 'Status: Adequate';
                                if (value === 0) return 'Status: Needs Adjustment';
                                return '';
                            }
                        }
                    }
                }
            }
        });
    });
}

function updatePrevButtons() {
    const prevBtns = [document.getElementById('btnPrev'), document.getElementById('btnPrev2')];
    prevBtns.forEach(btn => {
        if (btn) btn.disabled = (currentStep === 0 && currentBed === 1);
    });
}

function generateBedReport() {
    saveBedData();
    const bed = beds[currentBed];
    let relatorio = `📋 Relatório do Leito ${currentBed.toString().padStart(2, '0')}\n\n`;
    if (!bed || (!bed.patientId && !bed.status)) {
        relatorio += "Leito não avaliado\n";
    } else if (bed.status === "Vago") {
        relatorio += "Leito vago\n";
    } else {
        relatorio += `Paciente: ${bed.patientId || ''}\n`;
        relatorio += `Data de Admissão: ${bed.admissionDate || ''}\n`;
        relatorio += `Data de Alta Prevista: ${bed.dischargeDate || ''}\n\n`;
        
        const sortedDates = Object.keys(bed.days).sort();
        sortedDates.forEach(date => {
            const evals = bed.days[date].evaluation || {};
            relatorio += `--- Avaliação do dia ${new Date(date + 'T12:00:00').toLocaleDateString()} ---\n`;
            let score = 0;
            fastHugsFields.forEach(field => {
                const v = evals[field.name] || {};
                relatorio += `- ${field.label}: ${v.value || ''}\n`;
                if (v.reasons && v.reasons !== '') {
                    relatorio += `  Razões para ajuste: ${v.reasons}\n`;
                }
                if (v.observation && v.observation !== '') {
                    relatorio += `  Observação: ${v.observation}\n`;
                }
                if (v.value === "Adequate") score++;
            });
            examFields.forEach(exam => {
                relatorio += `- ${exam.label}: ${evals[exam.id] || ''}\n`;
            });
            relatorio += `Escore Diário: ${score}/${fastHugsFields.length}\n\n`;
        });
    }
    const win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Relatório do Leito ${currentBed.toString().padStart(2, '0')}</title>
            <style>
                body { font-family: monospace; white-space: pre-wrap; margin: 2em; background: #fff; color: #222; }
            </style>
        </head>
        <body>
<pre>${relatorio}</pre>
        </body>
        </html>
    `);
    win.document.close();
}

function generateFinalReport() {
    saveBedData();
    let relatorioFinal = `📋 RELATÓRIO FINAL - FAST HUGS BID\n\n`;
    for (let i = 1; i <= NUM_BEDS; i++) {
        relatorioFinal += `--- Leito ${i.toString().padStart(2, '0')} ---\n`;
        const bed = beds[i];
        if (!bed || (!bed.patientId && !bed.status)) {
            relatorioFinal += "Leito não avaliado\n\n";
        } else if (bed.status === "Vago") {
            relatorioFinal += "Leito vago\n\n";
        } else {
            relatorioFinal += `Paciente: ${bed.patientId || ''}\n`;
            relatorioFinal += `Data de Admissão: ${bed.admissionDate || ''}\n`;
            relatorioFinal += `Data de Alta Prevista: ${bed.dischargeDate || ''}\n\n`;
            
            const sortedDates = Object.keys(bed.days).sort();
            sortedDates.forEach(date => {
                const evals = bed.days[date].evaluation || {};
                relatorioFinal += `--- Avaliação do dia ${new Date(date + 'T12:00:00').toLocaleDateString()} ---\n`;
                let score = 0;
                fastHugsFields.forEach(field => {
                    const v = evals[field.name] || {};
                    relatorioFinal += `- ${field.label}: ${v.value || ''}\n`;
                    if (v.reasons && v.reasons !== '') {
                        relatorioFinal += `  Razões para ajuste: ${v.reasons}\n`;
                    }
                    if (v.observation && v.observation !== '') {
                        relatorioFinal += `  Observação: ${v.observation}\n`;
                    }
                    if (v.value === "Adequate") score++;
                });
                examFields.forEach(exam => {
                    relatorioFinal += `- ${exam.label}: ${evals[exam.id] || ''}\n`;
                });
                relatorioFinal += `Escore Diário: ${score}/${fastHugsFields.length}\n\n`;
            });
        }
    }

    const win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Relatório Final - FAST HUGS BID</title>
            <style>
                body { font-family: monospace; white-space: pre-wrap; margin: 2em; background: #fff; color: #222; }
            </style>
        </head>
        <body>
<pre>${relatorioFinal}</pre>
        </body>
        </html>
    `);
    win.document.close();
}