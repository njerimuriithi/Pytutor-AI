import axios from "axios";
import {api_router} from "./api_routes";

let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

export async function RegisterNewStudent(data = {}) {
  return axios.post(`${api_router}/students/`,data, {
  });
}


/*export async function fetchQuestion(level, topics) {
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
}*/
export async function saveLearningSession(data) {
  try {
    const response = await axios.post(`${api_router}/learning-session`, data);
    return response.data;
  } catch (error) {
    console.error("Error saving learning session:", error);
    throw error;
  }
}
export async function fetchQuestion(level, topics) {
  try {
    const topicsString = Array.isArray(topics)
      ? topics.join(",")
      : topics;

    const response = await axios.get(`${api_router}/question`, {
      params: {
        level,
        topics: topicsString,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}
export async function fetchTopicToLearn(level, topics) {
  try {
    const topicsStr = Array.isArray(topics)
      ? topics.map(t => t.trim()).join(",")
      : topics.trim();
    console.log('topics',topicsStr);
    const response = await axios.get(`${api_router}/learn`, {

      params: {
        level: level,
        topics: topicsStr,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching lesson:", error);
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
export async function fetchStudentsData() {
  try {
    const response = await axios.get(`${api_router}/dashboard/students`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard students:", error);
    throw error;
  }
}

export async function Fetchallstudentsdata() {
  try {
    const response = await axios.get(`${api_router}/dashboard/allstudentsdata`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard students:", error);
    throw error;
  }
}

export async function fetchTopicsData() {
  try {
    const response = await axios.get(`${api_router}/dashboard/topics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics data:", error);
    throw error;
  }
}

export async function fetchStudentsPerfomanceData() {
  try {
    const response = await axios.get(`${api_router}/dashboard/studentperformance`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics data:", error);
    throw error;
  }
}

export async function fetchIndividualStudentsData(studentId) {
  try {
    console.log('axios',studentId)
    const response = await axios.get(`${api_router}/studentdashboard/4`);
    return response.data;
  } catch (error) {
    console.error("Error fetching indivual students data:", error);
    throw error;
  }
}

