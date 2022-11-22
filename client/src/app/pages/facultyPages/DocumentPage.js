import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router"
import { Button } from "reactstrap"
import SubmissionService from "../../services/SubmissionService"
import GroupService from '../../services/GroupService'
import CommentSection from '../../components/sections/CommentSection'
import GroupInfoSection from "../../components/sections/GroupInfoSection"

function DocumentPage() {
  const { id, did } = useParams()
  const [submission, setSubmission] = useState(null)
  const [group, setGroup] = useState(null)
  const [submitter, setSubmitter] = useState(null)
  const [docInfo, setDocInfo] = useState(null)
  const [documentSrc, setDocumentSrc] = useState('_blank')
  const [documentName, setDocumentName] = useState('')

  const findMember = (group, id) => group.members.find(e => e.id === id)
  const findDocument = (documents, id) => documents.find(e => e._id === id)

  const load = async () => {
    try {
      const entry = await SubmissionService.getSubmission(id)
      setSubmission(entry)
      const docInfo = findDocument(entry.documents, did)
      setDocInfo(docInfo)
      const document = await SubmissionService.getDocument(id, did)
      setDocumentName(docInfo.filename)
      const href = URL.createObjectURL(document)
      console.log(href)
      setDocumentSrc(href)

      const groupEntry = await GroupService.getGroup(entry.info.group)
      setGroup(groupEntry)
      setSubmitter(findMember(groupEntry, entry.info.submitter))
    } catch (error) {

    }
  }

  const onDownload = async () => {
    try {
      const link = document.createElement('a')
      link.target = '_blank'
      link.download = documentName
      link.href = documentSrc
      link.click()
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
        <meta name='Submission' content='width=device-width, initial-scale=1.0' />
        <title>Submission</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column' style={{ flexGrow: 4 }}>
          <div className='tm-group'>
            <h2 className='tm-group-name'>Document</h2>
            <p className='tm-group-subname'>
              { submitter && `${submitter.firstName} ${submitter.lastName} submitted on ${submission.info.submitDate}` }
            </p>
            {
              documentName && <>
                {documentName}
                <Button onClick={onDownload} color='link'>Download</Button>
              </>
            }
            {
              documentSrc && (
                <iframe key={documentSrc} style={{ width: '100%', height: '75vh' }} src={documentSrc} title='Document'></iframe>
              )
            }
          </div>
          <CommentSection submission={submission} document={docInfo} />
        </div>
        <div className='tm-column'>
          <GroupInfoSection title='Submitter Info' group={group} />
        </div>
      </div>
    </>
  )
}

export default DocumentPage
