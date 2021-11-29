import { Component } from 'react'
import { Helmet } from 'react-helmet'
import Overlay from '../components/overlay'

import ChecklistOverlay from '../components/overlays/checklist'

class DocumentsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: {
        name: 'Jamie Mapa'
      },
      showOverlay: false
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
          <meta name='Documents Student' content='width=device-width, initial-scale=1.0' />
          <title>Documents Student</title>
        </Helmet>
        <Overlay show={this.state.showOverlay}>
          <ChecklistOverlay overlayName='checklist' onClose={this.closeOverlay} />
        </Overlay>
        <div class="row">
          <div class="column" style={{ width: 'auto' }}>
            <div class="sideNav">
              <button class="navButton"> Overview </button>
              <button class="navButton"> Documents </button>
              <button class="navButton"> Defense week </button>
  
              <button class="submit_button"> Upload Document </button>
            </div>
          </div>
          <div class="column" style={{ width: 'auto' }}>
            <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}> Thesis Management System </h1>     
            <div class="document_box">
              <h2 class="dashboard_text"> Submission checklist </h2>

              <div class="column" style={{ width: '55%', padding: '0' }}>
                <a href='/' class="dashboard_elementNames"> Document Title </a>
                <ul>
                  <li class="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li class="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li class="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                  <li class="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                </ul>
              </div>

              <div class="column" style={{ width: '40%', padding: '0' }}> 
                <a href='/' class="dashboard_elements" style={{ position: 'relative', left: '200px' }}> Submitted </a>
                <ul>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                </ul>
                <button class="add_checklist_button" onClick={this.openOverlay('checklist')}> + </button>
              </div>
            </div>
          </div>

          <div class="column" style={{ width: 'auto' }}>
            <a href='/' class="account_text" style={{ right: '35px' }}>{this.state.account.name}</a>
            <a href='/' class="account_text" style={{ top: '35px', left: '80px', color: '#818181' }}>Student account</a>
            <div class="groups" style={{ width: '400px', marginTop: '1.5rem', height: '703px' }}>
              <h2 class="dashboard_text"> Documents </h2> 
                  
              <div class="column" style={{ width: '55%', padding: '0' }}>
                <a href='/' class="dashboard_elementNames"> Document Title </a>
                <ul>
                  <li class="dashboard_elements"> Signed revisions approval form </li>
                  <li class="dashboard_elements"> Signed revisions approval form </li>
                  <li class="dashboard_elements"> Signed revisions approval form </li>
                  <li class="dashboard_elements"> Signed revisions approval form </li>
                </ul>
              </div>

              <div class="column" style={{ width: '40%', padding: '0' }}> 
                <a href='/' class="dashboard_elements" style={{ position: 'relative', left: '100px' }}> Submitted </a>
                <ul>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                  <li class="dashboard_elements" style={{ textAlign: 'right' }}> 13 Dec 2020 </li>
                </ul>
              </div>
            </div> 
          </div>
        </div>
      </>
    )
  }
}

export default DocumentsPage
