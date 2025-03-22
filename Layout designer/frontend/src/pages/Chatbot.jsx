import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [showFertilizerPopup, setShowFertilizerPopup] = useState(false);
  const [showSuggestionsPopup, setShowSuggestionsPopup] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch CSRF token and initial message
  useEffect(() => {
    const fetchCsrfAndInitialMessage = async () => {
      try {
        // Fetch CSRF token from Django's help page
        const response = await fetch('http://127.0.0.1:8000/admin/help/', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const csrfToken = doc.querySelector('meta[name="csrf-token"]')?.content || '';
        localStorage.setItem('csrfToken', csrfToken);
        console.log("Fetched CSRF Token:", csrfToken);

        // Send initial message with the token
        const data = await sendMessage("Hello", csrfToken);
        setMessages([{ role: 'assistant', text: data.response || 'Welcome to the Smart Farming Chatbot!' }]);
        setResponseData(data);
      } catch (error) {
        console.error('Error fetching CSRF or initial message:', error);
        setMessages([{ role: 'assistant', text: 'Welcome! There was an issue connecting to the server.' }]);
      }
    };
    fetchCsrfAndInitialMessage();
  }, []);

  // Send message to Django API
  const sendMessage = async (query, csrfTokenOverride) => {
    const csrfToken = csrfTokenOverride || localStorage.getItem('csrfToken') || '';
    console.log("Sending POST request with query:", query, "CSRF Token:", csrfToken);
    try {
      const response = await fetch('http://127.0.0.1:8000/admin/chatbot-api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include', // Send session cookies
        body: `query=${encodeURIComponent(query)}`,
      });
      console.log("Response status:", response.status);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching response:', error);
      return { response: 'Sorry, something went wrong!', CarbonEmission: 0, carbon_percentage: 0 };
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const data = await sendMessage(input);
    const aiMessage = { role: 'assistant', text: data.response || 'No response provided.' };
    setMessages((prev) => [...prev, aiMessage]);
    setResponseData(data);

    if (data.fertilizer_recommendations?.length > 0) setShowFertilizerPopup(true);
    if (data.suggestions?.length > 0) setShowSuggestionsPopup(true);

    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-gray-100 min-h-screen p-6 font-sans">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-green-800 drop-shadow-md">Smart Farming Chatbot</h1>
        <p className="text-lg text-gray-600 mt-2">Your AI companion for sustainable agriculture</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col h-[calc(100vh-12rem)]">
          <div className="bg-green-600 text-white p-4 rounded-t-2xl -mx-6 -mt-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-2a2 2 0 012-2h10a2 2 0 012 2v2h-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Farm Assistant</span>
          </div>
          <div className="flex-1 overflow-y-auto mt-4 px-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-4 rounded-2xl shadow-md ${
                    msg.role === 'user' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your farm..."
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               ,size=24                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>

        {/* Dashboard Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carbon Emission Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Carbon Footprint
            </h3>
            <p className="text-3xl font-bold text-gray-800">{responseData?.CarbonEmission || 'N/A'} kg CO₂e</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${responseData?.carbon_percentage || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {responseData?.carbon_percentage || 0}% of max emissions (100 kg CO₂e)
              </p>
            </div>
          </div>

          {/* Farming Practices Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Farming Practices
            </h3>
            <p className="text-sm">
              <span className="font-medium">Tillage:</span> {responseData?.farming_practices.tillage_method || 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Irrigation:</span> {responseData?.farming_practices.irrigation_type || 'N/A'} (
              {responseData?.farming_practices.irrigation_frequency || 0} times)
            </p>
            <p className="text-sm">
              <span className="font-medium">Residue:</span> {responseData?.crop_residue_management || 'N/A'}
            </p>
          </div>

          {/* Crop Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:col-span-2">
            <h3 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 1.857h10M9 4h6m-6 0a3 3 0 00-3 3m3-3V3m6 1a3 3 0 013 3m-3-3V3" />
              </svg>
              Crop Details
            </h3>
            {responseData?.crop_details.length > 0 ? (
              <table className="w-full text-sm text-gray-600">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Crop</th>
                    <th className="py-2 text-left">Area</th>
                    <th className="py-2 text-left">Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {responseData.crop_details.map((crop, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{crop.cropName || 'N/A'}</td>
                      <td className="py-2">{crop.area || 0} {crop.unit || 'N/A'}</td>
                      <td className="py-2">{crop.crop_yield || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No crop details yet. Tell me about your crops!</p>
            )}
          </div>
        </div>
      </div>

      {/* Fertilizer Recommendations Popup */}
      {showFertilizerPopup && responseData?.fertilizer_recommendations?.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFertilizerPopup(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-green-700 mb-4">Fertilizer Recommendations</h3>
            {responseData.fertilizer_recommendations.map((rec, index) => (
              <div key={index} className="mb-4 p-4 bg-green-50 rounded-xl">
                <h4 className="text-lg font-medium text-green-800">{rec.fertilizer_type || 'N/A'}</h4>
                <p className="text-sm"><span className="font-medium">Amount:</span> {rec.amount || 0} {rec.unit || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Timing:</span> {rec.best_time_to_apply || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Reason:</span> {rec.reason || 'N/A'}</p>
              </div>
            ))}
            <button
              onClick={() => setShowFertilizerPopup(false)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Suggestions Popup */}
      {showSuggestionsPopup && responseData?.suggestions?.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSuggestionsPopup(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-purple-700 mb-4">Suggestions</h3>
            {responseData.suggestions.map((suggestion, index) => (
              <div key={index} className="mb-4 p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-800">{suggestion}</p>
              </div>
            ))}
            <button
              onClick={() => setShowSuggestionsPopup(false)}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;