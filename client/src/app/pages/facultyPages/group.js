import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import UserService from '../../services/UserService'
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import { clone, cloneDeep, merge } from "lodash"
import GroupService from "../../services/GroupService"
import { useParams } from "react-router"

function GroupPage() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)

  const load = async() => {
    try {
      const groupInfo = await GroupService.getGroup(id)
      setGroup(groupInfo)
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
        <meta name='Group' content='width=device-width, initial-scale=1.0' />
        <title>Group</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <div className='tm-group'>
            <h2 className="tm-group-name">Group</h2>
            <h4>{ group && group.advisers.length === 1 ? 'Adviser' : 'Advisers' }</h4>
            <ul>
              {
                group && group.advisers.map(e => (
                  <li>{`${e.lastName}, ${e.firstName}`}</li>
                ))
              }
            </ul>
            <h4>{ group && group.members.length === 1 ? 'Member' : 'Members' }</h4>
            <ul>
              {
                group && group.members.map(e => (
                  <li>{`${e.lastName}, ${e.firstName}`}</li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default GroupPage
