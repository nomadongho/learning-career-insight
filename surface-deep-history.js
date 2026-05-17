const store = window.surfaceDeepResultHistoryStore;

const resultHistoryList = document.querySelector('#surface-history-page-list');
const resultHistoryEmpty = document.querySelector('#surface-history-page-empty');
const historyClearButton = document.querySelector('#surface-history-page-clear-button');

function formatTestedAt(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(store.toDate(dateValue));
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
    title.textContent = `${resultItem.dominantType} | ${store.formatScoreSummary(resultItem)}`;

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = formatTestedAt(resultItem.testedAt);
    copyWrap.append(title, meta);

    item.append(copyWrap);
    resultHistoryList.append(item);
  });
}

let savedHistory = store.load();
renderSavedResultHistory(savedHistory);

historyClearButton.addEventListener('click', () => {
  savedHistory = [];
  store.persist(savedHistory);
  renderSavedResultHistory(savedHistory);
});
