(function initCareerChoiceResultHistoryStore() {
  const storageKey = 'careerChoiceResultHistory.v3';
  const limit = 30;
  const dominantFactorLabels = {
    extrinsic:     'Extrinsic',
    intrinsic:     'Intrinsic',
    interpersonal: 'Interpersonal',
    other:         'Other',
    balanced:      'Balanced influences',
  };

  const allItemIds = [
    'v1','v2','v3','v4','v5','v6','v7','v8','v9','v10',
    'v11','v12','v13','v14','v15','v16','v17','v18','v19','v20',
    'v21','v22','v23','v24','v25','v26',
    'q1','q2','q3','q4','q5','q6','q7',
  ];

  const factorScoreKeys = [
    'prestigeFinancial',
    'securityOfEmployment',
    'workLifeBalance',
    'selfFulfilment',
    'goodCitizen',
    'looseRelations',
    'closeRelations',
    'predisposition',
    'travel',
  ];

  function toDate(value) {
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function normalize(rawResult) {
    if (!rawResult || typeof rawResult !== 'object') return null;
    const { id, career, ratings, factorScores, dominantFactorKey, testedAt } = rawResult;
    const testedAtDate = toDate(testedAt);

    const hasRatings =
      ratings &&
      typeof ratings === 'object' &&
      allItemIds.every((key) => typeof ratings[key] === 'number');

    const hasFactorScores =
      factorScores &&
      typeof factorScores === 'object' &&
      factorScoreKeys.every((key) => typeof factorScores[key] === 'number');

    if (
      !id ||
      typeof career !== 'string' ||
      !career.trim() ||
      !hasRatings ||
      !hasFactorScores ||
      typeof dominantFactorKey !== 'string' ||
      !dominantFactorLabels[dominantFactorKey] ||
      Number.isNaN(testedAtDate.getTime())
    ) {
      return null;
    }

    const normalizedRatings = Object.fromEntries(allItemIds.map((key) => [key, ratings[key]]));
    const normalizedFactorScores = Object.fromEntries(factorScoreKeys.map((key) => [key, factorScores[key]]));

    return {
      id: String(id),
      nickname: typeof rawResult.nickname === 'string' ? rawResult.nickname : '',
      career: career.trim(),
      ratings: normalizedRatings,
      factorScores: normalizedFactorScores,
      dominantFactorKey,
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

  function formatScoreSummary(factorScores) {
    return [
      `Prestige ${factorScores.prestigeFinancial.toFixed(2)}`,
      `Security ${factorScores.securityOfEmployment.toFixed(2)}`,
      `WLB ${factorScores.workLifeBalance.toFixed(2)}`,
      `Fulfilment ${factorScores.selfFulfilment.toFixed(2)}`,
    ].join(' · ');
  }

  window.careerChoiceResultHistoryStore = {
    limit,
    toDate,
    load,
    persist,
    formatScoreSummary,
    dominantFactorLabels,
  };
})();
