import React,{useState,useEffect,useRef} from 'react'
import {
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CCardText,
  CSpinner,
} from '@coreui/react'

import {cilArrowThickRight,cilEducation,cilTerminal} from  '@coreui/icons'
import {
  fetchIndividualStudentsData,
} from "src/api/axios_api";
import CIcon from "@coreui/icons-react";

const StudentDashboard = ({studentId}) => {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      const res = await fetchIndividualStudentsData(studentId);
      console.log(res)
      setData(res);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const student =data?.student_details?.[0];

  const initial = student?.Full_Name
    ? student.Full_Name.charAt(0).toUpperCase()
    : "?";
  const getPercentage = (score, questions) => {
    if (!questions) return 0
    return ((score / questions) * 100).toFixed(0)
  }
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-4">
        <CSpinner />
      </div>
    );
  }


  return (
    <>


        <CCardBody className="d-flex align-items-center gap-3 mb-4"  textBgColor='light'>
          <CAvatar color="primary" size="md">
            {initial}
          </CAvatar>
          <div>
            <CCardText>Hey {student?.first_name}</CCardText>

          </div>
        </CCardBody>

      {/*Student review*/}
      <CCard className="mb-4">
        <CCardBody>
          <CCardTitle>Review</CCardTitle>

          <CCardText className="text-body-secondary">
            We found some learning opportunities based on your practice questions.
          </CCardText>

          <CRow className="g-3" >
            {data?.poor_performing_topics?.length > 0 ? (
              data.poor_performing_topics.slice(0, 3).map((topic, index) => (

                <CCol sm={4} key={index}>
                  <CCard textBgColor='light'
                    className="h-100 d-flex flex-row align-items-center justify-content-between p-3"
                    style={{ cursor: "pointer" }}
                   /* onClick={() => openLessonModal(topic.topic, topic.level)}
            */      >

                    {/* LEFT CONTENT */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {topic.topic}
                      </div>

                      <small className="text-body-secondary">
                        {topic.level}
                      </small>
                    </div>

                    {/* RIGHT ARROW */}
                    <CButton
                      color="danger"
                      size="sm"
                      className="rounded-circle d-flex align-items-center justify-content-center ms-2"
                      style={{ width: "36px", height: "36px", flexShrink: 0 }}
                    >
                      <CIcon icon={cilArrowThickRight} />
                    </CButton>

                  </CCard>
                </CCol>

              ))
            ) : (
              <p>No recommendations right now 🎉</p>
            )}
          </CRow>
        </CCardBody>
      </CCard>


        {/*Add the  Go to Classes*/}
      <CRow className="g-3 mb-3">

        {/* PRACTICE CARD */}
        <CCol sm={6}>
          <CCard className="p-3 d-flex flex-row align-items-center justify-content-between">


            <div style={{ flex: 1 }}>


              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded bg-danger text-white mb-2"
              >
                <CIcon icon={cilTerminal} size="sm" />
                <span style={{ fontWeight: 500 }}>Practice</span>
              </div>

              {/* DESCRIPTION */}
              <CCardText className="mb-0 text-body-secondary">
                Practice more questions to improve your performance.
              </CCardText>

            </div>

            {/* RIGHT ARROW */}
            <CButton
              color="primary"
              className="rounded-circle d-flex align-items-center justify-content-center ms-3"
              style={{ width: "40px", height: "40px", flexShrink: 0 }}
            >
              <CIcon icon={cilArrowThickRight} />
            </CButton>

          </CCard>
        </CCol>


        {/* COURSES CARD */}
        <CCol sm={6}>
          <CCard className="p-3 d-flex flex-row align-items-center justify-content-between">


            <div style={{ flex: 1 }}>


              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded bg-danger text-white mb-2"
              >
                <CIcon icon={cilEducation} size="sm" />
                <span style={{ fontWeight: 500 }}>Courses</span>
              </div>


              <CCardText className="mb-0 text-body-secondary">
                Explore courses to improve your understanding.
              </CCardText>

            </div>

            {/* RIGHT ARROW */}
            <CButton
              color="primary"
              className="rounded-circle d-flex align-items-center justify-content-center ms-3"
              style={{ width: "40px", height: "40px", flexShrink: 0 }}
              /*onClick={() => navigate('/Learn/Courses')}*/
            >
              <CIcon icon={cilArrowThickRight} />
            </CButton>

          </CCard>
        </CCol>


      </CRow>

        <CCard className="mb-1 " >



            <CCardHeader as="h5">Recent Activity</CCardHeader>
            <CCardBody>
              {(data?.student_activity || []).slice(0, 6).map((a, i) => {
                const percent = a.answered_questions
                  ? Math.round((a.correct_answers / a.answered_questions) * 100)
                  : 0;

                return (
                  <CRow key={i} className="mb-3 align-items-center">
                    <CCol xs={4}>
                      <strong>{a.topic}</strong>
                      <br />
                      <small>{a.activity_type}s</small>
                    </CCol>

                    <CCol xs={4}>
                      <CProgress value={a.progress_percent} />
                      <small>{a.progress_percent}%</small>
                    </CCol>

                    <CCol xs={4} className="text-end">
                      {a.completed ? (
                        <CButton size="sm" color="success">Completed</CButton>
                      ) : (
                        <CButton size="sm" color="warning">In Progress</CButton>
                      )}
                    </CCol>
                  </CRow>
                );
              })}
            </CCardBody>
          </CCard>




  {/*    <WidgetsDropdown className="mb-4" />
      <CRow>
        <CCol sm={6}>
          <CCard className="mb-4">
            <MainChart/>

          </CCard>
        </CCol>
      </CRow>*/}
      {/* <WidgetsBrand className="mb-4" withCharts />*/}
      {/*<CRow>*/}
      {/*  <CCol xs>*/}
      {/*    <CCard className="mb-4">*/}
      {/*      <CCardHeader>Students Performance</CCardHeader>*/}
      {/*      <CCardBody>*/}
      {/*        <CTable align="middle" className="mb-0 border" hover responsive>*/}
      {/*          <CTableHead className="text-nowrap">*/}

      {/*            <CTableRow>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary">Student Name*/}
      {/*              </CTableHeaderCell>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary text-center">*/}
      {/*                Level*/}
      {/*              </CTableHeaderCell>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary">Topics Interested</CTableHeaderCell>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary text-center">*/}
      {/*                Time Spent*/}
      {/*              </CTableHeaderCell>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary">Questions Attempted</CTableHeaderCell>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary">Total Attempts</CTableHeaderCell>*/}
      {/*              <CTableHeaderCell className="bg-body-tertiary">Accuracy%</CTableHeaderCell>*/}
      {/*            </CTableRow>*/}
      {/*          </CTableHead>*/}
      {/*          <CTableBody>*/}
      {/*            {studentPerformance.map((item, index) => (*/}
      {/*              <CTableRow v-for="item in tableItems" key={index}>*/}

      {/*                <CTableDataCell>*/}
      {/*                  <div>{item.FullName}</div>*/}
      {/*                  <div className="small text-body-secondary text-nowrap">*/}
      {/*                    <span>{item.user.new ? 'New' : 'Recurring'}</span> | Registered:{' '}*/}
      {/*                    {item.user.registered}*/}
      {/*                  </div>*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell className="text-center">*/}
      {/*                  <div>{item.studentlevel}</div>*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell className="text-center">*/}
      {/*                  <div>{item.TopicsTaken}</div>*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell>*/}
      {/*                  <div className="d-flex justify-content-between text-nowrap">*/}
      {/*                    <div className="fw-semibold">{item.TotalTimeSpent}</div>*/}

      {/*                  </div>*/}
      {/*                  <CProgress thin color="success" value={item.TotalTimeSpent} />*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell className="text-center">*/}
      {/*                  <div>{item.TotalQuestions}</div>*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell className="text-center">*/}
      {/*                  <div className="fw-semibold">{item.Attempts}</div>*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell>*/}
      {/*                  <div className="d-flex justify-content-between text-nowrap">*/}
      {/*                    <div className="fw-semibold">{item.AccuracyPercentage}</div>*/}

      {/*                  </div>*/}
      {/*                  <CProgress thin color="success" value={item.AccuracyPercentage} />*/}
      {/*                </CTableDataCell>*/}
      {/*                <CTableDataCell>*/}
      {/*                    <div className="small text-body-secondary text-nowrap">Last login</div>*/}
      {/*                  <div className="fw-semibold text-nowrap">{item.activity}</div>*/}
      {/*                </CTableDataCell>*/}
      {/*              </CTableRow>*/}
      {/*            ))}*/}
      {/*          </CTableBody>*/}
      {/*        </CTable>*/}
      {/*      </CCardBody>*/}
      {/*    </CCard>*/}
      {/*  </CCol>*/}
      {/*</CRow>*/}
    </>
  )
}

export default StudentDashboard
