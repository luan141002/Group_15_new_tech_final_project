import { Component } from 'react'
import { Helmet } from 'react-helmet'
import Overlay from '../components/overlay'

import person2 from '../../assets/images/person2.jpg'
import AccountPreferencesOverlay from '../components/overlays/account-preferences'
import NotificationsOverlay from '../components/overlays/notifications'

class DashboardPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: {
        name: 'Jamie Mapa'
      },
      showOverlay: 'account-preferences'
    }
  }

  componentDidMount() {

  }

  openOverlay = (name) => () => {
    this.setState({
      showOverlay: name
    })
  }

  closeOverlay = () => {
    this.setState({
      showOverlay: false
    })
  }

  render() {
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <meta name='Dashboard Student' content='width=device-width, initial-scale=1.0' />
          <title>Dashboard Student</title>
        </Helmet>
        <Overlay show={this.state.showOverlay}>
          <AccountPreferencesOverlay overlayName='account-preferences' onClose={this.closeOverlay} />
          <NotificationsOverlay overlayName='notifications' onClose={this.closeOverlay} />
        </Overlay>
        <div className="row">
          <div className="column" style={{ width: 'auto' }}>
            <div className="sideNav">
              <button className="navButton"> Overview </button>
              <button className="navButton"> Documents </button>
              <button className="navButton"> Defense week </button>
  
              <button className="submit_button"> Upload Document </button>
            </div>
          </div>
          <div className="column" style={{ width: 'auto' }}>
            <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}> Thesis Management System </h1>
            <div className="calendar">
              <h2 className="dashboard_text"> Calendar</h2>
            </div>
            <div className="documents">
              <h2 className="dashboard_text"> Documents </h2>
              <div className="column" style={{ width: '55%', padding: '0' }}>
                <a href='/' className="dashboard_elementNames"> Document Title </a>
                <ul>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                </ul>
              </div>
              <div className="column" style={{ width: '15%', padding: '0' }}>
                <a href='/' className="dashboard_elementNames"> Status </a>
                <ul style={{ listStyleType: 'none' }}>
                  <li className="dashboard_elements"> Done </li>
                  <li className="dashboard_elements"> Done </li>
                  <li className="dashboard_elements"> Done </li>
                  <li className="dashboard_elements"> Done </li>
                </ul>
              </div>
              <div className="column" style={{ width: '30%', padding: '0' }}> 
                <a href='/' className="dashboard_elementNames"> Submitted </a>
                <ul>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                  <li className="dashboard_elements"> 13 Dec 2020 </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="column" style={{ width: 'auto' }}>
            <button className="account_text" style={{ right: '35px', backgroundColor: 'transparent', border: 'none' }} id="account_button" onClick={this.openOverlay('account-preferences')}>{this.state.account.name}</button>
            <a href='/' className="account_text" style={{ top: '35px', left: '80px', color: '#818181' }}> Student account</a>
            <div className="groups">
              <span> <h2 className="dashboard_text"> Groups </h2> <h2 className="dashboard_elements" style={{ left: '275px', position: 'relative', bottom: '40px' }}> Endorsement Status</h2> </span>
              <span>
                <img className="member_icon" src={person2} alt='person2.jpg' />
                <img className="member_icon" src={person2} alt='person2.jpg' /> 
                <img className="member_icon" src={person2} alt='person2.jpg' />
                <img className="member_icon" src={person2} alt='person2.jpg' /> 

                <div className="endorsement_status"></div>
              </span>
            </div> 
            <div className="deadlines">
              <h2 className="dashboard_text">Deadlines</h2>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default DashboardPage
