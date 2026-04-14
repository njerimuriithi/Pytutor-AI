import React, {useEffect, useRef, useState} from 'react'

import {CChart, CChartLine} from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import {fetchIndividualStudentsData, fetchTopicsData} from "src/api/axios_api";
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
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


const StudentChart = () => {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState(null)
  const [allTopics, setAllTopics] = useState([]) // store all fetched topics
  const [activeLevel, setActiveLevel] = useState(null)
  const [availableLevels, setAvailableLevels] = useState([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { studentId } = useParams()
  console.log('studentid',studentId)


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
  const student = data?.student_details?.[0];

  const weakTopics = data?.poor_performing_topics || [];
  const bestTopics = data?.best_performing_topics || [];
  const activity = data?.student_activity || [];


  const totalTime = activity.reduce((acc, cur) => acc + (cur.time_spent || 0), 0);


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
        display: true,
        grid: { display: false },
        ticks: { color: getStyle('--cui-body-color') },
        type: 'category',
      },
      y: {
        display: true,
        grid: { display: false },
        ticks: { color: getStyle('--cui-body-color'), beginAtZero: false },
      },
    },
  }
  const weakChart = {
    labels: weakTopics.map(t => t.topic),
    datasets: [
      {
        label: 'Weak Topics (%)',
        data: weakTopics.map(t => t.Accuracy_Percent),
      },
    ],
  };
  const assessmentChart = {
    labels: activity.map((_, i) => `Attempt ${i + 1}`),
    datasets: [
      {
        label: 'Correct %',
        data: activity.map(a =>
          a.answered_questions
            ? (a.correct_answers / a.answered_questions) * 100
            : 0
        ),
      },
      {
        label: 'Completed',
        data: activity.map(a => (a.completed ? 100 : 0)),
      },
    ],
  };
  const totalAttempts = activity.length

  const completedAttempts = activity.filter(a => a.completed).length

  const accuracy =
    activity.length > 0
      ? Math.round(
        activity.reduce((acc, a) => {
          const percent = a.answered_questions
            ? (a.correct_answers / a.answered_questions) * 100
            : 0
          return acc + percent
        }, 0) / activity.length
      )
      : 0
  const bestChart = {
    labels: bestTopics.map(t => t.topic),
    datasets: [
      {
        label: 'Strong Topics (%)',
        data: bestTopics.map(t => t.Accuracy_Percent),
        backgroundColor: '#2ecc71',
      },
    ],
  }
  const strongTopics = [...bestTopics]
    .sort((a, b) => b.Accuracy_Percent - a.Accuracy_Percent)
    .slice(0, 5)

  const learningCurve = {
    labels: activity.map((_, i) => `Q${i + 1}`),

    datasets: [
      {
        label: 'Accuracy Trend',
        data: activity.map(a =>
          a.answered_questions
            ? Math.round((a.correct_answers / a.answered_questions) * 100)
            : 0
        ),
        borderColor: '#3498db',
        tension: 0.4,
      },

      {
        label: 'Completion',
        data: activity.map(a => (a.completed ? 100 : 0)),
        borderColor: '#2ecc71',
        tension: 0.4,
      },
    ],
  }
  return (
    <>
      <CCard className="mb-4 shadow-sm">
        <CCardBody className="d-flex justify-content-between align-items-center">

          <div className="d-flex align-items-center gap-3">
            <CAvatar color="primary">
              {student?.Full_Name?.charAt(0) || "?"}
            </CAvatar>

            <div>
              <h5 className="mb-0">{student?.Full_Name}</h5>
              <small className="text-muted">
                Level: {student?.student_level}
              </small>
            </div>
          </div>

          <div className="d-flex gap-4 text-center">

            <div>
              <h6>{totalAttempts}</h6>
              <small>Attempts</small>
            </div>

            <div>
              <h6>{completedAttempts}</h6>
              <small>Completed</small>
            </div>

            <div>
              <h6>{totalTime}s</h6>
              <small>Time Spent</small>
            </div>

          </div>
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <CCardHeader>Strong Performance</CCardHeader>
        <CCardBody>
          <CChart type="bar" data={bestChart} options={{ indexAxis: 'y' }} />
        </CCardBody>
      </CCard>


      <CCard className="mb-4">
        <CCardHeader>Weak Topics</CCardHeader>
        <CCardBody>
          <CChart
            type="bar"
            data={weakChart}
            options={{ indexAxis: 'y' }} // horizontal
          />
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader>Student Activity</CCardHeader>
        <CCardBody>
          {activity.map((a, i) => {
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



    </>
  )
}

export default StudentChart
