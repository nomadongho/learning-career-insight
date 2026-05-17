(function initSurfaceDeepResultHistoryStore() {
  const storageKey = 'surfaceDeepLearnersResultHistory.v1';
  const limit = 30;

  function toDate(value) {
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function normalizeResponses(rawResponses) {
    if (!Array.isArray(rawResponses)) return null;
    if (!rawResponses.every((value) => typeof value === 'string')) return null;
    return [...rawResponses];
  }

  function normalize(rawResult) {
    if (!rawResult || typeof rawResult !== 'object') return null;
    const { id, deepTotal, surfaceTotal, dominantType, testedAt, nickname, responses } = rawResult;
    const testedAtDate = toDate(testedAt);
    if (
      !id ||
      typeof deepTotal !== 'number' ||
      typeof surfaceTotal !== 'number' ||
      typeof dominantType !== 'string' ||
      Number.isNaN(testedAtDate.getTime())
    ) {
      return null;
    }
    const normalizedResponses = normalizeResponses(responses);
    if (responses !== undefined && responses !== null && !normalizedResponses) {
      return null;
    }

    return {
      id: String(id),
      nickname: typeof nickname === 'string' ? nickname : '',
      responses: normalizedResponses,
      deepTotal,
      surfaceTotal,
      dominantType,
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

  function formatScoreSummary(resultItem) {
    return `Deep ${resultItem.deepTotal} / Surface ${resultItem.surfaceTotal}`;
  }

  window.surfaceDeepResultHistoryStore = {
    limit,
    toDate,
    load,
    persist,
    formatScoreSummary,
  };
})();
