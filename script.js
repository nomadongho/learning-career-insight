const assessmentRows = [
  {
    id: 1,
    prompt: 'Assign 1 to the least like you and 4 to the most like you.',
    options: ['involved', 'tentative', 'discriminating', 'practical'],
  },
  {
    id: 2,
    prompt: 'Use each number only once in this row.',
    options: ['receptive', 'impartial', 'analytical', 'relevant'],
  },
  {
    id: 3,
    prompt: 'Keep ranking from 1 through 4 without ties.',
    options: ['feeling', 'watching', 'thinking', 'doing'],
  },
  {
    id: 4,
    prompt: 'Choose the order that feels most natural to you.',
    options: ['accepting', 'aware', 'evaluative', 'risk-taker'],
  },
  {
    id: 5,
    prompt: 'A clear rank gives the best result profile.',
    options: ['intuitive', 'questioning', 'logical', 'productive'],
  },
  {
    id: 6,
    prompt: 'Think about how you usually approach learning tasks.',
    options: ['concrete', 'observing', 'abstract', 'active'],
  },
  {
    id: 7,
    prompt: 'Answer based on your natural preference, not ideal behavior.',
    options: ['present-oriented', 'reflecting', 'future-oriented', 'pragmatic'],
  },
  {
    id: 8,
    prompt: 'Focus on how you learn most often.',
    options: ['experience', 'observation', 'conceptualization', 'experimentation'],
  },
  {
    id: 9,
    prompt: 'Use your first instinct if two choices feel close.',
    options: ['intense', 'reserved', 'rational', 'responsible'],
  },
];

const dimensionMeta = [
  {
    key: 'CE',
    name: 'Concrete Experience',
    description: 'You tend to learn through direct involvement, feeling, and personal experience.',
  },
  {
    key: 'RO',
    name: 'Reflective Observation',
    description: 'You prefer to pause, watch carefully, and think through what happened.',
  },
  {
    key: 'AC',
    name: 'Abstract Conceptualization',
    description: 'You often rely on logic, structure, and ideas to make sense of information.',
  },
  {
    key: 'AE',
    name: 'Active Experimentation',
    description: 'You prefer testing ideas, moving quickly, and learning by doing.',
  },
];

const styleMeta = {
  Diverging: {
    combination: 'CE + RO',
    description:
      'You usually learn best by collecting experiences, noticing patterns, and considering multiple perspectives before acting.',
  },
  Assimilating: {
    combination: 'AC + RO',
    description:
      'You often prefer structured ideas, thoughtful analysis, and clear models before you move into action.',
  },
  Converging: {
    combination: 'AC + AE',
    description:
      'You are typically strongest when turning ideas into workable solutions and focusing on practical outcomes.',
  },
  Accommodating: {
    combination: 'CE + AE',
    description:
      'You often learn best through action, adaptation, and hands-on experiences in changing situations.',
  },
};

const MAX_SCORE = assessmentRows.length * 4;
const AXIS_LIMIT = assessmentRows.length * 3;
const answers = assessmentRows.map(() => Array(4).fill(''));

const questionList = document.querySelector('#question-list');
const form = document.querySelector('#assessment-form');
const formError = document.querySelector('#form-error');
const progressText = document.querySelector('#progress-text');
const resultsSection = document.querySelector('#results');
const scoreGrid = document.querySelector('#score-grid');
const barChart = document.querySelector('#bar-chart');
const axisChart = document.querySelector('#axis-chart');
const styleName = document.querySelector('#style-name');
const styleCombo = document.querySelector('#style-combo');
const styleDescription = document.querySelector('#style-description');
const axisSummary = document.querySelector('#axis-summary');
const resetButton = document.querySelector('#reset-button');

function createSelect(rowIndex, optionIndex) {
  const select = document.createElement('select');
  select.name = `row-${rowIndex}-option-${optionIndex}`;
  select.dataset.rowIndex = String(rowIndex);
  select.dataset.optionIndex = String(optionIndex);
  select.setAttribute('aria-label', `Row ${rowIndex + 1} option ${optionIndex + 1}`);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select rank';
  select.append(placeholder);

  [1, 2, 3, 4].forEach((value) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = String(value);
    select.append(option);
  });

  return select;
}

function renderQuestions() {
  questionList.innerHTML = '';

  assessmentRows.forEach((row, rowIndex) => {
    const card = document.createElement('article');
    card.className = 'question-card';

    const top = document.createElement('div');
    top.className = 'question-top';

    const heading = document.createElement('div');
    const number = document.createElement('p');
    number.className = 'question-number';
    number.textContent = `Row ${row.id}`;

    const note = document.createElement('p');
    note.className = 'question-note';
    note.textContent = row.prompt;

    heading.append(number, note);

    const hint = document.createElement('p');
    hint.className = 'option-note';
    hint.textContent = 'Use 1, 2, 3, and 4 exactly once.';

    top.append(heading, hint);

    const optionGrid = document.createElement('div');
    optionGrid.className = 'option-grid';

    row.options.forEach((labelText, optionIndex) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';

      const label = document.createElement('label');
      label.textContent = labelText;
      label.htmlFor = `row-${rowIndex}-option-${optionIndex}`;

      const select = createSelect(rowIndex, optionIndex);
      select.id = label.htmlFor;
      select.value = answers[rowIndex][optionIndex];

      optionCard.append(label, select);
      optionGrid.append(optionCard);
    });

    card.append(top, optionGrid);
    questionList.append(card);
  });

  syncSelectAvailability();
  updateProgress();
}

function syncSelectAvailability() {
  const selects = questionList.querySelectorAll('select');

  selects.forEach((select) => {
    const rowIndex = Number(select.dataset.rowIndex);
    const optionIndex = Number(select.dataset.optionIndex);
    const rowAnswers = answers[rowIndex];

    Array.from(select.options).forEach((option) => {
      if (!option.value) {
        option.disabled = false;
        return;
      }

      const isUsedElsewhere = rowAnswers.some(
        (answer, answerIndex) => answer === option.value && answerIndex !== optionIndex,
      );
      option.disabled = isUsedElsewhere;
    });
  });
}

function updateProgress() {
  const completedRows = answers.filter((row) => row.every(Boolean)).length;
  progressText.textContent = `${completedRows} of ${assessmentRows.length} rows complete`;
}

function setAnswer(rowIndex, optionIndex, value) {
  answers[rowIndex][optionIndex] = value;
  syncSelectAvailability();
  updateProgress();

  if (formError.textContent) {
    formError.textContent = '';
  }
}

function validateAnswers() {
  for (let rowIndex = 0; rowIndex < answers.length; rowIndex += 1) {
    const row = answers[rowIndex];

    if (row.some((value) => value === '')) {
      return `Row ${rowIndex + 1} is incomplete.`;
    }

    const uniqueCount = new Set(row).size;
    if (uniqueCount !== 4) {
      return `Row ${rowIndex + 1} must use 1, 2, 3, and 4 only once.`;
    }
  }

  return '';
}

function calculateScores() {
  return answers.reduce(
    (totals, row) => {
      totals.CE += Number(row[0]);
      totals.RO += Number(row[1]);
      totals.AC += Number(row[2]);
      totals.AE += Number(row[3]);
      return totals;
    },
    { CE: 0, RO: 0, AC: 0, AE: 0 },
  );
}

function determineStyle(scores) {
  const horizontal = scores.AC - scores.CE;
  const vertical = scores.AE - scores.RO;

  if (horizontal >= 0 && vertical >= 0) {
    return { name: 'Converging', horizontal, vertical };
  }

  if (horizontal >= 0 && vertical < 0) {
    return { name: 'Assimilating', horizontal, vertical };
  }

  if (horizontal < 0 && vertical >= 0) {
    return { name: 'Accommodating', horizontal, vertical };
  }

  return { name: 'Diverging', horizontal, vertical };
}

function renderScoreCards(scores) {
  scoreGrid.innerHTML = '';

  dimensionMeta.forEach((dimension) => {
    const card = document.createElement('article');
    card.className = 'score-card';

    const label = document.createElement('p');
    label.className = 'summary-label';
    label.textContent = dimension.key;

    const title = document.createElement('h3');
    title.textContent = dimension.name;

    const value = document.createElement('p');
    value.className = 'score-value';
    value.textContent = String(scores[dimension.key]);

    const description = document.createElement('p');
    description.textContent = dimension.description;

    card.append(label, title, value, description);
    scoreGrid.append(card);
  });
}

function renderBarChart(scores) {
  barChart.innerHTML = '';

  dimensionMeta.forEach((dimension) => {
    const group = document.createElement('div');
    group.className = 'bar-group';

    const value = document.createElement('p');
    value.className = 'bar-value';
    value.textContent = String(scores[dimension.key]);

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.setProperty('--bar-height', `${(scores[dimension.key] / MAX_SCORE) * 100}%`);
    fill.setAttribute('aria-hidden', 'true');

    const label = document.createElement('p');
    label.innerHTML = `<strong>${dimension.key}</strong><br>${dimension.name}`;

    track.append(fill);
    group.append(value, track, label);
    barChart.append(group);
  });
}

function renderAxisChart(styleResult) {
  const size = 320;
  const center = size / 2;
  const plotRadius = 118;
  const scale = plotRadius / AXIS_LIMIT;
  const pointX = center + styleResult.horizontal * scale;
  const pointY = center - styleResult.vertical * scale;

  axisChart.innerHTML = `
    <rect x="0" y="0" width="320" height="320" rx="24" fill="#f8fbff"></rect>
    <text x="160" y="24" text-anchor="middle" font-size="12" fill="#4f5d75">AE</text>
    <text x="160" y="308" text-anchor="middle" font-size="12" fill="#4f5d75">RO</text>
    <text x="24" y="164" text-anchor="middle" font-size="12" fill="#4f5d75">CE</text>
    <text x="296" y="164" text-anchor="middle" font-size="12" fill="#4f5d75">AC</text>
    <text x="84" y="72" text-anchor="middle" font-size="13" font-weight="700" fill="#4f5d75">Accommodating</text>
    <text x="236" y="72" text-anchor="middle" font-size="13" font-weight="700" fill="#4f5d75">Converging</text>
    <text x="84" y="250" text-anchor="middle" font-size="13" font-weight="700" fill="#4f5d75">Diverging</text>
    <text x="236" y="250" text-anchor="middle" font-size="13" font-weight="700" fill="#4f5d75">Assimilating</text>
    <line x1="160" y1="34" x2="160" y2="286" stroke="#90a4c4" stroke-width="2"></line>
    <line x1="34" y1="160" x2="286" y2="160" stroke="#90a4c4" stroke-width="2"></line>
    <rect x="42" y="42" width="236" height="236" rx="18" fill="none" stroke="#d8e3f2" stroke-width="2" stroke-dasharray="6 8"></rect>
    <circle cx="${pointX}" cy="${pointY}" r="8" fill="#2563eb"></circle>
    <circle cx="${pointX}" cy="${pointY}" r="16" fill="rgba(37, 99, 235, 0.16)"></circle>
    <text x="${Math.min(pointX + 14, 280)}" y="${Math.max(pointY - 12, 24)}" font-size="12" font-weight="700" fill="#14213d">You</text>
  `;
}

function renderResults(scores, styleResult) {
  renderScoreCards(scores);
  renderBarChart(scores);
  renderAxisChart(styleResult);

  const style = styleMeta[styleResult.name];
  styleName.textContent = styleResult.name;
  styleCombo.textContent = style.combination;
  styleDescription.textContent = style.description;
  axisSummary.textContent = `AC − CE = ${styleResult.horizontal}, AE − RO = ${styleResult.vertical}`;

  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

questionList.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLSelectElement)) {
    return;
  }

  const rowIndex = Number(event.target.dataset.rowIndex);
  const optionIndex = Number(event.target.dataset.optionIndex);
  setAnswer(rowIndex, optionIndex, event.target.value);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const validationMessage = validateAnswers();
  if (validationMessage) {
    formError.textContent = validationMessage;
    resultsSection.classList.add('hidden');
    return;
  }

  const scores = calculateScores();
  const styleResult = determineStyle(scores);
  renderResults(scores, styleResult);
  formError.textContent = '';
});

resetButton.addEventListener('click', () => {
  answers.forEach((row) => row.fill(''));
  renderQuestions();
  formError.textContent = '';
  resultsSection.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

renderQuestions();
