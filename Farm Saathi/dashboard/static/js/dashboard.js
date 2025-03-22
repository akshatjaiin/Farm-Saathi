const { useState, useEffect } = React;

function Dashboard({ initialData }) {
  const [data, setData] = useState(initialData || {});
  const [showFertilizerPopup, setShowFertilizerPopup] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.CarbonEmission > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
          <div className="bg-gradient-green text-white p-4 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
            Carbon Footprint
          </div>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-800">{data.CarbonEmission} kg CO₂e</h4>
                <p className="text-gray-500 text-sm">Total Emissions</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full">
              <div className="bg-green-600 progress-bar" style={{ width: `${data.carbon_percentage}%` }}></div>
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              {data.carbon_percentage < 50 ? "Lower than average farm emissions" : "Average compared to similar farms"}
            </p>
          </div>
        </div>
      )}

      {(data.farming_practices?.tillage_method !== "none" || data.farming_practices?.irrigation_type !== "none" || data.crop_residue_management !== "none") && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
          <div className="bg-gradient-blue text-white p-4 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Farming Practices
          </div>
          <div className="p-4">
            {data.farming_practices?.tillage_method !== "none" && (
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-8a1 1 0 00-.4-.8l-3-2.25A1 1 0 0011 1H4a1 1 0 00-1 1v2zm6.24 1.8l3.76 2.82V12H9V4.8h.24z" />
                  </svg>
                </div>
                <div>
                  <h6 className="font-medium">Tillage:</h6>
                  <p className="text-gray-500 text-sm">{data.farming_practices.tillage_method}</p>
                </div>
              </div>
            )}
            {data.farming_practices?.irrigation_type !== "none" && (
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.893 3.282a.75.75 0 01.025 1.06l-4.5 5a.75.75 0 01-1.085 0l-4.5-5a.75.75 0 111.085-1.035l3.957 4.397 3.957-4.397a.75.75 0 011.06-.025z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h6 className="font-medium">Irrigation:</h6>
                  <p className="text-gray-500 text-sm">{data.farming_practices.irrigation_type} ({data.farming_practices.irrigation_frequency || 0} times/week)</p>
                </div>
              </div>
            )}
            {data.crop_residue_management !== "none" && (
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h6 className="font-medium">Residue:</h6>
                  <p className="text-gray-500 text-sm">{data.crop_residue_management}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {data.crop_details?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
          <div className="bg-gradient-yellow text-white p-4 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
            Crop Details
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.crop_details.map((crop, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-600">{crop.cropName || "Unknown"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{crop.area || 0} {crop.unit || "hectares"}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{crop.crop_yield || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.suggestions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg">
          <div className="bg-gradient-purple text-white p-4 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Suggestions
          </div>
          <div className="p-4">
            {data.suggestions.map((suggestion, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                <h6 className="text-purple-700 font-medium">{suggestion}</h6>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.fertilizer_recommendations?.length > 0 && showFertilizerPopup && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFertilizerPopup(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="bg-gradient-green text-white p-4 font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
              </svg>
              Fertilizer Recommendations
            </div>
            <div className="p-4">
              {data.fertilizer_recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 mb-4">
                  <h5 className="text-green-700 font-medium">{rec.fertilizer_type || "Unknown"}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm"><span className="font-medium">Amount:</span> {rec.amount || 0} {rec.unit || "kg"}</p>
                      <p className="text-sm"><span className="font-medium">Timing:</span> {rec.best_time_to_apply || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-medium">Reason:</span> {rec.reason || "General use"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowFertilizerPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {data.fertilizer_recommendations?.length > 0 && !showFertilizerPopup && (
        <button
          className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700"
          onClick={() => setShowFertilizerPopup(true)}
        >
          View Fertilizer Recommendations
        </button>
      )}
    </div>
  );
}

// Chat handling and initial render
document.addEventListener("DOMContentLoaded", function () {
  const initialData = JSON.parse(document.getElementById("initial-data").textContent);
  const csrfToken = JSON.parse(document.getElementById("csrf-token").textContent);
  const helpUrl = JSON.parse(document.getElementById("help-url").textContent);

  console.log("Initial Data:", initialData); // Debug initial data
  ReactDOM.render(<Dashboard initialData={initialData} />, document.getElementById("dashboard-root"));

  function scrollChatToBottom() {
    const chatHistory = document.getElementById("chat-history");
    if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
  }
  scrollChatToBottom();

  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const query = document.getElementById("query").value;
      const chatHistory = document.getElementById("chat-history");

      if (chatHistory && query) {
        chatHistory.innerHTML += `
          <div class="bg-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg p-3 mb-3 ml-auto max-w-xs">
            <p class="text-gray-800 text-sm">${query}</p>
          </div>
        `;
        scrollChatToBottom();

        document.getElementById("query").value = "";

        try {
          const response = await fetch(helpUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-CSRFToken": csrfToken,
              "X-Requested-With": "XMLHttpRequest",
            },
            body: "query=" + encodeURIComponent(query),
          });

          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

          const data = await response.json();
          console.log("Response Data:", data); // Debug backend response

          if (chatHistory) {
            chatHistory.innerHTML += `
              <div class="bg-green-50 border-l-4 border-green-500 rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 mb-3 mr-auto max-w-xs">
                <p class="text-gray-800 text-sm">${data.response || "No response"}</p>
              </div>
            `;
            scrollChatToBottom();
          }

          ReactDOM.render(<Dashboard initialData={data} />, document.getElementById("dashboard-root"));
          if (data.fertilizer_recommendations?.length > 0) setShowFertilizerPopup(true);
        } catch (error) {
          console.error("Error:", error);
          if (chatHistory) {
            chatHistory.innerHTML += `
              <div class="bg-green-50 border-l-4 border-green-500 rounded-tl-lg rounded-tr-lg rounded-bl-lg p-3 mb-3 mr-auto max-w-xs">
                <p class="text-gray-800 text-sm">Error: ${error.message}</p>
              </div>
            `;
            scrollChatToBottom();
          }
        }
      }
    });
  } else {
    console.error("Chat form not found");
  }
});