import React, {useEffect, useRef, useState} from 'react'

import {CChart} from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import {fetchTopicsData} from "src/api/axios_api";
import {
  CButton,
  CButtonGroup,
  CCardBody, CCardHeader,
  CCol,
  CRow,
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
          backgroundColor: '#6aa84f',
          data: filtered.map(t => t.count),
          borderColor: '#f39c12',
          barThickness:120,
        },
      ],
    })
  }, [activeLevel, allTopics])
  useEffect(() => {
    if (!activeLevel) return

    const filtered = allDifficultTopics.filter(
      t => t.level === activeLevel
    )
    const values = filtered.map(t => t.difficulty_score)
    const maxValue = Math.max(...values)

    setDifficultChart({
      labels: filtered.map(t => t.topic),
      datasets: [
        {
          label: 'Difficulty Score',
          data: values,
          backgroundColor: values.map(v => getDifficultyColor(v, maxValue)),
          borderWidth: 1,
        },
      ],
    })
  }, [activeLevel, allDifficultTopics])

  const getDifficultyColor = (value, max) => {
    const ratio = value / max
    const hue = (1 - ratio) * 120
    return `hsla(${hue}, 70%, 50%, 0.9)`
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
        display: true,
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
  const Pieoptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: getStyle('--cui-body-color'),
          generateLabels: (chart) => {
            const data = chart.data
            const dataset = data.datasets[0]
            const total = dataset.data.reduce((a, b) => a + b, 0)

            return data.labels.map((label, i) => {
              const value = dataset.data[i]
              const percentage = ((value / total) * 100).toFixed(1)

              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                index: i,
              }
            })
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const data = context.dataset.data
            const total = data.reduce((a, b) => a + b, 0)
            const value = context.raw
            const percentage = ((value / total) * 100).toFixed(1)

            return `${context.label}: ${value} (${percentage}%)`
          },
        },
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

      <CRow >
        {/* LEFT: Bar Chart */}
        <CCol md={8}>
          <div className="mb-4" >
            <CCardBody >
              <CCardHeader className="mb-3" as="h5">No Of Students per Topic</CCardHeader>

              {chartData ? (
                <CChart type="bar" data={chartData} options={options} ref={chartRef}/>
              ) : (
                <p>No data available</p>
              )}
            </CCardBody>
          </div>
        </CCol>

        {/* RIGHT: Pie CHART */}
        <CCol md={4}>
          <div className="mb-4">
            <CCardBody>
              <h6 className="mb-3">Difficult Topics</h6>

              {difficultChart ? (
                <CChart
                  type="pie"
                  data={difficultChart}
                  options={Pieoptions}
                />
              ) : (
                <p>No difficulty data</p>
              )}
            </CCardBody>
          </div>
        </CCol>
      </CRow>
    </>
  )
}

export default MainChart
