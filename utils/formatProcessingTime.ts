export const formatProcessingTime = (nanoseconds: number) => {
    const seconds = nanoseconds / 1e9;
    return seconds < 1 ? `${Math.round(seconds * 1000)}ms` : `${seconds.toFixed(1)}s`;
};