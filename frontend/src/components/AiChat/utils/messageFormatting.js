/**
 * Utility functions for formatting message content
 */

/**
 * Format raw markdown text to HTML
 * @param {string} text - The text to format
 * @returns {string} - The formatted HTML
 */
export const formatMarkdown = (text) => {
  // Replace markdown patterns with HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

/**
 * Remove citation markers from text
 * @param {string} content - The content to clean
 * @returns {string} - The cleaned content
 */
export const removeCitationMarkers = (content) => {
  return content.replace(/【\d+:\d+†source】/g, '');
};

/**
 * Checks if a paragraph is a numbered list item and extracts the components
 * @param {string} paragraph - The paragraph to check
 * @returns {Object|null} - The extracted components or null if not a list item
 */
export const parseNumberedListItem = (paragraph) => {
  const numberedListMatch = paragraph.match(/^(\d+)\.\s(.+)/);
  if (numberedListMatch) {
    const [_, number, text] = numberedListMatch;
    return { number, text };
  }
  return null;
};
