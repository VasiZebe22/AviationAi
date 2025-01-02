export const getAssistantResponse = async (query, token) => {
  try {
    if (!query || !token) {
      throw new Error('Query and authentication token are required');
    }

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/assistant-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network response was not ok');
    }

    return data;
  } catch (error) {
    // Log only non-sensitive error information
    console.error('API Error:', error.message);
    throw new Error('Failed to get AI response: ' + error.message);
  }
};
