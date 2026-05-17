const surfaceDeepQuestions = [
  'I find that at times studying gives me a feeling of deep personal satisfaction.',
  'I find that I have to do enough work on a topic so that I can form my own conclusions before I am satisfied.',
  'My aim is to pass the course while doing as little work as possible.',
  'I only study seriously what is given out in class or in the course outlines.',
  'I feel that virtually any topic can be highly interesting once I get into it.',
  'I find most new topics interesting and often spend extra time trying to obtain more information about them.',
  'I do not find my course very interesting so I keep my work to the minimum.',
  'I learn some things by rote, going over and over them until I know them by heart even if I do not understand them.',
  'I find that studying academic topics can at times be as exciting as a good novel or movie.',
  'I test myself on important topics until I understand them completely.',
  'I find I can get by in most assessments by memorising key sections rather than trying to understand them.',
  'I generally restrict my study to what is specifically set as I think it is unnecessary to do anything extra.',
  'I work hard at my studies because I find the material interesting.',
  'I spend a lot of my free time finding out more about interesting topics discussed in different classes.',
  'I find it is not helpful to study topics in depth. I confuse and waste time when all you need is a passing acquaintance with topics.',
  "I believe that lecturers shouldn't expect students to spend significant amounts of time studying material everyone knows won't be examined.",
  'I come to most classes with questions in mind that I want answering.',
  'I make a point of looking at most suggested readings that go with lectures.',
  'I see no point in learning material which is not likely to be in the examination.',
  'I find the best way to pass examinations is to try to remember answers to likely questions.',
];

const DEEP_ITEM_IDS = new Set([1, 2, 5, 6, 9, 10, 13, 14, 17, 18]);
const SCALE_OPTIONS = [
  { key: 'A', score: 1, text: 'Never or rarely true of me' },
  { key: 'B', score: 2, text: 'Sometimes true of me' },
  { key: 'C', score: 3, text: 'True about half the time' },
  { key: 'D', score: 4, text: 'Frequently true of me' },
  { key: 'E', score: 5, text: 'Always or almost always true of me' },
];

const MAX_SUBSCORE = 50;
const store = window.surfaceDeepResultHistoryStore;
const answers = Array(surfaceDeepQuestions.length).fill('');

const questionList = document.querySelector('#surface-question-list');
const form = document.querySelector('#surface-assessment-form');
const formError = document.querySelector('#surface-form-error');
const progressLabel = document.querySelector('#surface-progress-label');
const progressFill = document.querySelector('#surface-progress-fill');
const resultsSection = document.querySelector('#surface-results');
const dominantTypeEl = document.querySelector('#surface-dominant-type');
const scoreSummaryEl = document.querySelector('#surface-score-summary');
const dominantDescriptionEl = document.querySelector('#surface-dominant-description');
const testedAtEl = document.querySelector('#surface-tested-at');
const testerNameEl = document.querySelector('#surface-tester-name');
const nicknameInput = document.querySelector('#surface-nickname-input');
const barChart = document.querySelector('#surface-bar-chart');
const resetButton = document.querySelector('#surface-reset-button');
const emailInput = document.querySelector('#surface-email-recipient');
const emailSendButton = document.querySelector('#surface-email-send-button');
const emailError = document.querySelector('#surface-email-error');
const historyList = document.querySelector('#surface-history-list');
const historyEmpty = document.querySelector('#surface-history-empty');
const historyClearButton = document.querySelector('#surface-history-clear-button');

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
  const completeCount = answers.filter(Boolean).length;
  progressLabel.textContent = `${completeCount} of ${surfaceDeepQuestions.length} answered`;
  progressFill.style.width = `${(completeCount / surfaceDeepQuestions.length) * 100}%`;
}

function updateQuestionSelection(questionIndex) {
  const selectedValue = answers[questionIndex];
  const card = questionList.querySelector(`[data-question-index="${questionIndex}"]`);
  if (!card) return;
  card.classList.toggle('row-complete', Boolean(selectedValue));
  card.querySelectorAll('.rank-btn').forEach((btn) => {
    btn.classList.toggle('rank-selected', btn.dataset.answerKey === selectedValue);
  });
}

function renderQuestions() {
  questionList.innerHTML = '';
  surfaceDeepQuestions.forEach((statement, index) => {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.questionIndex = String(index);

    const top = document.createElement('div');
    top.className = 'question-top';

    const left = document.createElement('div');
    left.className = 'question-left';

    const badge = document.createElement('span');
    badge.className = 'row-badge';
    badge.textContent = String(index + 1);

    const prompt = document.createElement('p');
    prompt.className = 'question-note';
    prompt.textContent = statement;
    left.append(badge, prompt);

    const note = document.createElement('p');
    note.className = 'option-note';
    note.textContent = 'Pick one: A–E';
    top.append(left, note);

    const optionGrid = document.createElement('div');
    optionGrid.className = 'option-grid option-grid-scale';

    SCALE_OPTIONS.forEach((option) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';
      optionCard.dataset.questionIndex = String(index);
      optionCard.dataset.answerKey = option.key;

      const label = document.createElement('p');
      label.className = 'option-label';
      label.textContent = option.text;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rank-btn';
      button.dataset.questionIndex = String(index);
      button.dataset.answerKey = option.key;
      button.textContent = option.key;

      optionCard.append(label, button);
      optionGrid.append(optionCard);
    });

    card.append(top, optionGrid);
    questionList.append(card);
    updateQuestionSelection(index);
  });
  updateProgress();
}

function setAnswer(questionIndex, answerKey) {
  answers[questionIndex] = answers[questionIndex] === answerKey ? '' : answerKey;
  updateQuestionSelection(questionIndex);
  updateProgress();
  if (formError.textContent) formError.textContent = '';
}

function validateAnswers() {
  if (!nicknameInput.value.trim()) {
    return 'Please enter a nickname before submitting.';
  }
  const missingIndex = answers.findIndex((value) => !value);
  if (missingIndex !== -1) {
    return `Question ${missingIndex + 1} is incomplete.`;
  }
  return '';
}

function calculateResult() {
  return answers.reduce(
    (acc, answerKey, index) => {
      const score = SCALE_OPTIONS.find((option) => option.key === answerKey)?.score ?? 0;
      if (DEEP_ITEM_IDS.has(index + 1)) {
        acc.deepTotal += score;
      } else {
        acc.surfaceTotal += score;
      }
      return acc;
    },
    { deepTotal: 0, surfaceTotal: 0 },
  );
}

function determineDominantType(deepTotal, surfaceTotal) {
  if (deepTotal > surfaceTotal) {
    return {
      name: 'Deep approach',
      description: 'You currently show a stronger deep-learning tendency: meaning-focused, curious, and concept-driven study.',
    };
  }
  if (surfaceTotal > deepTotal) {
    return {
      name: 'Surface approach',
      description: 'You currently show a stronger surface-learning tendency: exam-focused, minimum-effort, and memorization-driven study.',
    };
  }
  return {
    name: 'Balanced',
    description: 'Your deep and surface totals are equal right now. Your approach appears mixed across contexts.',
  };
}

function createResultSnapshot(resultValues, testedAt) {
  const testedAtIso = store.toDate(testedAt).toISOString();
  snapshotCounter += 1;
  const fallbackId = `${Date.now()}-${snapshotCounter}-${Math.random().toString(16).slice(2, 10).padEnd(8, '0')}`;
  const snapshotId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : fallbackId;
  return {
    id: snapshotId,
    nickname: nicknameInput.value.trim(),
    responses: [...answers],
    deepTotal: resultValues.deepTotal,
    surfaceTotal: resultValues.surfaceTotal,
    dominantType: resultValues.dominantType,
    testedAt: testedAtIso,
  };
}

function renderBarChart(resultValues) {
  barChart.innerHTML = '';
  const chartRows = [
    { label: 'Deep', value: resultValues.deepTotal },
    { label: 'Surface', value: resultValues.surfaceTotal },
  ];

  chartRows.forEach((entry) => {
    const group = document.createElement('div');
    group.className = 'bar-group';

    const value = document.createElement('p');
    value.className = 'bar-value';
    value.textContent = String(entry.value);

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.setProperty('--bar-height', `${(entry.value / MAX_SUBSCORE) * 100}%`);
    track.append(fill);

    const label = document.createElement('p');
    label.textContent = entry.label;

    group.append(value, track, label);
    barChart.append(group);
  });
}

function renderResult(resultValues, testedAt) {
  dominantTypeEl.textContent = resultValues.dominantType;
  scoreSummaryEl.textContent = `Deep ${resultValues.deepTotal} · Surface ${resultValues.surfaceTotal}`;
  dominantDescriptionEl.textContent = resultValues.dominantDescription;
  testedAtEl.textContent = formatTestedAt(testedAt);
  if (testerNameEl) {
    testerNameEl.textContent = latestResultSnapshot && latestResultSnapshot.nickname ? latestResultSnapshot.nickname : '—';
  }
  renderBarChart(resultValues);
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
    title.textContent = `${nicknamePrefix}${itemData.dominantType} | ${store.formatScoreSummary(itemData)}`;
    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = formatTestedAt(itemData.testedAt);
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
  latestResultSnapshot = {
    ...savedResult,
    responses: Array.isArray(savedResult.responses) ? [...savedResult.responses] : null,
  };
  if (Array.isArray(latestResultSnapshot.responses)) {
    latestResultSnapshot.responses.forEach((value, index) => {
      answers[index] = value;
    });
  }
  if (nicknameInput) nicknameInput.value = savedResult.nickname || '';
  renderQuestions();
  renderResult(
    {
      deepTotal: savedResult.deepTotal,
      surfaceTotal: savedResult.surfaceTotal,
      dominantType: savedResult.dominantType,
      dominantDescription: determineDominantType(savedResult.deepTotal, savedResult.surfaceTotal).description,
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
  const deepPercent = Math.round((resultData.deepTotal / MAX_SUBSCORE) * 100);
  const surfacePercent = Math.round((resultData.surfaceTotal / MAX_SUBSCORE) * 100);
  return [
    'Surface vs Deep Learners Result',
    '',
    ...(resultData.nickname ? [`Tester: ${resultData.nickname}`, ''] : []),
    `Tested at: ${formatTestedAt(resultData.testedAt)}`,
    `Dominant approach: ${resultData.dominantType}`,
    '',
    `Deep total: ${resultData.deepTotal} / ${MAX_SUBSCORE} (${deepPercent}%)`,
    `Surface total: ${resultData.surfaceTotal} / ${MAX_SUBSCORE} (${surfacePercent}%)`,
  ].join('\n');
}

function sendResultByEmail() {
  if (!latestResultSnapshot) return;
  const recipient = emailInput.value.trim();
  if (!isValidOrEmptyEmailAddress(recipient)) {
    emailError.textContent = 'Please enter a valid email address or leave it empty.';
    return;
  }
  const subject = `Surface vs Deep Result (${formatEmailSubjectDate(latestResultSnapshot.testedAt)})`;
  const body = buildEmailBody(latestResultSnapshot);
  emailError.textContent = '';
  window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

questionList.addEventListener('click', (event) => {
  const optionCard = event.target.closest('.option-card[data-question-index][data-answer-key]');
  if (!optionCard || !questionList.contains(optionCard)) return;
  setAnswer(Number(optionCard.dataset.questionIndex), optionCard.dataset.answerKey);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = validateAnswers();
  if (message) {
    formError.textContent = message;
    resultsSection.classList.add('hidden');
    return;
  }

  const scores = calculateResult();
  const dominantMeta = determineDominantType(scores.deepTotal, scores.surfaceTotal);
  const resultValues = {
    deepTotal: scores.deepTotal,
    surfaceTotal: scores.surfaceTotal,
    dominantType: dominantMeta.name,
    dominantDescription: dominantMeta.description,
  };

  latestResultSnapshot = createResultSnapshot(resultValues, new Date());
  appendResultToHistory(latestResultSnapshot);
  renderResult(resultValues, latestResultSnapshot.testedAt);
  formError.textContent = '';
  emailError.textContent = '';
});

resetButton.addEventListener('click', () => {
  answers.fill('');
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
