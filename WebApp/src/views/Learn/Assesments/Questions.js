import React,{useState,useEffect} from 'react'
import {CCard,CCardBody,CCardSubtitle,CFormCheck,CButton,CSpinner,CCardTitle,CCol,CRow} from "@coreui/react";
import {fetchQuestion, saveQuizResults} from "src/api/axios_api";
import {useLocation, useNavigate} from 'react-router-dom';
import {getGrade} from "src/views/pages/register/Topics";
const Questions = () => {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetchQuestions = async (level, topics) => {
    try {
      setLoading(true);
      const response = await fetchQuestion(level, topics);
      setData(response);
      setStartTime(new Date());

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (level && topics) {
      fetchQuestions(level, topics);
    }
  }, [level, topics]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <CSpinner color="success" variant="grow" />
      </div>
    );
  }

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
//Grading System

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
    console.log(answers);
  };
//Time spend on the quiz
  const getTimeSpent = () => {
    if (!startTime || !endTime) return 0;
    return Math.floor((endTime - startTime) / 1000); // seconds
  };

  // Submit results to backend
  const handleSubmitQuiz = async () => {
    try {
      // Calculate score
      let correct = 0;
      setSubmitting(true);

      data.questions.forEach((q, index) => {
        if (answers[index] === q.correct_answer) {
          correct++;
        }
      });
      const answered = Object.keys(answers).length;
      const wrong = answered - correct;
      const totalQuestions = data.questions.length;

      let scorePercent = 0;
      if (answered > 0) {
        scorePercent = Math.round((correct / answered) * 100);
      }
      const completed = answered === totalQuestions;
      const grade = getGrade(scorePercent);
      const timeSpentSeconds = getTimeSpent();

      const results = {
        topics_interested: topics.join(","),
        level: level,
        total_questions: totalQuestions,
        answered_questions: answered,
        correct_answers: correct,
        completed: completed,
        time_spent: timeSpentSeconds
      };

      console.log("Submitting results:", results);

      await saveQuizResults(results);

      navigate('/Learn/Assesments/Assesments');

    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const getGradeColor = (grade) => {
    switch (grade) {
      case "Excellent":
        return "success";
      case "Good":
        return "primary";
      case "Average":
        return "warning";
      default:
        return "danger";
    }
  };
  if (finished) {
    const answered = Object.keys(answers).length;
    const wrong = answered - score;
    const scorePercent =
      answered > 0 ? Math.round((score / answered) * 100) : 0;
    const grade = getGrade(scorePercent);
    return (
      <div className="justify-content-center bg-body-tertiary d-flex flex-row align-items-center">
        <CCard className="w-75 mb-3 shadow">
          <CCardBody className="text-center">

            <CCardTitle className="mb-4">Assessment Finished</CCardTitle>

            <div className="row text-start">
              <div className="col">
                <p><strong>Total Questions:</strong> {data.questions.length}</p>
                <p><strong>Answered Questions:</strong> {answered}</p>
                <p><strong>Correct Answers:</strong> {score}</p>
              </div>

              <div className="col">
                <p>
                  <strong>Score:</strong>{" "}
                  <span className={`badge bg-${getGradeColor(grade)}`}>
              {scorePercent}% - {grade}
            </span>
                </p>

                <p><strong>Time Spent:</strong> {getTimeSpent()} seconds</p>
              </div>
            </div>


            <div className="mt-4 d-flex justify-content-center gap-2">
              <CButton
                color="success"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    <span role="status">Loading...</span>
                  </>
                ) : (
                  "Save"
                )}
              </CButton>


            </div>

          </CCardBody>
        </CCard>
      </div>
     /* <div className="justify-content-center bg-body-tertiary d-flex flex-row align-items-center" >
        <CCard className="w-75 mb-3">
          <CCardBody>
            <CCardTitle>Assessment Finished</CCardTitle>
            <p>Total Questions: {data.questions.length}</p>
            <p>Answered Questions: {answered}</p>
            <p>Correct Answers: {score}</p>

            <p>Score: {scorePercent}%</p>
            <p>Grade: {grade}</p>


            <CButton color="primary" onClick={handleSubmitQuiz} nClick={() => {
              // Navigate to questions page
              navigate('/Learn/Assesments/Assesments', {
                state: { level: topicLevel, topics: selected }
              });
            }}>
              OK
            </CButton>
          </CCardBody>
        </CCard>

      </div>*/

    );
  }
  return(
    <div className="justify-content-center bg-body-tertiary d-flex flex-row align-items-center" >
      {question && (
        <CCard className="w-75 mb-3" >
          <CCardBody className="justify-content-center">
            <CRow className="mb-4">
              <CCol xs={6}>
                <CCardTitle as="h5" >{topics}</CCardTitle>
              </CCol>
              <CCol xs={6}>
                <CCardSubtitle className="d-grid gap-3 d-md-flex justify-content-md-end"  >
                  {currentQuestion + 1} / {data.questions.length}
                </CCardSubtitle >
              </CCol>
            </CRow>


            <CCardTitle className="mb-4 text-body-primary">
              {question.question}
            </CCardTitle>

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
                <div className="d-grid gap-4 d-md-flex justify-content-md-start mt-4">
                  <CButton
                    color="success"
                    onClick={handleNext}
                    disabled={!selectedOption}
                  >
                    Next
                  </CButton>

                  <CButton
                    color="danger"
                    onClick={() => {
                      setFinished(true);
                      setEndTime(new Date());
                    }}
                  >
                    Cancel
                  </CButton>
                </div>
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
