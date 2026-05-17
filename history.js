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

function formatEmailSubjectDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(resultHistoryStore.toDate(dateValue));
}

function buildEmailBody(resultItem) {
  const { scores, styleResult, testedAt, nickname } = resultItem;
  const lines = [
    'Learning Styles Assessment Result',
    '',
    ...(nickname ? [`Tester: ${nickname}`, ''] : []),
    `Tested at: ${formatTestedAt(testedAt)}`,
    '',
    `Dominant style: ${styleResult.name}`,
    '',
    'Dimension totals',
    `- CE: ${scores.CE}`,
    `- RO: ${scores.RO}`,
    `- AC: ${scores.AC}`,
    `- AE: ${scores.AE}`,
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
    title.textContent = `${nicknamePrefix}${resultItem.styleResult.name} | ${resultHistoryStore.formatScoreSummary(resultItem.scores)}`;
    title.setAttribute(
      'aria-label',
      `Style ${resultItem.styleResult.name}, scores CE ${resultItem.scores.CE}, RO ${resultItem.scores.RO}, AC ${resultItem.scores.AC}, AE ${resultItem.scores.AE}`,
    );

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = formatTestedAt(resultItem.testedAt);
    copyWrap.append(title, meta);

    const emailButton = document.createElement('button');
    emailButton.type = 'button';
    emailButton.className = 'text-link history-view-button';
    emailButton.textContent = 'Email result';
    emailButton.addEventListener('click', () => {
      const subject = `Learning Styles Result (${formatEmailSubjectDate(resultItem.testedAt)})`;
      const body = buildEmailBody(resultItem);
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    item.append(copyWrap, emailButton);
    resultHistoryList.append(item);
  });
}

let savedResultHistory = resultHistoryStore.load();
renderSavedResultHistory(savedResultHistory);

historyClearButton.addEventListener('click', () => {
  savedResultHistory = [];
  resultHistoryStore.persist(savedResultHistory);
  renderSavedResultHistory(savedResultHistory);
});
