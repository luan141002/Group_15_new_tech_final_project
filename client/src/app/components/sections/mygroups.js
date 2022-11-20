import { useEffect, useState } from "react"
import { Table } from 'reactstrap'
import GroupService from "../../services/GroupService"
import { Link } from "react-router-dom"

function MyGroupsSection() {
  const [groups, setGroups] = useState([])

  const load = async() => {
    try {
      const groupList = await GroupService.getMyGroups()
      setGroups(groupList)
    } catch (error) {

    }
  }
  
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <div className='tm-group'>
        <h2 className="tm-group-name">My Groups</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {
              groups.map(e => (
                <tr key={`group-${e._id}`}>
                  <td><Link to={`/faculty/group/${e._id}`}>{e.name}</Link></td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </div>
    </>
  )
}

export default MyGroupsSection
