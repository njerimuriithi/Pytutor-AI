import React,{useState} from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CChipInput,
  CInputGroup,
  CInputGroupText,
  CButton
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import {cilLockLocked, cilSortAscending, cilUser} from "@coreui/icons";
import { pythonTopics} from "src/views/pages/register/Topics";
const RegisterCourses = () => {
  const [selected, setSelected] = useState([]);
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-8">
              <CCardBody className="p-4">
                <h3 className="text-body-primary">Topics of Interest</h3>

                <CChipInput
                  defaultValue={pythonTopics}
                  selectable
                  onSelect={setSelected}
                  placeholder="Select topics..."
                />

                <p className="mt-4 mb-2 small text-body-secondary" color="success">
                  Selected: {selected.length ? selected.join(', ') : 'None'}
                </p>
                <div className="d-grid">
                <CButton color="success" className="mt-3" active tabIndex={-1}>
                  Submit
                </CButton>
                </div>

              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

    </div>
  )};

export default RegisterCourses;
