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

function formatEmailSubjectDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(store.toDate(dateValue));
}

function buildEmailBody(resultItem) {
  const lines = [
    'Surface vs Deep Learners Result',
    '',
    ...(resultItem.nickname ? [`Tester: ${resultItem.nickname}`, ''] : []),
    `Tested at: ${formatTestedAt(resultItem.testedAt)}`,
    `Dominant approach: ${resultItem.dominantType}`,
    '',
    `Deep total: ${resultItem.deepTotal}`,
    `Surface total: ${resultItem.surfaceTotal}`,
  ];
  return lines.join('\n');
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
    const nicknamePrefix = resultItem.nickname ? `[${resultItem.nickname}] ` : '';
    title.textContent = `${nicknamePrefix}${resultItem.dominantType} | ${store.formatScoreSummary(resultItem)}`;

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = formatTestedAt(resultItem.testedAt);
    copyWrap.append(title, meta);

    const emailButton = document.createElement('button');
    emailButton.type = 'button';
    emailButton.className = 'text-link history-view-button';
    emailButton.textContent = 'Email result';
    emailButton.addEventListener('click', () => {
      const subject = `Surface vs Deep Result (${formatEmailSubjectDate(resultItem.testedAt)})`;
      const body = buildEmailBody(resultItem);
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    item.append(copyWrap, emailButton);
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
