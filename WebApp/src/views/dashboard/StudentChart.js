import React, {useEffect, useRef, useState} from 'react'
import {CChart} from '@coreui/react-chartjs'
import {fetchIndividualStudentsData} from "src/api/axios_api";
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
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
import { useParams } from 'react-router-dom'
import { getStyle } from '@coreui/utils'

const StudentChart = () => {
  const chartRef = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { studentId } = useParams()
  const [activeTab, setActiveTab] = useState("Assessment")


  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      const res = await fetchIndividualStudentsData(studentId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const student = data?.student_details?.[0];
  const bestTopics = data?.best_performing_topics || [];
  const activity = data?.student_activity || []

  const filteredActivity =
    activeTab === "All"
      ? activity
      : activity.filter(a => a.activity_type === activeTab)
  const total = filteredActivity.length

  const weakCount = filteredActivity.filter(a => {
    const percent = a.answered_questions
      ? (a.correct_answers / a.answered_questions) * 100
      : a.progress_percent || 0
    return percent < 50
  }).length

  const completedCount = filteredActivity.filter(a => a.completed).length

  const getPercent = (a) =>
    a.answered_questions
      ? Math.round((a.correct_answers / a.answered_questions) * 100)
      : a.progress_percent || 0

  const isWeak = (percent) => percent < 50

  const formatDate = (date) =>
    new Date(date.split('.')[0]).toLocaleDateString()


  useEffect(() => {
    const handleColorSchemeChange = () => {
      const chartInstance = chartRef.current
      if (chartInstance) {
        const { options } = chartInstance
        if (options.plugins?.legend?.labels) options.plugins.legend.labels.color = getStyle('--cui-body-color')
        if (options.scales?.x) {
          if (options.scales.x.grid) options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          if (options.scales.x.ticks) options.scales.x.ticks.color = getStyle('--cui-body-color')
        }
        if (options.scales?.y) {
          if (options.scales.y.grid) options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          if (options.scales.y.ticks) options.scales.y.ticks.color = getStyle('--cui-body-color')
        }
        chartInstance.update()
      }
    }
    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () => document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
  }, [])

  const bestChart = {
    labels: bestTopics.map(t => t.topic),
    datasets: [
      {
        label: 'Accuracy %',
        data: bestTopics.map(t => t.Accuracy_Percent),
        backgroundColor: '#6aa84f',
        borderColor: '#36A2EB',
        barThicknes:5,
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        labels: {
          color: getStyle('--cui-body-color'),
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: getStyle('--cui-border-color-translucent'),
        },
        ticks: {
          color: getStyle('--cui-body-color'),
        },
        type: 'category',
      },
      y: {
        grid: {
          display: false,
          color: getStyle('--cui-border-color-translucent'),
        },
        ticks: {
          color: getStyle('--cui-body-color'),
        },
        beginAtZero: true,
      },
    },
  }
  return (
    <>
      <div className="mb-4 shadow-sm">
        <CCardBody className="text-center">

          <CAvatar color="primary" size="lg" className="mb-2">
            {student?.Full_Name?.charAt(0) || "?"}
          </CAvatar>

          <h5 className="mb-1">{student?.Full_Name}</h5>

          <small className="text-muted">
            Level: {student?.student_level}
          </small>

          <br />

          <small className="text-muted">
            Registered on: {student?.registered_date
            ? new Date(student.registered_date).toLocaleDateString()
            : "N/A"}
          </small>
        </CCardBody>
      </div>

      {/*Student Performance*/}
      <CCard className="mb-4">
        <CCardHeader as="h5">Student Assesment Performance</CCardHeader>
        <CCardBody   >
          <CChart width="185px" height="50px" type="bar" data={bestChart} options={options}  ref={chartRef}/>
        </CCardBody>
      </CCard>



      <div className="mb-4">
        <CCardBody className=" text-center">

          <div className="mb-4">
            <h5>{activeTab} Overview</h5>
          </div>
          <CButtonGroup className="mb-2">
            {["All", "Assessment", "Course"].map(tab => (
              <CButton
                key={tab}
                color={activeTab === tab ? "primary" : "light"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </CButton>
            ))}
          </CButtonGroup>

        </CCardBody>
      </div>

      <CRow className="mb-4">
        <CCol md={4}>
          <CCard>
            <CCardBody className="text-center">
              <h4>{completedCount}</h4>
              <small className="text-muted">Completed</small>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4}>
          <CCard>
            <CCardBody className="text-center">
              <h4>{weakCount}</h4>
              <small className="text-muted">Weak Topics</small>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4}>
          <CCard>
            <CCardBody className="text-center">
              <h4>{total}</h4>
              <small className="text-muted">Total {activeTab}</small>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader as="h5">{activeTab} Activity</CCardHeader>

        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Progress</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Performance</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredActivity.slice(0, 10).map((a, i) => {
                const percent = getPercent(a)

                return (
                  <CTableRow key={i}>

                    {/* NAME */}
                    <CTableDataCell>
                      <strong>{a.topic}</strong>
                    </CTableDataCell>

                    {/* DATE */}
                    <CTableDataCell>
                      {formatDate(a.created_at)}
                    </CTableDataCell>

                    {/* PROGRESS */}
                    <CTableDataCell>
                      <div>
                        <small>{percent}%</small>
                        <CProgress
                          thin
                          value={percent}
                          color={
                            percent > 70
                              ? "success"
                              : percent > 40
                                ? "warning"
                                : "danger"
                          }
                        />
                      </div>
                    </CTableDataCell>

                    {/* COMPLETION */}
                    <CTableDataCell>
                      {a.completed ? (
                        <span className="text-success fw-semibold">
                    Completed
                  </span>
                      ) : (
                        <span className="text-warning fw-semibold">
                    In Progress
                  </span>
                      )}
                    </CTableDataCell>

                    {/* WEAK / STRONG */}
                    <CTableDataCell>
                      {isWeak(percent) ? (
                        <span className="text-danger">Weak</span>
                      ) : (
                        <span className="text-success">Strong</span>
                      )}
                    </CTableDataCell>

                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        </CCardBody>



      </CCard>



    </>
  )
}

export default StudentChart
