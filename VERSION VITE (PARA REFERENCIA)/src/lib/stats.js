const STATS_KEY = 'vortex-stats';

const getStats = () => {
    try {
        const statsFromStorage = localStorage.getItem(STATS_KEY);
        return statsFromStorage ? JSON.parse(statsFromStorage) : { post_stats: {} };
    } catch (error) {
        console.error("Error parsing stats from localStorage", error);
        return { post_stats: {} };
    }
};

const saveStats = (stats) => {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Error saving stats to localStorage", error);
    }
};

export const incrementVisit = (postId) => {
    const stats = getStats();
    if (!stats.post_stats[postId]) {
        stats.post_stats[postId] = { visits: 0, downloads: 0 };
    }
    stats.post_stats[postId].visits += 1;
    saveStats(stats);
};

export const incrementDownload = (postId) => {
    if (!postId) return;
    const stats = getStats();
    if (!stats.post_stats[postId]) {
        stats.post_stats[postId] = { visits: 0, downloads: 0 };
    }
    stats.post_stats[postId].downloads += 1;
    saveStats(stats);
};

export const getPostStats = (postId) => {
    const stats = getStats();
    return stats.post_stats[postId] || { visits: 0, downloads: 0 };
};

export const getAllStats = () => {
    return getStats().post_stats;
};