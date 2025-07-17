// src/api/index.ts

export const fetchAhaslidesData = async (accessCode: string) => {
  // Yêu cầu này sẽ được Netlify chuyển hướng đến function
  const apiUrl = `/api/get-data-ahaslides/${accessCode}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || "Network response was not ok");
  }
  return response.json();
};

export const fetchAhaslidesAnswers = async (
  accessCode: string,
  slideId: string
) => {
  const apiUrl = `/api/get-data-ahaslides/${accessCode}/${slideId}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.details || "Network response for answers was not ok"
    );
  }
  return response.json();
};
