export const getAssistantResponse = async (query, token) => {
  try {
    console.log('Making request to:', `${process.env.REACT_APP_BACKEND_URL}/assistant-query`);
    console.log('Token:', token?.substring(0, 10) + '...');
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/assistant-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log('Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Network response was not ok');
    }

    return data;  // Return the data directly since backend sends { response: ... }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
