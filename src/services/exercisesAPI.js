import axios from "axios";

const API_URL = "https://english-app-mupk.onrender.com/api/exercises";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjBjYjVkZTU1OGViNGVjNGUyMTRiYyIsInVzZXJuYW1lIjoiYWRtaW5fcHJvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NTEwNzc0LCJleHAiOjE3NjcxMDI3NzR9.ftndYpKvzikHYyBVhNwBI3ek-OcngKAyPSlnwuD6SsY";

export const fetchVocabExercises = async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const items = res.data?.data || [];
    
    return items; 
  } catch (error) {
    console.error("API error:", error.response?.status || error.message);
    throw error;
  }
};
