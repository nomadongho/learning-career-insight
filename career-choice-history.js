const store = window.careerChoiceResultHistoryStore;

const resultHistoryList = document.querySelector('#career-history-page-list');
const resultHistoryEmpty = document.querySelector('#career-history-page-empty');
const historyClearButton = document.querySelector('#career-history-page-clear-button');

function formatTestedAt(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(store.toDate(dateValue));
}

function goToResultPage(resultId) {
  window.location.href = `./career-choice.html?resultId=${encodeURIComponent(resultId)}`;
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
    item.className = 'history-item history-link-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.dataset.historyId = resultItem.id;

    const copyWrap = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'history-title';
    const nicknamePrefix = resultItem.nickname ? `[${resultItem.nickname}] ` : '';
    title.textContent = `${nicknamePrefix}${resultItem.career} | ${store.dominantFactorLabels[resultItem.dominantFactorKey] ?? store.dominantFactorLabels.balanced}`;

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = `${store.formatScoreSummary(resultItem.factorScores)} · ${formatTestedAt(resultItem.testedAt)}`;
    copyWrap.append(title, meta);

    item.append(copyWrap);
    resultHistoryList.append(item);
  });
}

let savedHistory = store.load();
renderSavedResultHistory(savedHistory);

resultHistoryList.addEventListener('click', (event) => {
  const item = event.target.closest('.history-item[data-history-id]');
  if (!item) return;
  goToResultPage(item.dataset.historyId);
});

resultHistoryList.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  const item = event.target.closest('.history-item[data-history-id]');
  if (!item) return;
  goToResultPage(item.dataset.historyId);
});

historyClearButton.addEventListener('click', () => {
  savedHistory = [];
  store.persist(savedHistory);
  renderSavedResultHistory(savedHistory);
});
