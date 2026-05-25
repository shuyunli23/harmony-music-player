/**
 * Format seconds to mm:ss format
 */
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format play count with K/M suffix
 */
export const formatPlayCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

/**
 * Generate random array of numbers for visualization
 */
export const generateRandomBars = (count, min = 10, max = 100) => {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min) + min)
  );
};

/**
 * Interpolate between two values
 */
export const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};
