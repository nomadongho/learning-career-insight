const wordDefinitions = {
  involved: 'Fully engaged and actively taking part in what is happening.',
  tentative: 'Cautious and unsure; preferring to try carefully before committing.',
  discriminating: 'Carefully noticing differences and making thoughtful judgments.',
  practical: 'Focused on real-world results and what actually works.',
  receptive: 'Open and willing to take in new ideas or experiences.',
  impartial: 'Fair and neutral; able to see all sides without bias.',
  analytical: 'Breaking things down step by step to understand them deeply.',
  relevant: 'Focused on what directly matters or applies to the situation.',
  feeling: 'Learning through personal emotions and gut reactions.',
  watching: 'Learning by observing carefully before acting.',
  thinking: 'Learning through reasoning, concepts, and mental models.',
  doing: 'Learning by jumping in and trying things out directly.',
  accepting: 'Willing to take things as they are, without needing to change them.',
  aware: 'Highly attentive to what is happening around you.',
  evaluative: 'Constantly assessing and judging based on clear criteria.',
  'risk-taker': 'Comfortable trying new things even when the outcome is uncertain.',
  intuitive: 'Trusting gut feelings and instincts rather than step-by-step logic.',
  questioning: 'Always asking "why" and challenging assumptions.',
  logical: 'Following clear, structured reasoning to reach conclusions.',
  productive: 'Focused on getting things done and achieving results efficiently.',
  concrete: 'Preferring real, hands-on, tangible experiences over theories.',
  observing: 'Learning by watching carefully from the sidelines.',
  abstract: 'Thinking in broad concepts, theories, and big-picture ideas.',
  active: 'Learning best through movement, action, and direct involvement.',
  'present-oriented': 'Focused on what is happening right now, in this moment.',
  reflecting: 'Taking time to look back and think carefully about what happened.',
  'future-oriented': 'Thinking ahead and planning for what comes next.',
  pragmatic: 'Practical and results-driven; focused on what works in practice.',
  experience: 'Learning from direct, personal involvement in real events.',
  observation: 'Learning by watching and gathering information carefully.',
  conceptualization: 'Learning by forming ideas and building abstract mental models.',
  experimentation: 'Learning by testing ideas and trying different approaches.',
  intense: 'Deeply focused and fully absorbed in what you are doing.',
  reserved: 'Quiet and thoughtful; preferring to observe before speaking or acting.',
  rational: 'Making decisions based on logic and reason rather than emotion.',
  responsible: 'Reliable and accountable; taking ownership of tasks and actions.',
};

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
const SVG_NS = 'http://www.w3.org/2000/svg';
const RANK_VALUES = ['1', '2', '3', '4'];
const answers = assessmentRows.map(() => Array(4).fill(''));

const questionList = document.querySelector('#question-list');
const form = document.querySelector('#assessment-form');
const formError = document.querySelector('#form-error');
const progressText = document.querySelector('#progress-label');
const progressBarFill = document.querySelector('#progress-bar-fill');
const resultsSection = document.querySelector('#results');
const scoreGrid = document.querySelector('#score-grid');
const barChart = document.querySelector('#bar-chart');
const axisChart = document.querySelector('#axis-chart');
const styleName = document.querySelector('#style-name');
const styleCombo = document.querySelector('#style-combo');
const styleDescription = document.querySelector('#style-description');
const axisSummary = document.querySelector('#axis-summary');
const axisDesc = document.querySelector('#axis-desc');
const resetButton = document.querySelector('#reset-button');
const testedAtValue = document.querySelector('#tested-at-value');
const emailRecipientInput = document.querySelector('#email-recipient');
const emailSendButton = document.querySelector('#email-send-button');

let latestResultSnapshot = null;

// ── Word tooltip ──────────────────────────────────────────────────────────────
const TOOLTIP_VIEWPORT_PAD = 8;
const TOOLTIP_FLIP_CLEARANCE = 16;
const TOOLTIP_SPACING = 10;

const wordTooltip = document.createElement('div');
wordTooltip.className = 'word-tooltip hidden';
wordTooltip.setAttribute('role', 'tooltip');
document.body.appendChild(wordTooltip);

let activeHintBtn = null;

function showWordTooltip(btn) {
  const word = btn.dataset.word;
  const def = wordDefinitions[word.toLowerCase()];
  if (!def) return;

  activeHintBtn = btn;

  wordTooltip.innerHTML = '';
  const titleEl = document.createElement('p');
  titleEl.className = 'word-tooltip-title';
  titleEl.textContent = word;
  const bodyEl = document.createElement('p');
  bodyEl.className = 'word-tooltip-body';
  bodyEl.textContent = def;
  wordTooltip.append(titleEl, bodyEl);
  wordTooltip.classList.remove('hidden', 'word-tooltip--below');

  // Measure tooltip height, then position it
  const tooltipRect = wordTooltip.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  let centerX = btnRect.left + btnRect.width / 2;
  const halfW = tooltipRect.width / 2;
  const clampedX = Math.max(halfW + TOOLTIP_VIEWPORT_PAD, Math.min(centerX, window.innerWidth - halfW - TOOLTIP_VIEWPORT_PAD));

  // Arrow stays aligned with the button center even if tooltip shifted
  const arrowOffset = centerX - clampedX;
  wordTooltip.style.setProperty('--arrow-offset', `${arrowOffset}px`);
  wordTooltip.style.left = `${clampedX}px`;

  const spaceAbove = btnRect.top;
  if (spaceAbove < tooltipRect.height + TOOLTIP_FLIP_CLEARANCE) {
    // Not enough room above – show below
    wordTooltip.classList.add('word-tooltip--below');
    wordTooltip.style.top = `${btnRect.bottom + TOOLTIP_SPACING}px`;
  } else {
    wordTooltip.style.top = `${btnRect.top - tooltipRect.height - TOOLTIP_SPACING}px`;
  }
}

function hideWordTooltip() {
  wordTooltip.classList.add('hidden');
  activeHintBtn = null;
}

document.addEventListener('click', (event) => {
  const hintBtn = event.target.closest('.word-hint');
  if (hintBtn) {
    event.stopPropagation();
    if (activeHintBtn === hintBtn) {
      hideWordTooltip();
    } else {
      showWordTooltip(hintBtn);
    }
    return;
  }
  if (!event.target.closest('.word-tooltip')) {
    hideWordTooltip();
  }
});

// ── /Word tooltip ─────────────────────────────────────────────────────────────

function updateRankButtons(rowIndex) {
  const rowAnswers = answers[rowIndex];
  const card = questionList.querySelector(`[data-row="${rowIndex}"]`);
  if (!card) return;

  card.querySelectorAll('.rank-btn').forEach((btn) => {
    const optIndex = Number(btn.dataset.optionIndex);
    const rank = btn.dataset.rank;
    const isSelected = rowAnswers[optIndex] === rank;
    const isUsedElsewhere = rowAnswers.some((a, i) => a === rank && i !== optIndex);

    btn.classList.toggle('rank-selected', isSelected);
    btn.classList.toggle('rank-taken', !isSelected && isUsedElsewhere);
  });

  const isComplete = rowAnswers.every(Boolean);
  card.classList.toggle('row-complete', isComplete);

  const badge = card.querySelector('.row-badge');
  if (badge) {
    badge.textContent = isComplete ? '✓' : String(rowIndex + 1);
  }
}

function renderQuestions() {
  questionList.innerHTML = '';

  assessmentRows.forEach((row, rowIndex) => {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.row = String(rowIndex);

    const top = document.createElement('div');
    top.className = 'question-top';

    const left = document.createElement('div');
    left.className = 'question-left';

    const badge = document.createElement('span');
    badge.className = 'row-badge';
    badge.textContent = String(row.id);

    const note = document.createElement('p');
    note.className = 'question-note';
    note.textContent = row.prompt;

    left.append(badge, note);

    const hint = document.createElement('p');
    hint.className = 'option-note';
    hint.textContent = 'Rank 1 – 4';

    top.append(left, hint);

    const optionGrid = document.createElement('div');
    optionGrid.className = 'option-grid';

    row.options.forEach((labelText, optionIndex) => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';

      const label = document.createElement('p');
      label.className = 'option-label';
      const labelSpan = document.createElement('span');
      labelSpan.textContent = labelText;
      label.append(labelSpan);

      if (wordDefinitions[labelText.toLowerCase()]) {
        const hintBtn = document.createElement('button');
        hintBtn.type = 'button';
        hintBtn.className = 'word-hint';
        hintBtn.textContent = '?';
        hintBtn.dataset.word = labelText;
        hintBtn.setAttribute('aria-label', `What does "${labelText}" mean?`);
        label.append(hintBtn);
      }

      const rankGroup = document.createElement('div');
      rankGroup.className = 'rank-group';

      RANK_VALUES.forEach((rank) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rank-btn';
        btn.textContent = rank;
        btn.dataset.rowIndex = String(rowIndex);
        btn.dataset.optionIndex = String(optionIndex);
        btn.dataset.rank = rank;
        rankGroup.append(btn);
      });

      optionCard.append(label, rankGroup);
      optionGrid.append(optionCard);
    });

    card.append(top, optionGrid);
    questionList.append(card);

    updateRankButtons(rowIndex);
  });

  updateProgress();
}

function updateProgress() {
  const completedRows = answers.filter((row) => row.every(Boolean)).length;
  progressText.textContent = `${completedRows} of ${assessmentRows.length} rows complete`;
  progressBarFill.style.width = `${(completedRows / assessmentRows.length) * 100}%`;
}

function setAnswer(rowIndex, optionIndex, rank) {
  const wasSelected = answers[rowIndex][optionIndex] === rank;

  // If another option in the row already has this rank, clear it
  answers[rowIndex].forEach((answer, i) => {
    if (answer === rank && i !== optionIndex) {
      answers[rowIndex][i] = '';
    }
  });

  // Toggle: clicking the same rank again deselects it
  answers[rowIndex][optionIndex] = wasSelected ? '' : rank;

  // Auto-complete the final option when exactly one rank and one option are left.
  if (!wasSelected) {
    const rowAnswers = answers[rowIndex];
    const filledCount = rowAnswers.filter(Boolean).length;

    if (filledCount === 3) {
      const missingOptionIndex = rowAnswers.findIndex((value) => value === '');
      const remainingRank = RANK_VALUES.find((candidate) => !rowAnswers.includes(candidate));

      if (missingOptionIndex !== -1 && remainingRank) {
        rowAnswers[missingOptionIndex] = remainingRank;
      }
    }
  }

  updateRankButtons(rowIndex);
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

function formatTestedAt(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(dateValue);
}

function formatEmailSubjectDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateValue);
}

function isValidEmailAddress(emailAddress) {
  if (!emailAddress) return true;
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.value = emailAddress;
  return emailInput.checkValidity();
}

function buildEmailBody(resultData) {
  const { scores, styleResult, testedAt } = resultData;
  const styleInfo = styleMeta[styleResult.name] ?? {
    combination: 'Unknown',
  };
  const lines = [
    'Learning Styles Assessment Result',
    '',
    `Tested at: ${formatTestedAt(testedAt)}`,
    '',
    'Dominant style',
    `- Name: ${styleResult.name}`,
    `- Combination: ${styleInfo.combination}`,
    '',
    'Dimension totals',
    `- CE: ${scores.CE}`,
    `- RO: ${scores.RO}`,
    `- AC: ${scores.AC}`,
    `- AE: ${scores.AE}`,
    '',
    'Graph data for comparison',
    `- Bar chart values: CE=${scores.CE}, RO=${scores.RO}, AC=${scores.AC}, AE=${scores.AE}`,
    `- Diamond axis values: AE(top)=${scores.AE}, AC(right)=${scores.AC}, RO(bottom)=${scores.RO}, CE(left)=${scores.CE}`,
    '',
    'Orientation',
    `- AC - CE: ${styleResult.horizontal}`,
    `- AE - RO: ${styleResult.vertical}`,
  ];

  return lines.join('\n');
}

function sendResultByEmail() {
  if (!latestResultSnapshot) {
    return;
  }

  const recipient = emailRecipientInput.value.trim();
  if (!isValidEmailAddress(recipient)) {
    formError.textContent = 'Please enter a valid email address or leave it empty.';
    return;
  }

  const subject = `Learning Styles Result (${formatEmailSubjectDate(latestResultSnapshot.testedAt)})`;
  const body = buildEmailBody(latestResultSnapshot);
  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  formError.textContent = '';
  window.location.href = mailtoUrl;
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
    const shortName = document.createElement('strong');
    shortName.textContent = dimension.key;
    const lineBreak = document.createElement('br');
    const fullName = document.createTextNode(dimension.name);

    label.append(shortName, lineBreak, fullName);

    track.append(fill);
    group.append(value, track, label);
    barChart.append(group);
  });
}

function createSvgNode(tagName, attributes = {}, textContent = '') {
  const node = document.createElementNS(SVG_NS, tagName);

  Object.entries(attributes).forEach(([name, value]) => {
    node.setAttribute(name, String(value));
  });

  if (textContent) {
    node.textContent = textContent;
  }

  return node;
}

// Renders a 4-axis diamond chart. scores: { CE, RO, AC, AE } — raw totals from calculateScores().
function renderAxisChart(scores) {
  const size = 360;
  const center = 180;
  const axisLen = 120;
  const plotMax = 105;
  const els = [];

  // Background
  els.push(createSvgNode('rect', { x: 0, y: 0, width: size, height: size, rx: 24, fill: '#f8fbff' }));

  // Reference circles (correspond to scores 9, 18, 27, 36)
  [0.25, 0.5, 0.75, 1.0].forEach((fraction) => {
    els.push(
      createSvgNode('circle', {
        cx: center,
        cy: center,
        r: plotMax * fraction,
        fill: 'none',
        stroke: fraction === 1 ? '#c4d4ec' : '#dce8f8',
        'stroke-width': fraction === 1 ? 1.5 : 1,
      }),
    );
  });

  // Scale labels on the vertical (AE) axis
  [9, 18, 27, 36].forEach((scaleVal) => {
    const y = center - (scaleVal / MAX_SCORE) * plotMax;
    els.push(
      createSvgNode(
        'text',
        { x: center + 7, y: y + 4, 'font-size': 9, fill: '#94a3b8', 'font-family': 'Inter,system-ui,sans-serif' },
        String(scaleVal),
      ),
    );
  });

  // Axis lines
  els.push(
    createSvgNode('line', { x1: center, y1: center - axisLen, x2: center, y2: center + axisLen, stroke: '#b0c4de', 'stroke-width': 1.5 }),
  );
  els.push(
    createSvgNode('line', { x1: center - axisLen, y1: center, x2: center + axisLen, y2: center, stroke: '#b0c4de', 'stroke-width': 1.5 }),
  );

  // Score points (normalized to plotMax)
  const norm = (score) => (score / MAX_SCORE) * plotMax;
  const pts = {
    AE: [center, center - norm(scores.AE)],
    AC: [center + norm(scores.AC), center],
    RO: [center, center + norm(scores.RO)],
    CE: [center - norm(scores.CE), center],
  };

  // Diamond polygon
  const polyPts = Object.values(pts)
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
  els.push(
    createSvgNode('polygon', {
      points: polyPts,
      fill: 'rgba(37,99,235,0.12)',
      stroke: '#2563eb',
      'stroke-width': 2.5,
      'stroke-linejoin': 'round',
    }),
  );

  // Vertex dots
  Object.values(pts).forEach(([x, y]) => {
    els.push(createSvgNode('circle', { cx: x, cy: y, r: 5.5, fill: '#2563eb' }));
  });

  // Axis labels and score values
  const labelGap = 16;
  const fontFamily = 'Inter,system-ui,sans-serif';

  // AE – top
  els.push(createSvgNode('text', { x: center, y: center - axisLen - labelGap, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#1e3a5f', 'font-family': fontFamily }, 'AE'));
  els.push(createSvgNode('text', { x: center, y: center - axisLen - labelGap + 15, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#2563eb', 'font-family': fontFamily }, String(scores.AE)));

  // AC – right
  els.push(createSvgNode('text', { x: center + axisLen + labelGap, y: center - 4, 'text-anchor': 'start', 'font-size': 13, 'font-weight': 700, fill: '#1e3a5f', 'font-family': fontFamily }, 'AC'));
  els.push(createSvgNode('text', { x: center + axisLen + labelGap, y: center + 12, 'text-anchor': 'start', 'font-size': 12, 'font-weight': 700, fill: '#2563eb', 'font-family': fontFamily }, String(scores.AC)));

  // RO – bottom
  els.push(createSvgNode('text', { x: center, y: center + axisLen + labelGap + 13, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#1e3a5f', 'font-family': fontFamily }, 'RO'));
  els.push(createSvgNode('text', { x: center, y: center + axisLen + labelGap + 28, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#2563eb', 'font-family': fontFamily }, String(scores.RO)));

  // CE – left
  els.push(createSvgNode('text', { x: center - axisLen - labelGap, y: center - 4, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: '#1e3a5f', 'font-family': fontFamily }, 'CE'));
  els.push(createSvgNode('text', { x: center - axisLen - labelGap, y: center + 12, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#2563eb', 'font-family': fontFamily }, String(scores.CE)));

  axisChart.replaceChildren(...els);
}

function renderResults(scores, styleResult, testedAt) {
  renderScoreCards(scores);
  renderBarChart(scores);
  renderAxisChart(scores);

  const style = styleMeta[styleResult.name] ?? {
    combination: 'Unknown',
    description: 'No style description is available for this result.',
  };
  styleName.textContent = styleResult.name;
  styleCombo.textContent = style.combination;
  styleDescription.textContent = style.description;
  axisSummary.textContent = `CE ${scores.CE} · RO ${scores.RO} · AC ${scores.AC} · AE ${scores.AE}`;
  axisDesc.textContent = `Orientation: AC − CE = ${styleResult.horizontal}, AE − RO = ${styleResult.vertical}`;
  testedAtValue.textContent = formatTestedAt(testedAt);

  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

questionList.addEventListener('click', (event) => {
  const btn = event.target.closest('.rank-btn');
  if (!btn) return;

  const rowIndex = Number(btn.dataset.rowIndex);
  const optionIndex = Number(btn.dataset.optionIndex);
  setAnswer(rowIndex, optionIndex, btn.dataset.rank);
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
  const testedAt = new Date();
  latestResultSnapshot = {
    scores: { ...scores },
    styleResult: { ...styleResult },
    testedAt,
  };
  renderResults(scores, styleResult, testedAt);
  formError.textContent = '';
});

emailSendButton.addEventListener('click', sendResultByEmail);

resetButton.addEventListener('click', () => {
  answers.forEach((row) => row.fill(''));
  renderQuestions();
  formError.textContent = '';
  resultsSection.classList.add('hidden');
  testedAtValue.textContent = '—';
  latestResultSnapshot = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

renderQuestions();
