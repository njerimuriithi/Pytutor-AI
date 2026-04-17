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


import MainChart from './MainChart'
import {Fetchallstudentsdata, fetchQuestion, fetchStudentsPerfomanceData, fetchTopicsData} from "src/api/axios_api";
import StudentChart from "src/views/dashboard/StudentChart";
import {useNavigate} from "react-router-dom";
import {CChart} from "@coreui/react-chartjs";
import CIcon from "@coreui/icons-react";
import {cilUser, cilUserX} from "@coreui/icons";

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


   const TrendData = {
    labels: data?.activity_trend?.map(d => d.activity_date
    ),
    datasets: [
      {
        label: 'Active Time (Minutes)',
        data: data?.activity_trend?.map(d => d.total_time_spent),
        borderColor: '#6aa84f',
        backgroundColor: '#6aa84f',
        tension: 0.5,
        fill: true,
      },
    ],
  }
  return (
    <>
      <CRow className="mb-4 g-3">
        {/* TOTAL STUDENTS */}
        <CCol sm={6}>
          <CCard className="p-3 shadow-sm border-0">
            <CCardBody className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-body-secondary">Total Students</small>
                <h3 className="fw-bold mb-0">
                  {data?.student_activity?.length || 0}
                </h3>
              </div>
              <div
                className="d-flex align-items-center justify-content-center rounded"
                style={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(255, 193, 7, 0.15)" // soft warning bg
                }}
              >
                <CIcon icon={cilUser} className="text-warning" size="lg" />
              </div>

            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6}>
          <CCard className="p-3 shadow-sm border-0">
            <CCardBody className="d-flex align-items-center justify-content-between">


              <div>
                <small className="text-body-secondary">Inactive Students</small>
                <h3 className="fw-bold mb-0">
                  {data?.inactive_students?.length || 0}
                </h3>
              </div>


              <div
                className="d-flex align-items-center justify-content-center rounded"
                style={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(220, 53, 69, 0.15)" // soft danger bg
                }}
              >
                <CIcon icon={cilUserX} className="text-danger" size="lg" />
              </div>

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

        {/*Student analyrtics*/}
        <CRow>

          <CCol sm={6}>
            <CCard className="mb-4 shadow-sm border-0" >
              <CCardHeader as="h5">
                📊 Student Active Time
              </CCardHeader>

              <CCardBody>
                <CChart
                  type="line"
                  data={TrendData}
                />
              </CCardBody>
            </CCard>

          </CCol>
          <CCol sm={6}>
            <CCard className="mb-4 shadow-sm border-0">
              <CCardHeader as="h5">Students Not Active (7+ Days)</CCardHeader>

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
                        {s.last_activity? new Date(s.last_activity).toLocaleString()
                        : 'N/A'}
                        {/*{new Date(s.last_activity).toLocaleDateString()}*/}
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
        </CRow>
      <div className="mb-4">
       <MainChart/>
      </div>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader as="h5">Students Details</CCardHeader>
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
                      <CTableDataCell>{s.student_level}</CTableDataCell>
                       <CTableDataCell>
                        <small>{s.accuracy_percent}%</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CProgress value={s.completion_percent} color="info" />
                        <small>{s.completion_percent}%</small>
                      </CTableDataCell>
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
                      <CTableDataCell>
                        {s.total_time_spent} min
                      </CTableDataCell>
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
                        {s.performance_status === 'Great Student' && (
                          <CBadge color="success">Great Student</CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" color="primary"
                         disabled={s.performance_status === 'No Progress'}
                         onClick={() =>
                          navigate(`/StudentChart/${s.student_id}`)
                        }>
                          View
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
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
