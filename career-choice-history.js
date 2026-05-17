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

function formatEmailSubjectDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(store.toDate(dateValue));
}

function buildEmailBody(resultItem) {
  const dominantTitle = store.dominantFactorLabels[resultItem.dominantFactorKey] ?? store.dominantFactorLabels.balanced;
  const lines = [
    '3 Factors of Career Choice Result',
    '',
    ...(resultItem.nickname ? [`Tester: ${resultItem.nickname}`, ''] : []),
    `Intended career: ${resultItem.career}`,
    `Tested at: ${formatTestedAt(resultItem.testedAt)}`,
    `Dominant factor: ${dominantTitle}`,
    '',
    `People around you: ${resultItem.factorScores.people.toFixed(1)} / 5`,
    `Teachers/counselor input: ${resultItem.factorScores.guidance.toFixed(1)} / 5`,
    `External material/media: ${resultItem.factorScores.media.toFixed(1)} / 5`,
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
    title.textContent = `${nicknamePrefix}${resultItem.career} | ${store.dominantFactorLabels[resultItem.dominantFactorKey] ?? store.dominantFactorLabels.balanced}`;

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = `${store.formatScoreSummary(resultItem.factorScores)} · ${formatTestedAt(resultItem.testedAt)}`;
    copyWrap.append(title, meta);

    const emailButton = document.createElement('button');
    emailButton.type = 'button';
    emailButton.className = 'text-link history-view-button';
    emailButton.textContent = 'Email result';
    emailButton.addEventListener('click', () => {
      const subject = `Career Choice Result (${formatEmailSubjectDate(resultItem.testedAt)})`;
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
