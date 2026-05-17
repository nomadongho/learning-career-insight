const RESULT_HISTORY_STORAGE_KEY = 'learningStylesResultHistory.v1';
const RESULT_HISTORY_LIMIT = 30;

const resultHistoryList = document.querySelector('#result-history-list');
const resultHistoryEmpty = document.querySelector('#result-history-empty');
const historyClearButton = document.querySelector('#history-clear-button');

function toDate(value) {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatTestedAt(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(toDate(dateValue));
}

function normalizeSavedResult(rawResult) {
  if (!rawResult || typeof rawResult !== 'object') return null;
  const { id, scores, styleResult, testedAt } = rawResult;
  const hasAllScores =
    scores &&
    typeof scores.CE === 'number' &&
    typeof scores.RO === 'number' &&
    typeof scores.AC === 'number' &&
    typeof scores.AE === 'number';
  const hasStyle =
    styleResult &&
    typeof styleResult.name === 'string' &&
    typeof styleResult.horizontal === 'number' &&
    typeof styleResult.vertical === 'number';
  const testedAtDate = toDate(testedAt);
  if (!id || !hasAllScores || !hasStyle || Number.isNaN(testedAtDate.getTime())) {
    return null;
  }

  return {
    id: String(id),
    scores: { CE: scores.CE, RO: scores.RO, AC: scores.AC, AE: scores.AE },
    styleResult: {
      name: styleResult.name,
      horizontal: styleResult.horizontal,
      vertical: styleResult.vertical,
    },
    testedAt: testedAtDate.toISOString(),
  };
}

function loadSavedResultHistory() {
  try {
    const rawValue = localStorage.getItem(RESULT_HISTORY_STORAGE_KEY);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeSavedResult).filter(Boolean).slice(0, RESULT_HISTORY_LIMIT);
  } catch (error) {
    return [];
  }
}

function persistSavedResultHistory(items) {
  try {
    localStorage.setItem(RESULT_HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    // Ignore storage errors.
  }
}

function formatScoreSummary(scores) {
  return `${scores.CE}/${scores.RO}/${scores.AC}/${scores.AE}`;
}

function renderSavedResultHistory(items) {
  resultHistoryList.innerHTML = '';
  if (items.length === 0) {
    resultHistoryEmpty.classList.remove('hidden');
    return;
  }

  resultHistoryEmpty.classList.add('hidden');
  items.forEach((resultItem) => {
    const item = document.createElement('li');
    item.className = 'history-item';

    const copyWrap = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'history-title';
    title.textContent = `${resultItem.styleResult.name} | ${formatScoreSummary(resultItem.scores)}`;

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = formatTestedAt(resultItem.testedAt);
    copyWrap.append(title, meta);

    item.append(copyWrap);
    resultHistoryList.append(item);
  });
}

let savedResultHistory = loadSavedResultHistory();
renderSavedResultHistory(savedResultHistory);

historyClearButton.addEventListener('click', () => {
  savedResultHistory = [];
  persistSavedResultHistory(savedResultHistory);
  renderSavedResultHistory(savedResultHistory);
});
