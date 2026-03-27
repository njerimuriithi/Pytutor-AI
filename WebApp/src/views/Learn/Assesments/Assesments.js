import React,{useState} from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CCardGroup,
  CCardTitle,
  CCardText,
  CButton,
  CCardHeader,
  CCardImage,
  CAvatar,
  CImage,
  CChipInput



} from "@coreui/react";
import reactimage from 'src/assets/images/avatars/AvatarPython.png'
import avatar from 'src/assets/images/avatars/AvatarPython.png'
import CIcon from "@coreui/icons-react";
import {cilLockLocked,cilSortAscending} from "@coreui/icons";
import {advancedTopics, basicTopics, InterMediateTopics} from "src/views/pages/register/Topics";
import { useNavigate } from 'react-router-dom';
const Assesments = () => {
  const navigate = useNavigate();
  const[topic,setTopic] = useState(false);
  const [selected, setSelected] = useState([]);
  const [topicLevel, setTopicLevel] = useState(null);
  const getTopicsByLevel = () => {
    switch (topicLevel) {

      case 'basic':
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
    basic: "Test your understanding of Python basics and core concepts. Perfect for beginners.",
    intermediate: "Enhance your skills with intermediate Python concepts and real-world examples.",
    advanced: "Challenge yourself with advanced Python topics like decorators and concurrency."
  };
  const levelTopics={
    basic:"Introduction to Python",
    intermediate:"Intermediate Python",
    advanced:"Advanced Python"
  }
  const handleTopicSelect = (topic) => {
    setTopic(true);
  }
  const handleLevelSelect = (level) => {
    console.log(level)
    setTopicLevel(level);
    setSelected([]); // reset previous selection
  };
  if (topicLevel) {
    return (
      <CCard className="w-50 mb-3">
        <CCardBody>
          <CChipInput
            defaultValue={getTopicsByLevel()}
            selectable
            onSelect={setSelected}
            placeholder="Select chips"
          />
          <p className="mt-2 mb-0 small text-body-secondary">
            Selected: {selected.length ? selected.join(', ') : 'None'}
          </p>

          <CButton color="primary"
                   onClick={() => {
                     // Navigate to questions page
                     navigate('/Questions', {
                       state: { level: topicLevel, topics: selected }
                     });
                   }}
          >
            Start Quiz
          </CButton>
        </CCardBody>
      </CCard>
    );
  }
  return(
    <CRow>
      {['basic', 'intermediate', 'advanced'].map((level) => (
      <CCol sm={4}>
        <CCard  style={{ width: '18rem' }}>
          <CCardBody>
            <CCardHeader className="mb-3" as="h5" >{levelTopics[level]}</CCardHeader>
            <CCardTitle className="mb-2 text-body-secondary">
              <CIcon icon={cilSortAscending} size="xl"  style={{'--ci-primary-color': 'green'}}/>
              {level}
            </CCardTitle>


            <CCardText>
              {levelDescriptions[level]}

            </CCardText>
            <CButton color="success" onClick={() => handleLevelSelect(level)}>Select Topics</CButton>
          </CCardBody>
        </CCard>
      </CCol>
      ))}


    </CRow>
 /* <div className="text-center" >

        <CCard className="w-50 mb-3 text-center ">
          <CCardBody>Attempt 10 questions</CCardBody>
        </CCard>
        <CCard className="w-50 text-center">
          <CCardBody>
            <CCardHeader>TEST YOUR SKILLS</CCardHeader>
            <CCardTitle>Python Programming</CCardTitle>
            <CImage   align="center" src={reactimage}  width={200} height={200}/>

            <CCardText>
                 This assesment will test your understanding of Python programming
              concepts. It is designed to evaluate your ability to apply Python knowledge to solve problems and write efficient code.
            </CCardText>
            <CButton color="success" href="#">Start Assesment</CButton>
          </CCardBody>
        </CCard>


    </div>
*/
  )
}
export  default Assesments;
