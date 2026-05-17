(function initResultHistoryStore() {
  const storageKey = 'learningStylesResultHistory.v1';
  const limit = 30;

  function toDate(value) {
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function normalizeSelections(rawSelections) {
    if (!Array.isArray(rawSelections)) return null;
    const normalized = rawSelections.map((row) => {
      if (!Array.isArray(row)) return null;
      if (!row.every((value) => typeof value === 'string')) return null;
      return [...row];
    });
    return normalized.every(Boolean) ? normalized : null;
  }

  function normalize(rawResult) {
    if (!rawResult || typeof rawResult !== 'object') return null;
    const { id, scores, styleResult, testedAt, nickname, selections } = rawResult;
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
    const normalizedSelections = normalizeSelections(selections);
    if (selections !== undefined && !normalizedSelections) {
      return null;
    }

    return {
      id: String(id),
      nickname: typeof nickname === 'string' ? nickname : '',
      selections: normalizedSelections,
      scores: { CE: scores.CE, RO: scores.RO, AC: scores.AC, AE: scores.AE },
      styleResult: {
        name: styleResult.name,
        horizontal: styleResult.horizontal,
        vertical: styleResult.vertical,
      },
      testedAt: testedAtDate.toISOString(),
    };
  }

  function load() {
    try {
      const rawValue = localStorage.getItem(storageKey);
      if (!rawValue) return [];
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalize).filter(Boolean).slice(0, limit);
    } catch (error) {
      return [];
    }
  }

  function persist(items) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function formatScoreSummary(scores) {
    return `${scores.CE}/${scores.RO}/${scores.AC}/${scores.AE}`;
  }

  window.resultHistoryStore = {
    limit,
    toDate,
    load,
    persist,
    formatScoreSummary,
  };
})();
