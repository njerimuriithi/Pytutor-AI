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
  const [availableLevels, setAvailableLevels] = useState([])
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchTopicsData()
        setAllTopics(res.students_per_topic)
        const levels = Array.from(new Set(res.students_per_topic.map(t => t.level)))
        setAvailableLevels(levels)
        if (levels.length > 0) setActiveLevel(levels[0])
       // const labels = res.students_per_topic.map(item => item.topic)
       // const values = res.students_per_topic.map(item => item.count)

       /* setChartData({
          labels,
          datasets: [
            {
              label: 'Students per Topic',
              backgroundColor: '#4f9cf9',
              borderColor: '#4f9cf9',
              data: values,
            },
          ],
        })*/

      } catch (err) {
        console.error(err)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!activeLevel) return
    // Filter topics based on selected level
    const filtered = allTopics.filter(t => t.level === activeLevel)
    const labels = filtered.map(t => t.topic)
    const values = filtered.map(t => t.count)

    setChartData({
      labels,
      datasets: [
        {
          label: 'Students per Topic',
          backgroundColor: '#4f9cf9',
          borderColor: '#4f9cf9',
          data: values,
        },
      ],
    })
  }, [activeLevel, allTopics])
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
      <CCardBody>
        <CRow>
          <CCol sm={5}>
            <h4 id="traffic" className="card-title mb-0">
              Traffic
            </h4>
            <div className="small text-body-secondary">January - July 2023</div>
          </CCol>
          <CCol sm={7} className="d-none d-md-block">
            <CButtonGroup className="mb-3">
              {availableLevels.map(level => (
                <CButton
                  key={level}
                  color={activeLevel === level ? 'primary' : 'outline-secondary'}
                  onClick={() => setActiveLevel(level)}
                >
                  {level}
                </CButton>
              ))}
            </CButtonGroup>

            {/*<CButtonGroup className="float-end me-1">
              {['Beginner', 'Intermediate', 'Advanced'].map((value) => (
                <CButton
                  color="outline-secondary"
                  key={value}
                  className="mx-0"
                  active={value === 'Month'}
                >
                  {value}
                </CButton>
              ))}
            </CButtonGroup>*/}
          </CCol>
        </CRow>
        {chartData && chartData.labels.length > 0 ? (
          <CChart type="bar" data={chartData} options={options} ref={chartRef} />
        ) : (
          <p>No data to display for this level.</p>
        )}
      </CCardBody>

    </>
  )
}

export default MainChart
