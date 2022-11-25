import { useEffect, useState } from "react"
import { Table } from 'reactstrap'
import GroupService from "../../services/GroupService"
import { Link } from "react-router-dom"
import { useAccount } from "../../providers/account"

function MyGroupsSection(props) {
  const { getLink } = props
  const { account } = useAccount()
  const [groups, setGroups] = useState([])

  const load = async() => {
    try {
      const groupList = await GroupService.getMyGroups()
      setGroups(groupList)
    } catch (error) {

    }
  }

  const getRoles = (group) => {
    const roles = []
    if (group.members && group.members.findIndex(e => e.id === account.info.id) !== -1) roles.push('Member')
    if (group.advisers && group.advisers.findIndex(e => e.id === account.info.id) !== -1) roles.push('Adviser')
    if (group.panelists && group.panelists.findIndex(e => e.id === account.info.id) !== -1) roles.push('Panelist')
    return roles.join(', ')
  }
  
  useEffect(() => {
    load()
  }, [])

  const doGetLink = (group) => getLink ? getLink(group) : '#'

  return (
    <>
      <div className='tm-group'>
        <h2 className="tm-group-name">My Groups</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role(s)</th>
            </tr>
          </thead>
          <tbody>
            {
              groups.map(e => (
                <tr key={`group-${e._id}`}>
                  <td><Link to={doGetLink(e)}>{e.name}</Link></td>
                  <td>{getRoles(e)}</td>
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
