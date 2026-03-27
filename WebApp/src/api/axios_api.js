import axios from "axios";
import {api_router} from "./api_routes";

let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

export async function RegisterNewStudent(data = {}) {
  return axios.post(`${api_router}/students/`,data, {
  });
}


export async function fetchQuestion(level, topics) {
  try {
    const topicsArray = Array.isArray(topics) ? topics : [topics];

    const response = await axios.get(`${api_router}/question/`, {
      params: { level, topics: topicsArray },
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        searchParams.append("level", params.level);
        params.topics.forEach(topic => searchParams.append("topics", topic));
        return searchParams.toString();
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function saveQuizResults(results) {
  try {
    const response = await axios.post(`${api_router}/quizresults/`, results);
    return response.data;
  } catch (error) {
    console.error("Error saving quiz results:", error);
  }
}

