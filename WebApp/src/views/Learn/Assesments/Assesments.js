import React,{useState} from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CCardTitle,
  CCardText,
  CButton,
  CCardHeader,
  CFormCheck
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import {cilSortAscending} from "@coreui/icons";
import {advancedTopics, basicTopics, InterMediateTopics} from "src/views/pages/register/Topics";
import { useNavigate } from 'react-router-dom';
const Assesments = () => {
  const navigate = useNavigate();
  const[topic,setTopic] = useState(false);
  const [selected, setSelected] = useState([]);
  const [topicLevel, setTopicLevel] = useState(null);
  const getTopicsByLevel = () => {
    switch (topicLevel) {
      case 'beginner':
        return basicTopics;
      case 'intermediate':
        return InterMediateTopics;
      case 'advanced':
        return advancedTopics;
      default:
        return [];
    }
  };
  const levelDescriptions = {
    beginner: "Test your understanding of Python basics and core concepts. Perfect for beginners.",
    intermediate: "Enhance your skills with intermediate Python concepts and real-world examples.",
    advanced: "Challenge yourself with advanced Python topics like decorators and concurrency."
  };
  const levelTopics={
    beginner:"Introduction to Python",
    intermediate:"Intermediate Python",
    advanced:"Advanced Python"
  }
  const handleTopicSelect = (topic) => {
    setTopic(true);
  }
  const handleLevelSelect = (level) => {
    console.log(level)
    setTopicLevel(level);
    setSelected([]);
  };
  if (topicLevel) {
    return (
      <CCard className="w-75 mb-4 shadow-sm">
        <CCardBody>

          {/* TITLE */}
          <div className="mb-3">
            <h5 className="mb-1">Choose a Topic</h5>
            <small className="text-body-secondary">
              Test Your Understanding
            </small>
          </div>

          {/* RADIO LIST */}
          <CRow className="mb-3">
            {getTopicsByLevel().map((topic, index) => (
              <CCol md={6} key={index} className="mb-2">
                <div
                  className={`border rounded p-2 d-flex align-items-center
                ${selected === topic ? "bg-light border-primary" : ""}`}
                >
                  <CFormCheck
                    type="radio"
                    name="topic"
                    id={`topic-${index}`}
                    label={topic}
                    checked={selected === topic}
                    onChange={() => setSelected(topic)}
                  />
                </div>
              </CCol>
            ))}
          </CRow>
          <div className="mb-3">
            <small className="text-body-secondary">
              Selected:{" "}
              <strong>{selected || "None"}</strong>
            </small>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <CButton
              color="danger"
              onClick={() => navigate(0)}
            >
              Cancel
            </CButton>


            <CButton
              color="success"
              disabled={!selected}
              onClick={() => {
                navigate('/Learn/Assesments/Questions', {
                  state: { level: topicLevel, topics: [selected] }
                })
              }}
            >
              Continue
            </CButton>

          </div>

        </CCardBody>
      </CCard>
    )
  }

  return(
    <>

      <CRow>
        {['beginner', 'intermediate', 'advanced'].map((level) => (

            <CCard className="mb-3 w-75" >
              <CCardBody>
                <CCardHeader className="mb-3" as="h5" >{levelTopics[level]}</CCardHeader>
                <CCardTitle>
                  <CIcon icon={cilSortAscending} size="xl"  style={{'--ci-primary-color': 'green'}}/>
                  {level}</CCardTitle>
                <CCardText>
                  {levelDescriptions[level]}
                </CCardText>
                <CButton color="success" onClick={() => handleLevelSelect(level)}>Select Topic</CButton>
              </CCardBody>
            </CCard>

        ))}


      </CRow>

    </>


  )
}
export  default Assesments;
