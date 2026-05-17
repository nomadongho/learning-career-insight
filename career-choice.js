// Section 1 (v1–v26): How important are the following factors to you in choosing a career?
// Section 2 (q1–q7):  How influential are the following to you in choosing a career?
// Factor/construct grouping based on the career-choice structural model.
const careerChoiceItems = [
  { id: 'v1',  label: 'Status of career',                          scale: 'importance' },
  { id: 'v2',  label: 'Good long-range earnings potential',         scale: 'importance' },
  { id: 'v3',  label: 'High initial salary',                        scale: 'importance' },
  { id: 'v4',  label: 'Chance to exercise leadership',              scale: 'importance' },
  { id: 'v5',  label: 'Opportunities for promotion',                scale: 'importance' },
  { id: 'v6',  label: 'Opportunity for self-employment',            scale: 'importance' },
  { id: 'v7',  label: 'Adequate leisure time',                      scale: 'importance' },
  { id: 'v8',  label: 'Family-friendly work schedules',             scale: 'importance' },
  { id: 'v9',  label: 'Ease of gaining qualifications',             scale: 'importance' },
  { id: 'v10', label: 'Cost of education',                          scale: 'importance' },
  { id: 'v11', label: 'Years of formal education',                  scale: 'importance' },
  { id: 'v12', label: 'Opportunity to work with the public',        scale: 'importance' },
  { id: 'v13', label: 'Opportunity to help others',                 scale: 'importance' },
  { id: 'v14', label: 'Being part of a team',                       scale: 'importance' },
  { id: 'v15', label: 'Job security',                               scale: 'importance' },
  { id: 'v16', label: 'Availability of employment',                 scale: 'importance' },
  { id: 'v17', label: 'Good working conditions',                    scale: 'importance' },
  { id: 'v18', label: 'Intellectual challenge',                     scale: 'importance' },
  { id: 'v19', label: 'Aptitude for career (flair for subject)',    scale: 'importance' },
  { id: 'v20', label: 'Job satisfaction',                           scale: 'importance' },
  { id: 'v21', label: 'Variety of work',                            scale: 'importance' },
  { id: 'v22', label: "Parents' occupation",                        scale: 'importance' },
  { id: 'v23', label: 'Study of subject in school',                 scale: 'importance' },
  { id: 'v24', label: 'Remaining in the area where I grew up',      scale: 'importance' },
  { id: 'v25', label: 'Previous work experience',                   scale: 'importance' },
  { id: 'v26', label: 'Opportunity to travel',                      scale: 'importance' },
  { id: 'q1',  label: 'Parents',                                    scale: 'influence' },
  { id: 'q2',  label: 'Teachers',                                   scale: 'influence' },
  { id: 'q3',  label: 'Peers and friends',                          scale: 'influence' },
  { id: 'q4',  label: 'Relatives and family friends',               scale: 'influence' },
  { id: 'q5',  label: 'Career guidance counsellors',                scale: 'influence' },
  { id: 'q6',  label: 'Visiting speakers',                          scale: 'influence' },
  { id: 'q7',  label: 'Promotional material',                       scale: 'influence' },
];

const IMPORTANCE_SCALE_OPTIONS = [
  { value: 5, text: 'Very important' },
  { value: 4, text: 'Important' },
  { value: 3, text: 'Not so important' },
  { value: 2, text: 'Unimportant' },
  { value: 1, text: 'Very unimportant' },
];

const INFLUENCE_SCALE_OPTIONS = [
  { value: 5, text: 'Very influential' },
  { value: 4, text: 'Influential' },
  { value: 3, text: 'Not so influential' },
  { value: 2, text: 'Uninfluential' },
  { value: 1, text: 'Very uninfluential' },
];

// Nine factors organised into four constructs (structural model).
const FACTORS = {
  prestigeFinancial:    { label: 'Prestige & financial',   items: ['v1','v2','v3','v4','v5'] },
  securityOfEmployment: { label: 'Security of employment', items: ['v6','v9','v10','v11','v15','v16','v17'] },
  workLifeBalance:      { label: 'Work-life balance',      items: ['v7','v8'] },
  selfFulfilment:       { label: 'Self-fulfilment',        items: ['v18','v19','v20','v21'] },
  goodCitizen:          { label: 'Good citizen',           items: ['v12','v13','v14'] },
  looseRelations:       { label: 'Loose relations',        items: ['q5','q6','q7'] },
  closeRelations:       { label: 'Close relations',        items: ['q1','q2','q3','q4'] },
  predisposition:       { label: 'Predisposition',         items: ['v22','v23','v24','v25'] },
  travel:               { label: 'Travel',                 items: ['v26'] },
};

const CONSTRUCTS = {
  extrinsic:     { label: 'Extrinsic',      factors: ['prestigeFinancial','securityOfEmployment','workLifeBalance'] },
  intrinsic:     { label: 'Intrinsic',      factors: ['selfFulfilment','goodCitizen'] },
  interpersonal: { label: 'Interpersonal',  factors: ['looseRelations','closeRelations'] },
  other:         { label: 'Other',          factors: ['predisposition','travel'] },
};

const CONSTRUCT_DESCRIPTIONS = {
  extrinsic:     'Your responses emphasize external rewards, employment security, and work-life conditions.',
  intrinsic:     'Your responses emphasize personal fulfilment and contributing to society.',
  interpersonal: 'Your responses are most shaped by the people around you — both close ties and wider social circles.',
  other:         'Your responses are most shaped by personal background and lifestyle preferences.',
  balanced:      'Your construct scores are tied, suggesting a balanced range of career influences.',
};

const store = window.careerChoiceResultHistoryStore;
const answers = Object.fromEntries(careerChoiceItems.map((item) => [item.id, 0]));

const questionList = document.querySelector('#career-question-list');
const form = document.querySelector('#career-assessment-form');
const formError = document.querySelector('#career-form-error');
const progressLabel = document.querySelector('#career-progress-label');
const progressFill = document.querySelector('#career-progress-fill');
const careerIntentInput = document.querySelector('#career-intent-input');
const resultsSection = document.querySelector('#career-results');
const intentResultEl = document.querySelector('#career-intent-result');
const dominantFactorEl = document.querySelector('#career-dominant-factor');
const dominantDescriptionEl = document.querySelector('#career-dominant-description');
const testedAtEl = document.querySelector('#career-tested-at');
const testerNameEl = document.querySelector('#career-tester-name');
const nicknameInput = document.querySelector('#career-nickname-input');
const barChart = document.querySelector('#career-bar-chart');
const resetButton = document.querySelector('#career-reset-button');
const emailInput = document.querySelector('#career-email-recipient');
const emailSendButton = document.querySelector('#career-email-send-button');
const emailError = document.querySelector('#career-email-error');
const historyList = document.querySelector('#career-history-list');
const historyEmpty = document.querySelector('#career-history-empty');
const historyClearButton = document.querySelector('#career-history-clear-button');

const emailValidationInput = document.createElement('input');
emailValidationInput.type = 'email';

let savedHistory = [];
let latestResultSnapshot = null;
let snapshotCounter = 0;

function formatTestedAt(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(store.toDate(dateValue));
}

function formatEmailSubjectDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(store.toDate(dateValue));
}

function updateProgress() {
  const completeCount = Object.values(answers).filter((value) => value > 0).length;
  progressLabel.textContent = `${completeCount} of ${careerChoiceItems.length} answered`;
  progressFill.style.width = `${(completeCount / careerChoiceItems.length) * 100}%`;
}

function updateQuestionSelection(itemId) {
  const selectedValue = answers[itemId];
  const card = questionList.querySelector(`[data-item-id="${itemId}"]`);
  if (!card) return;
  card.classList.toggle('row-complete', selectedValue > 0);
  card.querySelectorAll('.rank-btn').forEach((btn) => {
    btn.classList.toggle('rank-selected', Number(btn.dataset.answerValue) === selectedValue);
  });
}

function renderQuestions() {
  questionList.innerHTML = '';

  let currentSection = null;

  careerChoiceItems.forEach((item) => {
    // Insert section header when scale changes
    if (item.scale !== currentSection) {
      currentSection = item.scale;
      const header = document.createElement('div');
      header.className = 'question-section-header';
      const heading = document.createElement('p');
      heading.className = 'question-section-title';
      heading.textContent =
        item.scale === 'importance'
          ? 'How important are the following factors to you in choosing a career?'
          : 'How influential are the following to you in choosing a career?';
      header.append(heading);
      questionList.append(header);
    }

    const scaleOptions = item.scale === 'influence' ? INFLUENCE_SCALE_OPTIONS : IMPORTANCE_SCALE_OPTIONS;

    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.itemId = item.id;

    const top = document.createElement('div');
    top.className = 'question-top';

    const left = document.createElement('div');
    left.className = 'question-left';

    const badge = document.createElement('span');
    badge.className = 'row-badge';
    badge.textContent = item.id.toUpperCase();

    const prompt = document.createElement('p');
    prompt.className = 'question-note';
    prompt.textContent = item.label;
    left.append(badge, prompt);

    const note = document.createElement('p');
    note.className = 'option-note';
    note.textContent = 'Pick one: 1–5';
    top.append(left, note);

    const optionGrid = document.createElement('div');
    optionGrid.className = 'option-grid option-grid-scale';

    scaleOptions.forEach((option) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';
      optionCard.dataset.itemId = item.id;
      optionCard.dataset.answerValue = String(option.value);

      const label = document.createElement('p');
      label.className = 'option-label';
      label.textContent = option.text;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rank-btn';
      button.dataset.itemId = item.id;
      button.dataset.answerValue = String(option.value);
      button.textContent = String(option.value);

      optionCard.append(label, button);
      optionGrid.append(optionCard);
    });

    card.append(top, optionGrid);
    questionList.append(card);
    updateQuestionSelection(item.id);
  });

  updateProgress();
}

function setAnswer(itemId, answerValue) {
  answers[itemId] = answers[itemId] === answerValue ? 0 : answerValue;
  updateQuestionSelection(itemId);
  updateProgress();
  if (formError.textContent) formError.textContent = '';
}

function validateAnswers() {
  if (!nicknameInput.value.trim()) {
    return 'Please enter a nickname before submitting.';
  }

  const intendedCareer = careerIntentInput.value.trim();
  if (!intendedCareer) {
    return 'Please enter your intended career.';
  }

  const missingItem = careerChoiceItems.find((item) => answers[item.id] === 0);
  if (missingItem) {
    return `"${missingItem.label}" is incomplete.`;
  }
  return '';
}

function calculateFactorScores() {
  const factorScores = {};
  Object.entries(FACTORS).forEach(([key, factor]) => {
    const total = factor.items.reduce((sum, id) => sum + answers[id], 0);
    factorScores[key] = total / factor.items.length;
  });
  return factorScores;
}

function calculateConstructScores(factorScores) {
  const constructScores = {};
  Object.entries(CONSTRUCTS).forEach(([key, construct]) => {
    const total = construct.factors.reduce((sum, fKey) => sum + factorScores[fKey], 0);
    constructScores[key] = total / construct.factors.length;
  });
  return constructScores;
}

function determineDominantConstruct(constructScores) {
  const entries = Object.entries(constructScores);
  const maxScore = Math.max(...entries.map(([, v]) => v));
  const winners = entries.filter(([, v]) => v === maxScore);
  if (winners.length !== 1) {
    return { key: 'balanced', title: 'Balanced influences', description: CONSTRUCT_DESCRIPTIONS.balanced };
  }
  const [key] = winners[0];
  return { key, title: CONSTRUCTS[key].label, description: CONSTRUCT_DESCRIPTIONS[key] };
}

function createResultSnapshot(career, factorScores, dominantConstruct, testedAt) {
  const testedAtIso = store.toDate(testedAt).toISOString();
  snapshotCounter += 1;
  const fallbackId = `${Date.now()}-${snapshotCounter}-${Math.random().toString(16).slice(2, 10)}`;
  const snapshotId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : fallbackId;
  return {
    id: snapshotId,
    nickname: nicknameInput.value.trim(),
    career,
    ratings: { ...answers },
    factorScores: { ...factorScores },
    dominantFactorKey: dominantConstruct.key,
    testedAt: testedAtIso,
  };
}

function renderBarChart(constructScores) {
  barChart.innerHTML = '';

  Object.keys(CONSTRUCTS).forEach((key) => {
    const labelText = CONSTRUCTS[key].label;
    const value = constructScores[key];

    const group = document.createElement('div');
    group.className = 'bar-group';

    const valueEl = document.createElement('p');
    valueEl.className = 'bar-value';
    valueEl.textContent = value.toFixed(2);

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.setProperty('--bar-height', `${(value / 5) * 100}%`);
    track.append(fill);

    const label = document.createElement('p');
    label.textContent = labelText;

    group.append(valueEl, track, label);
    barChart.append(group);
  });
}

function renderResultTable(factorScores, constructScores) {
  const tableWrap = document.querySelector('#career-result-table');
  tableWrap.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'result-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Factors', 'Average scores (factors)', 'Average scores (constructs)', 'Constructs'].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.append(th);
  });
  thead.append(headerRow);
  table.append(thead);

  const tbody = document.createElement('tbody');

  Object.entries(CONSTRUCTS).forEach(([constructKey, construct]) => {
    const factorCount = construct.factors.length;

    construct.factors.forEach((factorKey, idx) => {
      const tr = document.createElement('tr');

      // Factor name cell
      const tdFactor = document.createElement('td');
      tdFactor.textContent = FACTORS[factorKey].label;
      tr.append(tdFactor);

      // Factor average score cell
      const tdFactorScore = document.createElement('td');
      tdFactorScore.className = 'factor-score-cell';
      tdFactorScore.textContent = factorScores[factorKey].toFixed(2);
      tr.append(tdFactorScore);

      // Construct average score cell — only on first row, spans all factor rows
      if (idx === 0) {
        const tdConstructScore = document.createElement('td');
        tdConstructScore.className = 'construct-avg-cell';
        tdConstructScore.rowSpan = factorCount;
        tdConstructScore.textContent = constructScores[constructKey].toFixed(2);
        tr.append(tdConstructScore);

        // Construct name cell — same rowspan
        const tdConstruct = document.createElement('td');
        tdConstruct.className = 'construct-cell';
        tdConstruct.rowSpan = factorCount;
        tdConstruct.textContent = construct.label;
        tr.append(tdConstruct);
      }

      tbody.append(tr);
    });
  });

  table.append(tbody);
  tableWrap.append(table);
}

function renderResult(resultData, testedAt) {
  intentResultEl.textContent = resultData.career;
  dominantFactorEl.textContent = resultData.dominantConstruct.title;
  dominantDescriptionEl.textContent = resultData.dominantConstruct.description;
  testedAtEl.textContent = formatTestedAt(testedAt);
  if (testerNameEl) {
    testerNameEl.textContent = latestResultSnapshot && latestResultSnapshot.nickname ? latestResultSnapshot.nickname : '—';
  }
  const constructScores = calculateConstructScores(resultData.factorScores);
  renderBarChart(constructScores);
  renderResultTable(resultData.factorScores, constructScores);
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSavedHistory() {
  historyList.innerHTML = '';
  if (savedHistory.length === 0) {
    historyEmpty.classList.remove('hidden');
    return;
  }
  historyEmpty.classList.add('hidden');

  savedHistory.forEach((itemData) => {
    const item = document.createElement('li');
    item.className = 'history-item history-link-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.dataset.historyId = itemData.id;

    const copyWrap = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'history-title';
    const nicknamePrefix = itemData.nickname ? `[${itemData.nickname}] ` : '';
    title.textContent = `${nicknamePrefix}${itemData.career} | ${CONSTRUCTS[itemData.dominantFactorKey]?.label ?? 'Balanced influences'}`;

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = `${store.formatScoreSummary(itemData.factorScores)} · ${formatTestedAt(itemData.testedAt)}`;
    copyWrap.append(title, meta);

    item.append(copyWrap);
    historyList.append(item);
  });
}

function appendResultToHistory(snapshot) {
  savedHistory = [snapshot, ...savedHistory].slice(0, store.limit);
  store.persist(savedHistory);
  renderSavedHistory();
}

function loadResultById(resultId) {
  const savedResult = savedHistory.find((item) => item.id === resultId);
  if (!savedResult) return;
  latestResultSnapshot = { ...savedResult };
  if (savedResult.ratings && typeof savedResult.ratings === 'object') {
    careerChoiceItems.forEach((item) => {
      if (item.id in savedResult.ratings) {
        answers[item.id] = savedResult.ratings[item.id];
      }
    });
  }
  if (nicknameInput) nicknameInput.value = savedResult.nickname || '';
  if (careerIntentInput) careerIntentInput.value = savedResult.career || '';
  renderQuestions();
  const dominantConstructKey = savedResult.dominantFactorKey || 'balanced';
  renderResult(
    {
      career: savedResult.career,
      factorScores: savedResult.factorScores,
      dominantConstruct: {
        key: dominantConstructKey,
        title: CONSTRUCTS[dominantConstructKey]?.label ?? 'Balanced influences',
        description: CONSTRUCT_DESCRIPTIONS[dominantConstructKey] ?? CONSTRUCT_DESCRIPTIONS.balanced,
      },
    },
    savedResult.testedAt,
  );
}

function loadResultFromQuery() {
  const requestedResultId = new URLSearchParams(window.location.search).get('resultId');
  if (!requestedResultId) return;
  loadResultById(requestedResultId);
}

function isValidOrEmptyEmailAddress(value) {
  if (!value) return true;
  emailValidationInput.value = value;
  return emailValidationInput.checkValidity();
}

function buildEmailBody(resultData) {
  const dominantConstructLabel = CONSTRUCTS[resultData.dominantFactorKey]?.label ?? 'Balanced influences';
  const constructScores = calculateConstructScores(resultData.factorScores);
  const lines = [
    '3 Factors of Career Choice Result',
    '',
    ...(resultData.nickname ? [`Tester: ${resultData.nickname}`, ''] : []),
    `Intended career: ${resultData.career}`,
    `Tested at: ${formatTestedAt(resultData.testedAt)}`,
    `Dominant construct: ${dominantConstructLabel}`,
    '',
    'Factor scores:',
    ...Object.entries(FACTORS).map(([key, f]) => `  ${f.label}: ${resultData.factorScores[key].toFixed(2)} / 5`),
    '',
    'Construct scores:',
    ...Object.entries(CONSTRUCTS).map(([key, c]) => `  ${c.label}: ${constructScores[key].toFixed(2)} / 5`),
  ];
  return lines.join('\n');
}

function sendResultByEmail() {
  if (!latestResultSnapshot) return;

  const recipient = emailInput.value.trim();
  if (!isValidOrEmptyEmailAddress(recipient)) {
    emailError.textContent = 'Please enter a valid email address or leave it empty.';
    return;
  }

  const subject = `Career Choice Result (${formatEmailSubjectDate(latestResultSnapshot.testedAt)})`;
  const body = buildEmailBody(latestResultSnapshot);
  emailError.textContent = '';
  window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

questionList.addEventListener('click', (event) => {
  const optionCard = event.target.closest('.option-card[data-item-id][data-answer-value]');
  if (!optionCard || !questionList.contains(optionCard)) return;
  setAnswer(optionCard.dataset.itemId, Number(optionCard.dataset.answerValue));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = validateAnswers();
  if (message) {
    formError.textContent = message;
    resultsSection.classList.add('hidden');
    return;
  }

  const career = careerIntentInput.value.trim();
  const factorScores = calculateFactorScores();
  const constructScores = calculateConstructScores(factorScores);
  const dominantConstruct = determineDominantConstruct(constructScores);
  const resultValues = {
    career,
    factorScores,
    dominantConstruct,
  };

  latestResultSnapshot = createResultSnapshot(career, factorScores, dominantConstruct, new Date());
  appendResultToHistory(latestResultSnapshot);
  renderResult(resultValues, latestResultSnapshot.testedAt);
  formError.textContent = '';
  emailError.textContent = '';
});

resetButton.addEventListener('click', () => {
  careerIntentInput.value = '';
  careerChoiceItems.forEach((item) => {
    answers[item.id] = 0;
  });
  latestResultSnapshot = null;
  formError.textContent = '';
  emailError.textContent = '';
  testedAtEl.textContent = '—';
  resultsSection.classList.add('hidden');
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

emailSendButton.addEventListener('click', sendResultByEmail);

historyList.addEventListener('click', (event) => {
  const item = event.target.closest('.history-item[data-history-id]');
  if (!item) return;
  loadResultById(item.dataset.historyId);
});

historyList.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  const item = event.target.closest('.history-item[data-history-id]');
  if (!item) return;
  loadResultById(item.dataset.historyId);
});

historyClearButton.addEventListener('click', () => {
  savedHistory = [];
  store.persist(savedHistory);
  renderSavedHistory();
});

savedHistory = store.load();
renderQuestions();
renderSavedHistory();
loadResultFromQuery();
