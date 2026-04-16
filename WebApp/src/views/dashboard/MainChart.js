import React, {useEffect, useRef, useState} from 'react'

import {CChart, CChartLine} from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import {fetchTopicsData} from "src/api/axios_api";
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


const MainChart = () => {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState(null)
  const [allTopics, setAllTopics] = useState([]) // store all fetched topics
  const [activeLevel, setActiveLevel] = useState(null)
  const [difficultChart, setDifficultChart] = useState(null)
  const [allDifficultTopics, setAllDifficultTopics] = useState([])
  const [availableLevels, setAvailableLevels] = useState([])
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchTopicsData()

        setAllTopics(res.students_per_topic)

        const levels = Array.from(
          new Set(res.students_per_topic.map(t => t.level))
        )

        setAvailableLevels(levels)
        if (levels.length > 0) setActiveLevel(levels[0])

        // NEW: Difficult topics chart
        setAllDifficultTopics(res.difficult_topics || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!activeLevel) return

    const filtered = allTopics.filter(t => t.level === activeLevel)

    setChartData({
      labels: filtered.map(t => t.topic),
      datasets: [
        {
          label: 'Students per Topic',
          backgroundColor: '#4f9cf9',
          data: filtered.map(t => t.count),
        },
      ],
    })
  }, [activeLevel, allTopics])
  useEffect(() => {
    if (!activeLevel) return

    const filtered = allDifficultTopics.filter(
      t => t.level === activeLevel
    )

    setDifficultChart({
      labels: filtered.map(t => t.topic),
      datasets: [
        {
          label: 'Difficulty Score',
          data: filtered.map(t => t.difficulty_score),
          backgroundColor: filtered.map(() => colors[activeLevel] || '#3498db')
        },
      ],
    })
  }, [activeLevel, allDifficultTopics])
  const colors = {
    beginner: '#2ecc71',
    intermediate: '#f39c12',
    advanced: '#e74c3c',
  }
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
        display: true, // show the axis labels, no grid lines
        grid: { display: false },
        ticks: { color: getStyle('--cui-body-color') },
        type: 'category',
      },
      y: {
        display: true,
        grid: { display: false },
        ticks: { color: getStyle('--cui-body-color'), beginAtZero: true },
      },
    },
  }
  return (
    <>
      <div className="text-center mb-3">
        <h5>{activeLevel} Students Overview</h5>

        <CButtonGroup className="mb-3">
          {availableLevels.map(level => (
            <CButton
              key={level}
              color={activeLevel === level ? 'primary' : 'light'}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </CButton>
          ))}
        </CButtonGroup>
      </div>

      <CRow>
        {/* LEFT: Bar Chart */}
        <CCol md={8}>
          <CCard className="mb-4">
            <CCardBody>
              <h6 className="mb-3">Students per Topic</h6>

              {chartData ? (
                <CChart type="bar" data={chartData} options={options} />
              ) : (
                <p>No data available</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* RIGHT: DONUT CHART */}
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardBody>
              <h6 className="mb-3">Most Difficult Topics</h6>

              {difficultChart ? (
                <CChart
                  type="doughnut"
                  data={difficultChart}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    cutout: '65%',
                  }}
                />
              ) : (
                <p>No difficulty data</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default MainChart
