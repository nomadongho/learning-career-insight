const resultHistoryStore = window.resultHistoryStore;

const resultHistoryList = document.querySelector('#result-history-list');
const resultHistoryEmpty = document.querySelector('#result-history-empty');
const historyClearButton = document.querySelector('#history-clear-button');

function formatTestedAt(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(resultHistoryStore.toDate(dateValue));
}

function goToResultPage(resultId) {
  window.location.href = `./index.html?resultId=${encodeURIComponent(resultId)}`;
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
    title.textContent = `${nicknamePrefix}${resultItem.styleResult.name} | ${resultHistoryStore.formatScoreSummary(resultItem.scores)}`;
    title.setAttribute(
      'aria-label',
      `Style ${resultItem.styleResult.name}, scores CE ${resultItem.scores.CE}, RO ${resultItem.scores.RO}, AC ${resultItem.scores.AC}, AE ${resultItem.scores.AE}`,
    );

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = formatTestedAt(resultItem.testedAt);
    copyWrap.append(title, meta);

    item.append(copyWrap);
    resultHistoryList.append(item);
  });
}

let savedResultHistory = resultHistoryStore.load();
renderSavedResultHistory(savedResultHistory);

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
  savedResultHistory = [];
  resultHistoryStore.persist(savedResultHistory);
  renderSavedResultHistory(savedResultHistory);
});
