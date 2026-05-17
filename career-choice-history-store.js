(function initCareerChoiceResultHistoryStore() {
  const storageKey = 'careerChoiceResultHistory.v1';
  const limit = 30;
  const dominantFactorLabels = {
    people: 'People around you',
    guidance: 'Teachers/counselor input',
    media: 'External material/media',
    balanced: 'Balanced influences',
  };

  function toDate(value) {
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function normalize(rawResult) {
    if (!rawResult || typeof rawResult !== 'object') return null;
    const { id, career, ratings, factorScores, dominantFactorKey, dominantFactor, testedAt } = rawResult;
    const testedAtDate = toDate(testedAt);
    const hasRatings =
      ratings &&
      typeof ratings.parents === 'number' &&
      typeof ratings.teachers === 'number' &&
      typeof ratings.peersAndFriends === 'number' &&
      typeof ratings.relativesAndFamilyFriends === 'number' &&
      typeof ratings.careerGuidanceCounselor === 'number' &&
      typeof ratings.visitingSpeakers === 'number' &&
      typeof ratings.promotionalMaterial === 'number';
    const hasFactorScores =
      factorScores &&
      typeof factorScores.people === 'number' &&
      typeof factorScores.guidance === 'number' &&
      typeof factorScores.media === 'number';

    const legacyDominantFactorKey =
      typeof dominantFactor === 'string'
        ? Object.entries(dominantFactorLabels).find(([, label]) => label === dominantFactor)?.[0]
        : '';
    const normalizedDominantFactorKey = dominantFactorKey || legacyDominantFactorKey;

    if (
      !id ||
      typeof career !== 'string' ||
      !career.trim() ||
      !hasRatings ||
      !hasFactorScores ||
      typeof normalizedDominantFactorKey !== 'string' ||
      !dominantFactorLabels[normalizedDominantFactorKey] ||
      Number.isNaN(testedAtDate.getTime())
    ) {
      return null;
    }

    return {
      id: String(id),
      career: career.trim(),
      ratings: {
        parents: ratings.parents,
        teachers: ratings.teachers,
        peersAndFriends: ratings.peersAndFriends,
        relativesAndFamilyFriends: ratings.relativesAndFamilyFriends,
        careerGuidanceCounselor: ratings.careerGuidanceCounselor,
        visitingSpeakers: ratings.visitingSpeakers,
        promotionalMaterial: ratings.promotionalMaterial,
      },
      factorScores: {
        people: factorScores.people,
        guidance: factorScores.guidance,
        media: factorScores.media,
      },
      dominantFactorKey: normalizedDominantFactorKey,
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
    return `People ${factorScores.people.toFixed(1)} · Guidance ${factorScores.guidance.toFixed(1)} · Media ${factorScores.media.toFixed(1)}`;
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
