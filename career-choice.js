const careerChoiceItems = [
  { id: 'longRangeEarningPotential', label: 'Good long-range earning potential' },
  { id: 'costOfEducation', label: 'Cost of education' },
  { id: 'jobSatisfaction', label: 'Job satisfaction' },
  { id: 'senseOfCareer', label: 'Sense of career' },
  { id: 'yearsOfFormalEducation', label: 'Years of formal education' },
  { id: 'highInitialSalary', label: 'High initial salary' },
  { id: 'intellectualChallenge', label: 'Intellectual challenge' },
  { id: 'aptitudeForCareer', label: 'Aptitude for career (fit for subject)' },
  { id: 'previousWorkExperience', label: 'Previous work experience' },
  { id: 'availabilityOfEmployment', label: 'Availability of employment' },
  { id: 'opportunitiesForPromotions', label: 'Opportunities for promotions' },
  { id: 'adequateLeisureTime', label: 'Adequate leisure time' },
  { id: 'opportunityToHelpOthers', label: 'Opportunity to help others' },
  { id: 'opportunityToWorkWithPublic', label: 'Opportunity to work with the public' },
  { id: 'beingPartOfTeam', label: 'Being part of a team' },
  { id: 'opportunityToTravel', label: 'Opportunity to travel' },
  { id: 'parentsOccupations', label: "Parents' occupations" },
  { id: 'selfEmploymentOpportunities', label: 'Self employment opportunities' },
  { id: 'jobSecurity', label: 'Job security' },
  { id: 'varietyOfWork', label: 'Variety of work' },
  { id: 'familyFriendlyWorkSchedule', label: 'Family friendly work schedule' },
];

const CAREER_SCALE_OPTIONS = [
  { value: 5, text: 'Very influential' },
  { value: 4, text: 'Influential' },
  { value: 3, text: 'Not so influential' },
  { value: 2, text: 'Unimportant' },
  { value: 1, text: 'Very unimportant' },
];

const FACTOR_LABELS = {
  personalFitAndRewards: 'Career priorities (Cluster A)',
  workConditionsAndStability: 'Career priorities (Cluster B)',
  socialAndServiceOrientation: 'Career priorities (Cluster C)',
  balanced: 'Balanced influences',
};

const FACTOR_DESCRIPTIONS = {
  personalFitAndRewards:
    'Your highest average score is in Cluster A.',
  workConditionsAndStability:
    'Your highest average score is in Cluster B.',
  socialAndServiceOrientation:
    'Your highest average score is in Cluster C.',
  balanced: 'Your factor scores are tied, so your current career decision appears balanced across multiple influences.',
};

const FACTOR_GROUPS = {
  personalFitAndRewards: [
    'longRangeEarningPotential',
    'costOfEducation',
    'jobSatisfaction',
    'senseOfCareer',
    'yearsOfFormalEducation',
    'highInitialSalary',
    'intellectualChallenge',
    'aptitudeForCareer',
    'previousWorkExperience',
    'parentsOccupations',
  ],
  workConditionsAndStability: [
    'availabilityOfEmployment',
    'opportunitiesForPromotions',
    'adequateLeisureTime',
    'opportunityToTravel',
    'selfEmploymentOpportunities',
    'jobSecurity',
    'varietyOfWork',
    'familyFriendlyWorkSchedule',
  ],
  socialAndServiceOrientation: [
    'opportunityToHelpOthers',
    'opportunityToWorkWithPublic',
    'beingPartOfTeam',
  ],
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

  careerChoiceItems.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.itemId = item.id;

    const top = document.createElement('div');
    top.className = 'question-top';

    const left = document.createElement('div');
    left.className = 'question-left';

    const badge = document.createElement('span');
    badge.className = 'row-badge';
    badge.textContent = String(index + 1);

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

    CAREER_SCALE_OPTIONS.forEach((option) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';
      optionCard.dataset.itemId = item.id;
      optionCard.dataset.answerValue = String(option.value);

      const label = document.createElement('p');
      label.className = 'option-label';
      label.textContent = `${option.value}: ${option.text}`;

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
  const factorScores = { personalFitAndRewards: 0, workConditionsAndStability: 0, socialAndServiceOrientation: 0 };

  Object.entries(FACTOR_GROUPS).forEach(([factorKey, itemIds]) => {
    const total = itemIds.reduce((sum, itemId) => sum + answers[itemId], 0);
    factorScores[factorKey] = total / itemIds.length;
  });

  return factorScores;
}

function determineDominantFactor(factorScores) {
  const entries = Object.entries(factorScores);
  const maxScore = Math.max(...entries.map(([, value]) => value));
  const winners = entries.filter(([, value]) => value === maxScore);
  if (winners.length !== 1) {
    return {
      key: 'balanced',
      title: 'Balanced influences',
      description: FACTOR_DESCRIPTIONS.balanced,
    };
  }

  const [factorKey] = winners[0];
  return {
    key: factorKey,
    title: FACTOR_LABELS[factorKey],
    description: FACTOR_DESCRIPTIONS[factorKey],
  };
}

function createResultSnapshot(career, factorScores, dominantFactor, testedAt) {
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
    dominantFactorKey: dominantFactor.key,
    testedAt: testedAtIso,
  };
}

function renderBarChart(factorScores) {
  barChart.innerHTML = '';

  ['personalFitAndRewards', 'workConditionsAndStability', 'socialAndServiceOrientation'].forEach((key) => {
    const labelText = FACTOR_LABELS[key];
    const value = factorScores[key];

    const group = document.createElement('div');
    group.className = 'bar-group';

    const valueEl = document.createElement('p');
    valueEl.className = 'bar-value';
    valueEl.textContent = value.toFixed(1);

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

function renderResult(resultData, testedAt) {
  intentResultEl.textContent = resultData.career;
  dominantFactorEl.textContent = resultData.dominantFactor.title;
  dominantDescriptionEl.textContent = resultData.dominantFactor.description;
  testedAtEl.textContent = formatTestedAt(testedAt);
  if (testerNameEl) {
    testerNameEl.textContent = latestResultSnapshot && latestResultSnapshot.nickname ? latestResultSnapshot.nickname : '—';
  }
  renderBarChart(resultData.factorScores);
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
    title.textContent = `${nicknamePrefix}${itemData.career} | ${FACTOR_LABELS[itemData.dominantFactorKey] ?? FACTOR_LABELS.balanced}`;

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
  const dominantFactorKey = savedResult.dominantFactorKey || 'balanced';
  renderResult(
    {
      career: savedResult.career,
      factorScores: savedResult.factorScores,
      dominantFactor: {
        key: dominantFactorKey,
        title: FACTOR_LABELS[dominantFactorKey] ?? FACTOR_LABELS.balanced,
        description: FACTOR_DESCRIPTIONS[dominantFactorKey] ?? FACTOR_DESCRIPTIONS.balanced,
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
  const dominantFactorTitle = FACTOR_LABELS[resultData.dominantFactorKey] ?? FACTOR_LABELS.balanced;
  return [
    '3 Factors of Career Choice Result',
    '',
    ...(resultData.nickname ? [`Tester: ${resultData.nickname}`, ''] : []),
    `Intended career: ${resultData.career}`,
    `Tested at: ${formatTestedAt(resultData.testedAt)}`,
    `Dominant factor: ${dominantFactorTitle}`,
    '',
    `Career priorities (Cluster A): ${resultData.factorScores.personalFitAndRewards.toFixed(1)} / 5`,
    `Career priorities (Cluster B): ${resultData.factorScores.workConditionsAndStability.toFixed(1)} / 5`,
    `Career priorities (Cluster C): ${resultData.factorScores.socialAndServiceOrientation.toFixed(1)} / 5`,
  ].join('\n');
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
  const dominantFactor = determineDominantFactor(factorScores);
  const resultValues = {
    career,
    factorScores,
    dominantFactor,
  };

  latestResultSnapshot = createResultSnapshot(career, factorScores, dominantFactor, new Date());
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
