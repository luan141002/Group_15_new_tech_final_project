function GroupInfoSection(props) {
  const { title, group } = props

  return (
    <div className='tm-group'>
      <h2 className="tm-group-name">{ title || 'Group Info' }</h2>
      <p><strong>Name:</strong> {group && group.name}</p>
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
  )
}

export default GroupInfoSection
