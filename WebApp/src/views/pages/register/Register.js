import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormCheck
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser,cilSortAscending } from '@coreui/icons'
import {Link} from "react-router-dom";
import {RegisterNewStudent} from "src/api/axios_api";


const Register = () => {
  const handleRegister = async () => {
    const dummyData = {
      first_name: "J",
      second_name: "N",
      student_email: "N@gmail.com",
      student_level: "Beginner",
    };

    try {
      const response = await RegisterNewStudent(dummyData);
      console.log("Student Registered:", response.data);
    } catch (error) {
      console.error("Error registering student:", error.response.data);
    }
  };
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Firstname" autoComplete="Firstname" />
                  </CInputGroup>
                  {/*Last Name*/}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="Lastname" autoComplete="Lastname" />
                  </CInputGroup>
                  {/*Student Email*/}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput placeholder="Email" autoComplete="email" />
                  </CInputGroup>
                  {/*Student Level*/}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilSortAscending} />
                    </CInputGroupText>
                    <CFormCheck inline id="inlineCheckbox1" value="Beginner" label="Beginner" />
                    <CFormCheck inline id="inlineCheckbox2" value="InterMediate" label="Intermediate" />
                    <CFormCheck inline id="inlineCheckbox2" value="Expert" label="Expert" />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="success" onClick={handleRegister}>Create Account </CButton>
                  </div>
                 {/* <Link to="/RegisterCourses">
                  <div className="d-grid">
                    <CButton color="success">Next </CButton>
                  </div>
                </Link>*/}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
