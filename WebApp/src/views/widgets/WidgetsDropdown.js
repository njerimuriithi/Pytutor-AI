import React, { useEffect, useRef,useState } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsB,
  CWidgetStatsE
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions,cilChartPie } from '@coreui/icons'
import {fetchStudentsData} from "src/api/axios_api";

const WidgetsDropdown = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const [dashboardData, setDashboardData] = useState(null);
  const allLevels = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStudentsData();
        setDashboardData(data);
        console.log("Dashboard:", data);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const levelsData = allLevels.map((level) => {
    const found = dashboardData?.students_per_level.find(
      (item) => item.student_level === level
    );

    return {
      student_level: level,
      count: found ? found.count : 0,
    };
  });
  const getColor = (level) => {
    switch (level) {
      case "Beginner":
        return "primary";
      case "Intermediate":
        return "success";
      case "Advanced":
        return "warning";
      default:
        return "info";
    }
  };

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  return (

      <CRow className={props.className} xs={{ gutter: 4 }}>

        {/* Total Students */}
        {dashboardData && (
          <CCol sm={6} xl={4} xxl={3} >
            <CWidgetStatsB
              className="mb-3 text-center"
              progress={{ color: 'success', value: 75 }}
              color="primary"
              title="Students Registered"
              value={dashboardData.total_students}
            />
          </CCol>
        )}

        {/* Levels (Always 3 cards) */}
        {levelsData.map((item, index) => (
          <CCol sm={6} xl={4} xxl={3} key={index} >
            <CWidgetStatsB
              className="mb-3 text-center"
              color={getColor(item.student_level)}
              progress={{ color: 'success', value: 75 }}
              value={item.count}
              title={item.student_level}
            />
          </CCol>
        ))}



    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
