import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import UserService from '../../services/UserService'
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import { clone, cloneDeep, merge } from "lodash"
import GroupService from "../../services/GroupService"
import GroupsSection from '../../components/sections/groups'
import MyGroupsSection from '../../components/sections/mygroups'

function createFormState() {
  return {
    name: '',
    members: [],
    advisers: []
  }
}

function GroupsPage() {

  const load = async() => {
    try {
        
    } catch (error) {

    }
  }
  
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Groups' content='width=device-width, initial-scale=1.0' />
        <title>Groups</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <GroupsSection />
          <MyGroupsSection />
        </div>
      </div>
    </>
  )
}

export default GroupsPage
