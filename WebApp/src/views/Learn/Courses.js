import React,{useState} from 'react'
import { CButton, CCard, CCardBody, CCardText, CCardTitle,CCardLink ,CListGroupItem,CModal,
  CModalHeader, CModalTitle, CModalBody, CModalFooter, CCarousel, CCarouselItem
} from '@coreui/react'
import {basicTopics, InterMediateTopics, advancedTopics, splitLesson} from "src/views/pages/register/Topics";
import {fetchTopicToLearn} from "src/api/axios_api";
import ReactMarkdown from "react-markdown";
import {useNavigate} from "react-router-dom";
const Courses = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [lesson, setLesson] = useState("");
  const [loading, setLoading] = useState(false);

  const openLessonModal = async (topic, level) => {
    setModalVisible(true);
    setSelectedTopic(topic)
    setLoading(true);
    setSelectedLevel(level);

    try {
      const data = await fetchTopicToLearn(level, topic);
      console.log(data);
      setLesson(data.lesson);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };
  const sections = lesson.split("## ").filter(Boolean);


  const renderTopicLinks = (topicsArray, level) => {
      return topicsArray.map((topic, index) => (
      <CListGroupItem key={index}>
        <CCardLink
          href="#"
          onClick={(e) => {
            e.preventDefault()
            openLessonModal(topic.trim(), level)
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
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="VerticallyCenteredScrollableExample2"
      >
        <CModalHeader>
          <CModalTitle id="VerticallyCenteredScrollableExample2">{selectedTopic}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loading ? (
            <p>Loading lesson...</p>
          ) : (

            <CCarousel controls indicators dark>
              {sections.map((section, index) => (
                <CCarouselItem key={index}>
                  <div style={{ padding: "15px" }}>
                    <ReactMarkdown>{"## " + section}</ReactMarkdown>
                  </div>
                </CCarouselItem>
              ))}
            </CCarousel>
          )}
        </CModalBody>
        {/*<CModalBody>
          {sections.map((section, index) => (

              <div style={{ padding: "15px" }}>
                <ReactMarkdown>{section}</ReactMarkdown>
              </div>

          ))}
        </CModalBody>*/}
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary"
                   onClick={() => {
                     // Navigate to questions page
                     navigate('/Questions', {
                       state: { level: selectedLevel, topics:[selectedTopic] }
                     });
                   }}
          >Test Your Understanding</CButton>
        </CModalFooter>
      </CModal>


    </>
  )
}
export  default Courses;
