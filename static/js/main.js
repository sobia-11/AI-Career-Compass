/* ═══════════════════════════════════════════════════════
   AI Career Compass — Main JS v2.0
   ═══════════════════════════════════════════════════════ */

// ── Global state ─────────────────────────────────────
let lastResult = null;
let currentMode = 'dropdown';
let nlpScores = {};
let skillGapChart = null;
let modelChart = null;

// ── Skill map ─────────────────────────────────────────
const SKILL_MAP = { Low: 0, Medium: 1, High: 2 };
const SKILL_LABEL = ['Low', 'Medium', 'High'];

// ── Career colors ─────────────────────────────────────
const CAREER_COLORS = {
  'Artificial Intelligence': '#8b5cf6',
  'Data Science':            '#0ea5e9',
  'Cyber Security':          '#ef4444',
  'Web Development':         '#10b981',
  'App Development':         '#f59e0b'
};

// ─────────────────────────────────────────────────────
// SCROLL TO FORM
// ─────────────────────────────────────────────────────
function scrollToForm() {
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────────────────
// MODE TOGGLE
// ─────────────────────────────────────────────────────
function setMode(mode) {
  currentMode = mode;
  document.getElementById('dropdownMode').style.display = mode === 'dropdown' ? 'block' : 'none';
  document.getElementById('nlpMode').style.display      = mode === 'nlp'      ? 'block' : 'none';
  document.getElementById('btnDropdown').classList.toggle('active', mode === 'dropdown');
  document.getElementById('btnNLP').classList.toggle('active', mode === 'nlp');
}

// ─────────────────────────────────────────────────────
// SKILL BUTTONS
// ─────────────────────────────────────────────────────
function setSkill(btn, skillId) {
  const card = btn.closest('.skill-card');
  card.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(skillId).value = btn.dataset.val;
}

// ─────────────────────────────────────────────────────
// NLP PARSE
// ─────────────────────────────────────────────────────
async function parseNLP() {
  const text = document.getElementById('nlpText').value.trim();
  if (text.length < 20) {
    alert('Please write at least 2-3 sentences about yourself.');
    return;
  }

  const btn = document.querySelector('.btn-parse');
  btn.textContent = '⏳ Analyzing...';
  btn.disabled = true;

  try {
    const res = await fetch('/parse_nlp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();

    if (data.status === 'ok') {
      nlpScores = data.scores;
      showNLPResult(nlpScores);
      document.getElementById('btnNlpPredict').style.display = 'flex';
    } else {
      alert(data.message || 'Could not parse text.');
    }
  } catch (e) {
    alert('Network error. Please try again.');
  } finally {
    btn.textContent = '🧠 Analyze My Text →';
    btn.disabled = false;
  }
}

function showNLPResult(scores) {
  const box = document.getElementById('nlpResult');
  const skillNames = {
    math:'Math Skill', coding:'Coding Interest', creative:'Creativity',
    comm:'Communication', logic:'Logical Thinking', tech:'Tech Interest',
    team:'Teamwork', problem:'Problem Solving'
  };
  const labels = ['Low','Medium','High'];

  let html = '<h4>✅ Skills extracted from your text:</h4>';
  for (const [key, val] of Object.entries(scores)) {
    const pct = Math.round((val / 2) * 100);
    html += `
      <div class="nlp-skill-row">
        <span class="nlp-skill-name">${skillNames[key] || key}</span>
        <div class="nlp-skill-bar">
          <div class="nlp-skill-fill" style="width:${pct}%"></div>
        </div>
        <span class="nlp-skill-val" style="color:${val===2?'#0d8f63':val===1?'#0980b8':'#dc2626'}">${labels[val]}</span>
      </div>`;
  }
  html += '<p style="margin-top:12px;font-size:12px;color:#64748b">You can adjust your GPA, study hours, and name below, then click Predict.</p>';
  box.innerHTML = html;
  box.style.display = 'block';
}

// ─────────────────────────────────────────────────────
// PREDICT — DROPDOWN MODE
// ─────────────────────────────────────────────────────
async function predict() {
  const name  = document.getElementById('studentName').value.trim() || 'Student';
  const gpa   = parseFloat(document.getElementById('gpa').value);
  const study = parseFloat(document.getElementById('study').value);

  if (isNaN(gpa) || gpa < 0 || gpa > 4) { alert('GPA must be between 0.0 and 4.0'); return; }
  if (isNaN(study) || study < 0.5 || study > 15) { alert('Study hours must be between 0.5 and 15'); return; }

  const payload = {
    student_name: name,
    math:    SKILL_MAP[document.getElementById('math').value]    ?? 1,
    coding:  SKILL_MAP[document.getElementById('coding').value]  ?? 1,
    creative:SKILL_MAP[document.getElementById('creative').value]?? 1,
    comm:    SKILL_MAP[document.getElementById('comm').value]    ?? 1,
    logic:   SKILL_MAP[document.getElementById('logic').value]   ?? 1,
    tech:    SKILL_MAP[document.getElementById('tech').value]    ?? 1,
    team:    SKILL_MAP[document.getElementById('team').value]    ?? 1,
    problem: SKILL_MAP[document.getElementById('problem').value] ?? 1,
    gpa, study
  };

  await sendPrediction(payload, 'spinner');
}

// ─────────────────────────────────────────────────────
// PREDICT — NLP MODE
// ─────────────────────────────────────────────────────
async function predictNLP() {
  if (!nlpScores || Object.keys(nlpScores).length === 0) {
    alert('Please analyze your text first!'); return;
  }
  const name  = document.getElementById('nlpName').value.trim() || 'Student';
  const gpa   = parseFloat(document.getElementById('nlpGpa').value);
  const study = parseFloat(document.getElementById('nlpStudy').value);

  if (isNaN(gpa) || gpa < 0 || gpa > 4) { alert('GPA must be between 0.0 and 4.0'); return; }
  if (isNaN(study) || study < 0.5 || study > 15) { alert('Study hours must be between 0.5 and 15'); return; }

  const payload = {
    student_name: name,
    math:    nlpScores.math    ?? 1,
    coding:  nlpScores.coding  ?? 1,
    creative:nlpScores.creative?? 1,
    comm:    nlpScores.comm    ?? 1,
    logic:   nlpScores.logic   ?? 1,
    tech:    nlpScores.tech    ?? 1,
    team:    nlpScores.team    ?? 1,
    problem: nlpScores.problem ?? 1,
    gpa, study
  };

  await sendPrediction(payload, 'spinnerNLP');
}

// ─────────────────────────────────────────────────────
// SHARED PREDICTION SENDER
// ─────────────────────────────────────────────────────
async function sendPrediction(payload, spinnerId) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.style.display = 'inline';

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === 'weak_profile') {
      renderWeakProfile(data);
    } else if (data.status === 'success') {
      lastResult = data;
      renderResults(data);
    } else {
      alert(data.message || 'Prediction error');
    }
  } catch (e) {
    alert('Network error. Make sure the Flask server is running.');
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

// ─────────────────────────────────────────────────────
// RENDER RESULTS
// ─────────────────────────────────────────────────────
function renderResults(data) {
  const sec = document.getElementById('resultsSection');
  const box = document.getElementById('resultsContent');

  const adviceClass = data.advice_lvl === 'strong' ? 'advice-strong' : data.advice_lvl === 'good' ? 'advice-good' : 'advice-beg';
  const top = data.top3[0];

  // Build top-3 cards
  let top3HTML = '';
  data.top3.forEach((c, i) => {
    const col = CAREER_COLORS[c.career] || '#6366f1';
    top3HTML += `
      <div class="career-card ${i===0?'active rank-1':''}" 
           style="${i===0?`border-color:${col};box-shadow:0 8px 30px ${col}30`:''}"
           onclick="showCareerDetail(${i})">
        <div class="rank-badge">${i===0?'🥇 Best Match':i===1?'🥈 #2':'🥉 #3'}</div>
        <div class="career-icon">${c.icon}</div>
        <div class="career-name" style="color:${col}">${c.career}</div>
        <div class="career-msg">${c.smart_msg}</div>
        <div class="career-pct" style="color:${col}">${c.percent}%</div>
        <div class="career-pct-bar">
          <div class="career-pct-fill" style="width:${c.percent}%;background:${col}"></div>
        </div>
      </div>`;
  });

  // Build roadmap
  let roadmapHTML = '';
  top.roadmap.forEach((step, i) => {
    roadmapHTML += `
      <div class="roadmap-step">
        <div class="step-circle">${i+1}</div>
        <div class="step-text">${step}</div>
      </div>`;
  });

  // Build courses
  let coursesHTML = '';
  top.courses.forEach((c, i) => {
    coursesHTML += `
      <div class="course-item">
        <span class="course-num">${i+1}</span>
        <span>${c}</span>
      </div>`;
  });

  // Build tips
  let tipsHTML = '';
  if (data.tips && data.tips.length > 0) {
    tipsHTML = `<div class="tips-card">
      <h3>💡 Skill Improvement Tips</h3>
      ${data.tips.map(t => `
        <div class="tip-item">
          <span class="tip-skill">${t.skill}</span>
          <span class="tip-action">${t.action}</span>
        </div>`).join('')}
    </div>`;
  }

  box.innerHTML = `
    <!-- HERO -->
    <div class="result-hero">
      <h2>🎯 Career Prediction for</h2>
      <div class="result-name">${data.student_name}</div>
      <div class="result-sub">GPA: ${data.gpa} &nbsp;|&nbsp; Study: ${data.study}h/day &nbsp;|&nbsp; ${data.timestamp}</div>
      <div class="model-tag">✅ ${data.model_used} — ${data.model_acc}% Accuracy</div>
      <br>
      <span class="advice-badge ${adviceClass}">${data.advice}</span>
    </div>

    <!-- TOP 3 -->
    <h3 style="margin-bottom:16px;font-size:17px;">🏆 Top 3 Career Matches</h3>
    <div class="top3-grid">${top3HTML}</div>

    <!-- CHARTS -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>📊 Skill Gap Analysis — ${top.career}</h3>
        <canvas id="skillGapChart" height="250"></canvas>
      </div>
      <div class="chart-card">
        <h3>🤖 Model Accuracy Comparison</h3>
        <canvas id="modelChart" height="250"></canvas>
      </div>
    </div>

    <!-- TIPS -->
    ${tipsHTML}

    <!-- ROADMAP -->
    <div class="roadmap-card">
      <h3>🗺️ ${top.icon} Career Roadmap — ${top.career}</h3>
      <div class="roadmap-steps">${roadmapHTML}</div>
    </div>

    <!-- COURSES -->
    <div class="roadmap-card">
      <h3>📚 Recommended Courses</h3>
      <div class="courses-grid">${coursesHTML}</div>
    </div>

    <!-- PDF BUTTON -->
    <button class="btn-pdf" onclick="downloadPDF()">
      📄 Download Full PDF Report
    </button>`;

  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Draw charts after DOM update
  setTimeout(() => {
    drawSkillGapChart(data.gap_data);
    drawModelChart(data);
  }, 100);
}

// ─────────────────────────────────────────────────────
// WEAK PROFILE RENDER
// ─────────────────────────────────────────────────────
function renderWeakProfile(data) {
  const sec = document.getElementById('resultsSection');
  const box = document.getElementById('resultsContent');

  let tipsHTML = data.tips.map(t => `
    <div class="tip-item">
      <span class="tip-skill">${t.skill}</span>
      <span class="tip-action">${t.action}</span>
    </div>`).join('');

  box.innerHTML = `
    <div class="weak-card">
      <h2>🌱 Building Your Profile</h2>
      <p>${data.message}</p>
      <div class="tips-card" style="text-align:left">
        <h3>💡 Personalized Action Plan</h3>
        ${tipsHTML}
      </div>
      <p style="margin-top:16px;color:#94a3b8;font-size:13px">
        Improve these skills, then come back and try again — you'll see much stronger career matches!
      </p>
    </div>`;

  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────────────────
function drawSkillGapChart(gap) {
  if (skillGapChart) { skillGapChart.destroy(); skillGapChart = null; }
  const ctx = document.getElementById('skillGapChart');
  if (!ctx) return;

  skillGapChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: gap.labels,
      datasets: [
        {
          label: 'Your Level',
          data: gap.current,
          backgroundColor: 'rgba(99,102,241,0.75)',
          borderColor: '#6366f1',
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'Required Level',
          data: gap.required,
          backgroundColor: 'rgba(16,185,129,0.4)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#6b6886', font: { size: 11 } } }
      },
      scales: {
        y: {
          beginAtZero: true, max: 10,
          ticks: { color: '#6b6886', font: { size: 10 } },
          grid: { color: 'rgba(99,102,241,0.10)' }
        },
        x: {
          ticks: { color: '#6b6886', font: { size: 9 } },
          grid: { color: 'rgba(99,102,241,0.10)' }
        }
      }
    }
  });
}

function drawModelChart(data) {
  if (modelChart) { modelChart.destroy(); modelChart = null; }
  const ctx = document.getElementById('modelChart');
  if (!ctx) return;

  const labels = ['KNN', 'SVM', 'Logistic Reg', 'Random Forest'];
  const accs   = [
    data.knn_acc  ?? 79.6,
    data.svm_acc  ?? 93.6,
    data.lr_acc   ?? 92.4,
    data.rf_acc   ?? 94.0
  ];
  const colors = ['#f59e0b','#0ea5e9','#10b981','#8b5cf6'];

  modelChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Accuracy (%)',
        data: accs,
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 60, max: 100,
          ticks: { color: '#6b6886', font: { size: 10 }, callback: v => v + '%' },
          grid: { color: 'rgba(99,102,241,0.10)' }
        },
        x: {
          ticks: { color: '#6b6886', font: { size: 10 } },
          grid: { color: 'rgba(99,102,241,0.10)' }
        }
      }
    }
  });
}

// ─────────────────────────────────────────────────────
// PDF DOWNLOAD
// ─────────────────────────────────────────────────────
async function downloadPDF() {
  if (!lastResult) return;
  const top = lastResult.top3[0];

  const payload = {
    student_name: lastResult.student_name,
    career:       top.career,
    percent:      top.percent,
    gpa:          lastResult.gpa,
    study:        lastResult.study,
    roadmap:      top.roadmap,
    courses:      top.courses,
    smart_msg:    top.smart_msg,
    model_used:   lastResult.model_used,
    model_acc:    lastResult.model_acc,
    timestamp:    lastResult.timestamp,
    top3:         lastResult.top3
  };

  try {
    const res  = await fetch('/generate_pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `career_report_${lastResult.student_name.replace(/ /g,'_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('PDF generation failed. Please try again.');
  }
}

// ─────────────────────────────────────────────────────
// (Login / Signup / History removed)
// ─────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────
// SYNC SLIDERS ↔ INPUTS
// ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const gpaInput   = document.getElementById('gpa');
  const gpaSlider  = document.getElementById('gpaSlider');
  const studyInput = document.getElementById('study');
  const studySlider= document.getElementById('studySlider');

  if (gpaInput && gpaSlider) {
    gpaInput.addEventListener('input', () => { gpaSlider.value = gpaInput.value; });
  }
  if (studyInput && studySlider) {
    studyInput.addEventListener('input', () => { studySlider.value = studyInput.value; });
  }
});

// ─────────────────────────────────────────────────────
// SHOW CAREER DETAIL (click top3 card to re-draw roadmap)
// ─────────────────────────────────────────────────────
function showCareerDetail(idx) {
  if (!lastResult) return;
  const career = lastResult.top3[idx];
  const gapBox = document.getElementById('skillGapChart');
  if (!gapBox) return;

  // Update skill gap chart for selected career
  const gap = lastResult.gap_data; // base gap is always top1; optional: re-fetch for this career
  drawSkillGapChart(gap);

  // Scroll to charts
  gapBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
