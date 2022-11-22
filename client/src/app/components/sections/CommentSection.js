import { useEffect, useState } from "react"
import { Alert, Button, Card, CardBody, CardFooter, CardText, CardTitle, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { useAccount } from "../../providers/account"
import CommentService from '../../services/CommentService'

function CommentSection(props) {
  const { account } = useAccount()
  const { submission, document } = props
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [deleteFormOpen, setDeleteFormOpen] = useState(false)
  const [deleteFormError, setDeleteFormError] = useState('')
  const [deleteId, setDeleteId] = useState('')

  const openDeleteModal = (id) => () => {
    setDeleteId(id)
    setDeleteFormOpen(true)
  }

  const closeModal = () => {
    setDeleteId('')
    setDeleteFormOpen(false)
  }

  const onDelete = async () => {
    try {
      await CommentService.deleteComment(deleteId, submission.info._id, document ? document._id : null)
      await load()
      closeModal()
    } catch (error) {
      setDeleteFormError(error.message)
    }
  }

  const load = async () => {
    if (submission) {
      try {
        const commentList = await CommentService.getComments(submission.info._id, document ? document._id : null)
        setComments(commentList)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const onSubmit = async () => {
    if (!submission) return
    if (!text) return
    
    try {
      await CommentService.createComment({ text }, submission.info._id, document ? document._id : null)
      setText('')
      await load()
    } catch (error) {

    }
  }
  
  useEffect(() => {
    load()
  }, [submission, document])

  return <>
    <div className='tm-group'>
      <h2 className="tm-group-name">Comments</h2>
      <FormGroup>
        <Input
          id="text"
          name="text"
          type="textarea"
          placeholder='Type your comment here'
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </FormGroup>
      <Modal isOpen={deleteFormOpen} fade={false} centered scrollable>
        <ModalHeader>Delete comment</ModalHeader>
        <ModalBody>
          This action cannot be undone.
          { deleteFormError && <Alert color='danger'>{deleteFormError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onDelete} color='danger'>Delete</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <Button disabled={!text} onClick={onSubmit}>Post</Button>
      {
        comments && comments.map(e => (
          <Card className='mt-2' key={`comment-${e.id}`}>
            <CardBody>
              <CardTitle>{`${e.author.firstName} ${e.author.lastName}`} on {e.date}</CardTitle>
              <CardText>{e.text}</CardText>
            </CardBody>
            {
              e.author.id === account.info.id && (
                <CardFooter>
                  <CardText>
                    <Button onClick={openDeleteModal(e.id)} color='danger'>Delete</Button>
                  </CardText>
                </CardFooter>
              )
            }
          </Card>
        ))
      }
    </div>
  </>
}

export default CommentSection
