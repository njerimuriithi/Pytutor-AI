import React,{useState} from 'react'
import { CButton, CCard, CCardBody, CCardText, CCardTitle,CCardLink ,CListGroupItem,CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react'
import {basicTopics,InterMediateTopics,advancedTopics} from "src/views/pages/register/Topics";
import {fetchTopicToLearn} from "src/api/axios_api";
import ReactMarkdown from "react-markdown";
const Courses = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [lesson, setLesson] = useState("");
  const [loading, setLoading] = useState(false);

  const openLessonModal = async (topic, level) => {
    setModalVisible(true);
    setLoading(true);

    try {
      const data = await fetchTopicToLearn(level, topic);
      console.log(data);
      setLesson(data.lesson);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };


  const handleTopicClick = (topic, level) => {
    console.log(topic, level)
    setSelectedTopic(topic)
    setSelectedLevel(level)
    setModalVisible(true)
  }
  const renderTopicLinks = (topicsArray, level) => {
    return topicsArray.map((topic, index) => (
      <CListGroupItem key={index}>
        <CCardLink
          href="#"
          onClick={(e) => {
            e.preventDefault()
            handleTopicClick(topic.trim(), level) // trim extra spaces
          }}
        >
          {topic.trim()}
        </CCardLink>
      </CListGroupItem>
    ))
  }
  return(
    <>
      <CCard className="w-75 mb-3">
        <CCardBody>
          <CCardTitle>Beginner Courses</CCardTitle>
          {renderTopicLinks(basicTopics, 'Beginner')}
        </CCardBody>
      </CCard>

      <CCard className="w-75 mb-3">
        <CCardBody>
          <CCardTitle>Intermediate Courses</CCardTitle>
          {renderTopicLinks(InterMediateTopics, 'Intermediate')}
        </CCardBody>
      </CCard>

      {/* Advanced Card */}
      <CCard className="w-75 mb-3">
        <CCardBody>
          <CCardTitle>Advanced Courses</CCardTitle>
          {renderTopicLinks(advancedTopics, 'Advanced')}
        </CCardBody>
      </CCard>

      <CModal
        alignment="center"
        scrollable
        visible={modalVisible}
        onClose={() => setVisible(false)}
        aria-labelledby="VerticallyCenteredScrollableExample2"
      >
        <CModalHeader>
          <CModalTitle id="VerticallyCenteredScrollableExample2">{selectedTopic}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <p>Loading lesson...</p>
          ) : (
            <p>{lesson}</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary">Test Your Understanding</CButton>
        </CModalFooter>
      </CModal>

    </>
  )
}
export  default Courses;
