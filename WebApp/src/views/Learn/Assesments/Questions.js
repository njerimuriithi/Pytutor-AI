import React,{useState,useEffect} from 'react'
import {CCard,CCardBody,CCardSubtitle,CFormCheck,CButton} from "@coreui/react";
import {cilUser,cilArrowRight} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {fetchQuestion, saveQuizResults} from "src/api/axios_api";
import { useLocation } from 'react-router-dom';
const Questions = () => {
  const [data, setData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const location = useLocation();
  const { level, topics } = location.state || {};
  console.log('Onclickquestionspage',level,topics);

  useEffect(() => {
    if (level && topics) {
      fetchQuestions(level, topics); // pass to your system prompt
    }
  }, [level, topics]);

  const fetchQuestions = async (level, topics) => {
    try {
      const response = await fetchQuestion(level, topics);

      setData(response);
      setStartTime(new Date());
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };
  const handleNext = () => {
    if (!selectedOption || !question) return;

    const correct = selectedOption === question.correct_answer;

    if (correct) {
      setScore(prev => prev + 1);
    }

    setIsCorrect(correct);
    setShowResult(true);
  };
  const question = data?.questions?.[currentQuestion];
console.log('question',question);
  // CONTINUE TO NEXT QUESTION
  const handleContinue = () => {
    setShowResult(false);
    setSelectedOption("");

    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setEndTime(new Date());
      setFinished(true);
    }
  };
  //Store the answer
  const handleSelect = (option) => {
    setSelectedOption(option);

    setAnswers({
      ...answers,
      [currentQuestion]: option
    });
  };
//Time spend on the quiz
  const getTimeSpent = () => {
    if (!startTime || !endTime) return 0;
    return Math.floor((endTime - startTime) / 1000); // seconds
  };
  const handleSubmitQuiz = async () => {
    try {
      // Calculate score
      let score = 0;

      data.questions.forEach((q, index) => {
        if (answers[index] === q.correct_answer) {
          score++;
        }
      });
      const timeSpentSeconds = getTimeSpent()
      const results = {
        topics_interested: topics.join(","),
        score: score,
        total_questions: data.questions.length,
        time_spent : timeSpentSeconds,
        level: level
      };

      console.log("Submitting results:", results);

      await saveQuizResults(results);

      // Redirect to results page
      //navigate("/results", { state: results });

    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };
  if (finished) {
    return (
      <CCard className="w-50 mb-3">
        <CCardBody>
          <h4>Assessment Finished</h4>
          <p>Score: {score} / {data.questions.length}</p>
          <p>Attempted: {Object.keys(answers).length}</p>
          <p>Time Spent: {getTimeSpent()} seconds</p>

          <CButton color="primary" onClick={handleSubmitQuiz}>
            OK
          </CButton>
        </CCardBody>
      </CCard>
    );
  }
  return(
    <div >
      {question && (
        <CCard className="w-50 mb-3">
          <CCardBody>

            <p>
              Question {currentQuestion + 1} / {data.questions.length}
            </p>

            <CCardSubtitle className="mb-4 text-body-secondary">
              {question.question}
            </CCardSubtitle>

            {/* BEFORE ANSWER */}
            {!showResult ? (
              <>
                {Object.entries(question.options || {}).map(([key, value]) => (
                  <CFormCheck
                    key={key}
                    id={key}
                    name="option"
                    label={`${key}: ${value}`}
                    checked={selectedOption === key}
                    onChange={() => handleSelect(key)}
                  />
                ))}

                <CButton
                  color="success"
                  className="mt-4"
                  onClick={handleNext}
                  disabled={!selectedOption}
                >
                  Next
                </CButton>
              </>
            ) : (
              /* AFTER ANSWER */
              <>
                {isCorrect ? (
                  <h5 style={{ color: "green" }}>Correct ✅</h5>
                ) : (
                  <>
                    <h5 style={{ color: "red" }}>Wrong ❌</h5>
                    <p>Correct Answer: {question.correct_answer}</p>
                    <p>{question.explanation}</p>
                  </>
                )}

                <CButton
                  color="primary"
                  className="mt-4"
                  onClick={handleContinue}
                >
                  Continue
                </CButton>
              </>
            )}

          </CCardBody>
        </CCard>
      )}




    </div>

      )
      }
    export  default Questions;
