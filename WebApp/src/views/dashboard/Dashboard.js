import React,{useState,useEffect,useRef} from 'react'
import classNames from 'classnames'

import {
  CAvatar, CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader, CCardText, CCardTitle,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import {Fetchallstudentsdata, fetchQuestion, fetchStudentsPerfomanceData, fetchTopicsData} from "src/api/axios_api";
import StudentChart from "src/views/dashboard/StudentChart";
import {useNavigate} from "react-router-dom";
import {CChart} from "@coreui/react-chartjs";

const Dashboard = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState(null)
  const [studentPerformance, setStudentPerformance] = useState([])
  const [data, setData] = useState([])
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await Fetchallstudentsdata()
        console.log('student performance',res)
        setData(res)
        console.log(res)
/*
        setStudentPerformance(res.students_performance_details)
*/
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  const getPercentage = (score, questions) => {
    if (!questions) return 0
    return ((score / questions) * 100).toFixed(0)
  }
  const improvedstudent =data?.inactive_students?.[0]


  console.log(data?.activity_trend
  )
  const TrendData = {
    labels: data?.activity_trend?.map(d => d.activity_date
    ),
    datasets: [
      {
        label: 'Active Time (Minutes)',
        data: data?.activity_trend?.map(d => d.total_time_spent),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52,152,219,0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const getAccuracy = (a) => {
    if (!a.answered_questions) return 0
    return Math.round((a.correct_answers / a.answered_questions) * 100)
  }

  const getStatus = (a) => {
    const accuracy = getAccuracy(a)

    if (a.completed && accuracy >= 75) return 'Strong'
    if (a.completed && accuracy >= 50) return 'Average'
    if (a.completed) return 'Weak'
    return 'In Progress'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Strong':
        return 'success'
      case 'Average':
        return 'warning'
      case 'Weak':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol sm={4}>
          <CCard className="text-center p-3">

            <h4 className="text-warning">{data?.student_activity?.length}</h4>
            <h6>Total Students</h6>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-center p-3">

            <h4 className="text-danger">{data?.inactive_students?.length}</h4>
            <h6>Inactive Students</h6>
          </CCard>
        </CCol>

        {/* 🚀 Most Improved Student */}
        <CCol sm={4}>
          <CCard className="text-center p-3">

            <h4 className="text-success"> {improvedstudent?.full_name}</h4>
            <h6>Most Improved Student</h6>
           {/* <small>+{improvedStudent?.improvement?.toFixed(1)}%</small>*/}
          </CCard>
        </CCol>


      </CRow>
        {/*Student analyrtics*/}
        <CRow>
          <CCol sm={6}>
            <CCard className="mb-4 ">
              <CCardHeader>Students Not Active (7+ Days)</CCardHeader>

              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Student</CTableHeaderCell>
                    <CTableHeaderCell>Last Activity</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>

                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {data?.inactive_students?.map((s, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{s.full_name}</CTableDataCell>

                      <CTableDataCell>
                        {new Date(s.last_activity).toLocaleDateString()}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color="danger">Inactive</CBadge>
                      </CTableDataCell>


                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCard>
          </CCol>
          <CCol sm={6}>
            <CCard className="mb-4">
              <CCardHeader>
                📊 Student Active Time Trend
              </CCardHeader>

              <CCardBody>
                <CChart
                  type="line"
                  data={TrendData}
                />
              </CCardBody>
            </CCard>

          </CCol>
        </CRow>


      {/*<WidgetsDropdown className="mb-4" />*/}


      <div className="mb-4">
       <MainChart/>

      </div>




      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Students Performance</CCardHeader>
            <CCardBody>
             <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">

                  <CTableRow>
                     <CTableHeaderCell className="bg-body-tertiary">Student Name
                     </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Registered Level
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Accuracy</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Completion
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Weak Topics</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Assesments</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Strong Topics</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Time</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Status</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {data?.student_activity?.map((s, i) => (
                    <CTableRow key={i}>

                      {/* 👤 Student */}
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          <CAvatar color="primary">
                            {s.FullName?.charAt(0)}
                          </CAvatar>
                          <div>
                            <strong>{s.FullName}</strong>
                            <div className="text-body-secondary small">
                              Last login: {s.last_activity
                              ? new Date(s.last_activity).toLocaleString()
                              : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </CTableDataCell>

                      {/* 📊 Level */}
                      <CTableDataCell>{s.student_level}</CTableDataCell>

                      {/* 📈 Accuracy */}
                      <CTableDataCell>
                       {/* <CProgress value={s.accuracy} color={status} />*/}
                        <small>{s.accuracy_percent}%</small>
                      </CTableDataCell>

                      {/* ✅ Completion */}
                      <CTableDataCell>
                        <CProgress value={s.completion_percent} color="info" />
                        <small>{s.completion_percent}%</small>
                      </CTableDataCell>

                      {/* 📚 Weak Topics */}
                      <CTableDataCell>
                        {(s.weak_topics || "")
                          .split(",")
                          .map(t => t.trim())
                          .slice(0, 2)
                          .map((t, idx) => (
                            <CBadge color="danger" className="me-1" key={idx}>
                              {t}
                            </CBadge>
                          ))}
                      </CTableDataCell>

                      {/* 📝 Assessments */}
                      <CTableDataCell>
                        <strong>{s.total_assessments}</strong>
                      </CTableDataCell>

                      <CTableDataCell>
                        {(s.strong_topics || "")
                          .split(",")
                          .map(t => t.trim())
                          .slice(0, 2)
                          .map((t, idx) => (
                            <CBadge color="success" className="me-1" key={idx}>
                              {t}
                            </CBadge>
                          ))}
                      </CTableDataCell>

                      {/* ⏱ Time */}
                      <CTableDataCell>
                        {s.total_time_spent} min
                      </CTableDataCell>

                      {/* 🚨 Status */}
                      <CTableDataCell>
                        {s.performance_status === 'At Risk' && (
                          <CBadge color="warning">At Risk</CBadge>
                        )}

                        {s.performance_status === 'Needs Attention' && (
                          <CBadge color="info">Needs Attention</CBadge>
                        )}

                        {s.performance_status === 'No Progress' && (
                          <CBadge color="danger">No Progress</CBadge>
                        )}
                      </CTableDataCell>

                      {/* 🎯 Action */}
                      <CTableDataCell>
                        <CButton size="sm" color="primary"  onClick={() =>
                          navigate(`/StudentChart/${s.studentId}`)
                        }>
                          View
                        </CButton>
                      </CTableDataCell>

                    </CTableRow>
                    /*<CTableRow v-for="item in tableItems" key={index}>

                      <CTableDataCell>
                        <div>{item.FullName}</div>
                        <div className="small text-body-secondary text-nowrap">
                          <span>{item.user.new ? 'New' : 'Recurring'}</span> | Registered:{' '}
                          {item.user.registered}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.studentlevel}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.TopicsTaken}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">{item.TotalTimeSpent}</div>

                        </div>
                        <CProgress thin color="success" value={item.TotalTimeSpent} />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.TotalQuestions}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="fw-semibold">{item.Attempts}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">{item.AccuracyPercentage}</div>

                        </div>
                        <CProgress thin color="success" value={item.AccuracyPercentage} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary text-nowrap">Last login</div>
                        <div className="fw-semibold text-nowrap">{item.activity}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          onClick={() =>
                            navigate(`/StudentChart/${item.studentId}`)
                          }
                        >
                          View
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>*/
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

    </>
  )
}

export default Dashboard
