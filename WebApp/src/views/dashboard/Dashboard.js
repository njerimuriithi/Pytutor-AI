import React,{useState,useEffect,useRef} from 'react'
import classNames from 'classnames'

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
import { getStyle } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import { CChart } from '@coreui/react-chartjs'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import {fetchQuestion, fetchStudentsPerfomanceData, fetchTopicsData} from "src/api/axios_api";

const Dashboard = () => {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState(null)
  const [studentPerformance, setStudentPerformance] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchStudentsPerfomanceData()
        console.log(res.students_performance_details)
        setStudentPerformance(res.students_performance_details)
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







  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CRow>
        <CCol sm={6}>
      <CCard className="mb-4">
       <MainChart/>

      </CCard>
        </CCol>
      </CRow>
     {/* <WidgetsBrand className="mb-4" withCharts />*/}
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Students Details</CCardHeader>
            <CCardBody>
             <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">

                  <CTableRow>
                     <CTableHeaderCell className="bg-body-tertiary">Student Name
                     </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Level
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Topics Interested</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Time Spent
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Questions Attempted</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {studentPerformance.map((item, index) => (
                    <CTableRow v-for="item in tableItems" key={index}>

                      <CTableDataCell>
                        <div>{item.FullName}</div>
                       {/* <div className="small text-body-secondary text-nowrap">
                          <span>{item.user.new ? 'New' : 'Recurring'}</span> | Registered:{' '}
                          {item.user.registered}
                        </div>*/}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.studentlevel}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.TopicsTaken}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">{item.TotalTimeSpent}%</div>

                        </div>
                        <CProgress thin color="success" value={item.TotalTimeSpent} />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.TotalQuestions}</div>
                      </CTableDataCell>
                   {/*   <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={item.payment.icon} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary text-nowrap">Last login</div>
                        <div className="fw-semibold text-nowrap">{item.activity}</div>
                      </CTableDataCell>*/}
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
