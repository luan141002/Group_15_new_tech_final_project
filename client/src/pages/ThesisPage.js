import { useEffect, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Download, Eye, Pencil, Trash } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import PasswordPrompt from '../components/PasswordPrompt';
import { useAccount } from "../providers/account";
import ThesisService from "../services/ThesisService";
import ProfileImage from "../components/ProfileImage";

function ThesisPage() {
  const { tid } = useParams();
  const { t } = useTranslation();
  const { account } = useAccount();
  const navigate = useNavigate();
  const [thesis, setThesis] = useState(null);
  const [noThesis, setNoThesis] = useState(false);
  const [deadlines, setDeadlines] = useState(null);
  
  // Grade form
  const [grade, setGrade] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updateGradeDialogOpen, setUpdateGradeDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [gradeSummaryDialogOpen, setGradeSummaryDialogOpen] = useState(false);

  // Password verification
  const [packet, setPacket] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // File submissions
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  // Comments
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(false);
  const [commentDeleting, setCommentDeleting] = useState(false);

  const addFileButtonRef = useRef(null);

  const onLoad = async () => {
    const deadlines = await ThesisService.getDeadlines();
    if (tid) {
      const thesis = await ThesisService.getThesis(tid, { getSubmissions: true });
      if (thesis) {
        setThesis(thesis);
        const phase = thesis.phase;
        if (deadlines[phase.toString()]) {
          setDeadlines(deadlines[phase.toString()]);
        }
        setComments(await ThesisService.getCommentsOnThesis(tid));
      } else {
        setNoThesis(true);
      }
    } else if (account.kind === 'student') {
      const theses = await ThesisService.getTheses({ getSubmissions: true });
      if (theses && theses[0]) {
        setThesis(theses[0]);
        const phase = theses[0].phase;
        if (deadlines[phase.toString()]) {
          setDeadlines(deadlines[phase.toString()]);
        }
        setComments(await ThesisService.getCommentsOnThesis(theses[0]._id));
      } else {
        setNoThesis(true);
      }
    }
  };

  useEffect(() => {
    onLoad();
  }, [account]);

  const findMember = (thesis, submitterID, mode) => {
    let table;
    switch (mode) {
      case 'adviser': table = thesis.advisers; break;
      default: table = thesis.authors; break;
    }

    return table.find(e => e._id === submitterID);
  };

  const downloadFile = async (sid, attachment) => {
    const { originalName: name, _id: id } = attachment;
    const blob = await ThesisService.getAttachment(thesis._id, sid, id);
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  const handleCheckThesis = () => {
    setPacket({ status: 'checked' });
    setPasswordDialogOpen(true);
  };

  const handleAdvanceThesis = () => {
    setPacket({ status: 'new', phase: thesis.phase + 1 });
    setPasswordDialogOpen(true);
  };

  const handleLockThesis = () => {
    setPacket({ status: 'final' });
    setPasswordDialogOpen(true);
  };

  const handleEndorsement = () => {
    setPacket({ status: 'endorsed' });
    setPasswordDialogOpen(true);
  };

  const handleGradeSubmission = e => {
    e.preventDefault();
    let status = 'pass';
    let newGrade = undefined;
    if (grade === 'redefense' || grade === 'fail') {
      status = grade;
    } else {
      newGrade = Number.parseFloat(grade);
    }
    setPacket({ status, grade: newGrade, remarks });
    setPasswordDialogOpen(true);
  };

  const handleAddFile = (e) => {
    const file = e.currentTarget.files[0];
    setFiles(prev => [ ...prev, file ]);
    setFile('');
  };

  const handleRemoveFile = (e) => {
    setFiles(prev => prev.filter(e2 => e2 !== e));
  };

  const handleUploadFiles = async () => {
    try {
      setUploading(true);
      await ThesisService.uploadSubmission(thesis._id, files);
      setFiles([]);
      setSubmitting(false);
      await onLoad();
    } catch (error) {

    } finally {
      setUploading(false);
    }
  };

  const handleSubmitComment = async e => {
    e.preventDefault();
    try {
      setSubmittingComment(true);
      await ThesisService.commentOnThesis(thesis._id, { text: comment });
      await onLoad();
      setComment('');
    } catch (error) {

    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async id => {
    try {
      setCommentDeleting(true);
      await ThesisService.deleteComment(thesis._id, id);
      await onLoad();
      setCommentToDelete('');
    } catch (error) {

    } finally {
      setCommentDeleting(false);
    }
  };

  const handleApproveThesisRequest = () => {
    setPacket({ approved: true });
    setPasswordDialogOpen(true);
  };

  const handleDeleteThesis = () => {
    setPacket({ delete: true });
    setPasswordDialogOpen(true);
  }

  const handlePasswordEntry = async (password) => {
    setPasswordDialogOpen(false);
    setUpdating(true);
    try {
      if (packet) {
        if (packet.delete) {
          await ThesisService.deleteThesis(thesis._id);
          navigate('/thesis');
        } else {
          await ThesisService.updateStatus(thesis._id, { ...packet, password });
          await onLoad();
        }
      }
      setPacket(null);
      setUpdateGradeDialogOpen(false);
    } catch (error) {
      
    } finally {
      setUpdating(false);
    }
  };

  const isAuthor = () => {
    return thesis && thesis.authors.find(e => e._id === account.accountID);
  };

  const isAdvisory = () => {
    return thesis && thesis.advisers.find(e => e._id === account.accountID);
  };

  const isPanelist = () => {
    return thesis && thesis.panelists.find(e => e._id === account.accountID);
  };

  const isAdmin = () => {
    return account.kind === 'administrator';
  };

  const renderName = account => <><Link to={`/account/${account._id}`}>{t('values.display_full_name', account)}</Link>;&nbsp;</>;
  
  const gradeToDisplay = (() => {
    if (!thesis) return null;
    const { grades } = thesis;
    if (!grades) return null;
    
    const gradesThisPhase = grades.filter(e => e.phase === thesis.phase);
    if (gradesThisPhase.length > 0) {
      if (gradesThisPhase[0].value < 1.0) {
        const dateGraded = dayjs(gradesThisPhase[0].date);
        if (dayjs().isBefore(dateGraded.add(30, 'day')))
          return '0.0 (Fail)';
      } else {
        return `${gradesThisPhase[0].value.toFixed(1)} (Pass)`;
      }
    }

    return null;
  })();

  return thesis ? (
    <>
      {
        !thesis.approved && (account && account.kind === 'student') &&
          <Alert variant='info'>Your thesis requires approval from an administrator before you can start submitting.</Alert>
      }
      { 
        !thesis.approved && (account && account.kind === 'administrator') &&
          <Alert variant='info'>
            <Row>
              <Col className='d-flex flex-row align-items-middle'>
                <p className='my-auto'>This thesis requires approval from you or another administrator.</p>
              </Col>
              <Col className='d-flex flex-row align-items-end'>
                <Button color='primary' className='ms-auto me-2' onClick={handleApproveThesisRequest}>Approve Thesis</Button>
                <Button color='primary' onClick={handleDeleteThesis}>Delete Thesis</Button>
              </Col>
            </Row>
          </Alert>
      }
      <Row>
        <Col sm={9}>
          <h3>{thesis.title}</h3>
          <h6 className='text-muted'>by {thesis.authors.map(renderName)}</h6>
          <h6 className='text-muted'>advised by {thesis.advisers.map(renderName)}</h6>
          {
            thesis.description ?
              <p>{thesis.description}</p> :
              <p className='text-muted'>No description provided.</p>
          }
          {
            thesis.approved && <>
              <h5>Media and Files</h5>
              {
                (thesis.submissions && thesis.submissions.length > 0) ?
                  <>
                    <h6 className='text-muted'>Last updated on {dayjs(thesis.submissions[0].submitted).format('LLL')}</h6>
                    <ul>
                      {
                        thesis.submissions[0].attachments.map(e => (
                          <li>
                            <Button as='a' bsPrefix='__' onClick={() => downloadFile(thesis.submissions[0]._id, e)}>
                              {e.originalName}
                            </Button>
                            <Button as='a' className='ms-2' bsPrefix='__' onClick={() => downloadFile(thesis.submissions[0]._id, e)}>
                              <Download />
                            </Button>
                          </li>
                        ))
                      }
                    </ul>
                    {
                      (account.kind === 'student' && !submitting && deadlines) && (
                        deadlines.getTime() < Date.now()
                          ? <>You cannot upload files beyond the deadline.</>
                          : <Button onClick={() => setSubmitting(!submitting)}>Upload Files</Button>
                      )
                    }
                  </>
                  :
                  (
                    isAuthor() ?
                      (
                        !submitting && deadlines && (
                          <>
                            <p>You have not made any submissions for your thesis.</p>
                            {
                              deadlines.getTime() < Date.now()
                                ? <>You cannot upload files beyond the deadline.</>
                                : <Button onClick={() => setSubmitting(!submitting)}>Upload Files</Button>
                            }
                          </>
                        )
                      )
                      :
                      (
                        <>
                          <p>There are no submissions for this thesis.</p>
                        </>
                      )
                  )
              }
            </>
          }
          {
            submitting && (
              <Card>
                <Card.Body>
                  <Card.Title>Submit files</Card.Title>
                  <Card.Text>
                    <Form.Group className="mb-3" controlId="formDocument" style={{ display: 'none' }}>
                      <Form.Label>Add file</Form.Label>
                      <Form.Control type="file" value={file} onChange={handleAddFile} disabled={uploading} ref={addFileButtonRef} />
                    </Form.Group>
                    {
                      files.length > 0 ?
                        <ul>
                          {
                            files.map(e => (
                              <li>
                                <span>{e.name} ({e.size} bytes)</span>
                                <Button
                                  variant='link'
                                  onClick={() => handleRemoveFile(e)}
                                  className='ms-1'
                                  style={{ padding: 0 }}
                                  disabled={uploading}
                                >
                                  <Trash style={{ verticalAlign: 'baseline' }} />
                                </Button>
                              </li>
                            ))
                          }
                        </ul>
                        :
                        <div>
                          No files added.
                        </div>
                    }
                    <>
                      <Button onClick={() => (addFileButtonRef.current && addFileButtonRef.current.click())} className='mt-2'>
                        { files.length > 0 ? 'Add another file' : 'Add file' }
                      </Button>
                      <hr />
                    </>
                    <div className='mt-3'>
                      <Button onClick={handleUploadFiles} disabled={files.length < 1 || uploading} className='me-1'>Submit</Button>
                      <Button variant='secondary' onClick={() => { setFiles([]); setSubmitting(false); }} disabled={uploading}>Cancel</Button>
                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            )
          }
          {
            thesis.approved && <>
              <h5 className='mt-3'>Comments</h5>
              {
                (isAuthor() || isAdvisory() || isPanelist() || isAdmin()) &&
                  <Form onSubmit={handleSubmitComment}>
                    <Form.Group className="mb-3" controlId="formComment">
                      <Form.Control
                        as='textarea'
                        placeholder='Type your comment...'
                        rows={3}
                        value={comment}
                        onChange={e => setComment(e.currentTarget.value)}
                        disabled={submittingComment}
                      />
                    </Form.Group>
                    <Button type='submit' disabled={submittingComment}>Post</Button>
                  </Form>
              }
              {
                comments.length > 0 ?
                  <div className='mt-3'>
                    {
                      comments.map(e => (
                        <Card className='mb-3'>
                          <Card.Body>
                            <Card.Title>
                              <div className='d-inline-block align-top'>
                                <ProfileImage
                                  roundedCircle
                                  width={30}
                                  thumbnail
                                  accountID={e.author._id}
                                  className='me-2'
                                />
                              </div>
                              <div className='d-inline-block'>
                                <div className='align-baseline'>
                                  {t('values.display_full_name', { ...e.author, context: e.inactive })}
                                </div>
                                <div>
                                  <small className='text-muted' style={{fontSize: '1rem'}}>{dayjs(e.sent).format('LLL')}</small>
                                  {
                                    e.author._id === account.accountID &&
                                      <Button variant='link' onClick={() => setCommentToDelete(e._id)}><Trash /></Button>
                                  }
                                </div>
                              </div>
                            </Card.Title>
                            <Card.Text className='mt-1'>
                              <div className='ps-2' style={{ marginInlineStart: '30px', whiteSpace: 'pre-wrap' }}>
                                {e.text}
                              </div>
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      ))
                    }
                  </div>
                  :
                  <p className='mt-2 text-center text-muted'>
                    There are no comments.
                  </p>
              }
            </>
          }
        </Col>
        <Col sm={3}>
          <div>
            {
              account.kind !== 'student' &&
                <LinkContainer to={`/thesis/${thesis._id}/edit`}>
                  <Button className='me-1'>Edit</Button>
                </LinkContainer>
            }
            <Button variant='secondary' onClick={() => navigate(-1)}>Back</Button>
          </div>
          <Card className='mt-2'>
            <Card.Body>
              <Card.Text>
                <h4>Phase</h4>
                <p className='d-flex'>{t(`values.thesis_phase.${thesis.phase}`)}</p>
                <h4>Status</h4>
                <p className='d-flex'>
                  <div className='d-flex flex-row align-items-center'>
                    <span className={updating ? 'text-muted' : ''}>{t(`values.thesis_status.${thesis.status}`)}</span>
                    { updating && <Spinner className='ms-2' size='sm' /> }
                  </div>
                </p>
                <h4>Deadline</h4>
                <p className='d-flex'>{dayjs(deadlines).format('LLL')}</p>
                {
                  (isAdvisory() && (thesis.status === 'for_checking' || thesis.status === 'checked')) &&
                    <p>
                      { thesis.status !== 'checked' && <Button onClick={handleCheckThesis} className='me-2'>Mark as checked</Button> }
                      <Button onClick={handleEndorsement}>Endorse</Button>
                    </p>
                }
                {
                  (account && account.kind !== 'student') &&
                    <p>
                      { thesis.status === 'pass' && thesis.phase === 3 && <Button onClick={handleLockThesis}>Mark thesis as done</Button> }
                      { thesis.status === 'pass' && thesis.phase < 3 && <Button onClick={handleAdvanceThesis}>Advance to next phase</Button> }
                    </p>
                }
                <h4>Grade</h4>
                <p>
                  { gradeToDisplay || 'No grade yet' }
                  {
                    isAdvisory() &&
                      <Button as='a' className='ms-2' bsPrefix='__' onClick={() => setUpdateGradeDialogOpen(true)}>
                        <Pencil />
                      </Button>
                  }
                </p>
                <p>
                  <Button as='a' bsPrefix='__' onClick={() => setGradeSummaryDialogOpen(true)}>
                    View grade summary
                  </Button>
                </p>
                {
                  thesis.remarks &&
                    <>
                      <h4>Remarks</h4>
                      <p>{thesis.remarks}</p>
                    </>
                }
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal show={updateGradeDialogOpen} animation={false} centered>
        <Modal.Header>
          <Modal.Title>Update status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGradeSubmission}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formGrade">
              <Form.Label>Grade/Status</Form.Label>
              <Form.Select aria-label="Grade" value={grade} onChange={e => setGrade(e.currentTarget.value)}>
                <option>Select grade...</option>
                <option value="redefense">Redefense</option>
                <option>4.0</option>
                <option>3.5</option>
                <option>3.0</option>
                <option>2.5</option>
                <option>2.0</option>
                <option>1.5</option>
                <option>1.0</option>
                <option value="fail">0.0</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRemarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control as="textarea" rows={3} value={remarks} onChange={e => setRemarks(e.currentTarget.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type='submit'>Save</Button>
            <Button variant='secondary' onClick={() => setUpdateGradeDialogOpen(false)}>Close without saving</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={gradeSummaryDialogOpen} animation={false} centered>
        <Modal.Header>
          <Modal.Title>Grade summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            thesis && thesis.grades && thesis.grades.map(e => (
              <Row as='dl'>
                <Col as='dt' sm={3}>
                  {t(`values.thesis_phase.${e.phase}`)}
                </Col>
                <Col as='dt' sm={9}>
                  <div className='fw-normal'>
                    {e.value && e.value.toFixed(1)} <span className='text-muted'>(graded on {dayjs(e.date).format('LLL')})</span>
                  </div>
                </Col>
              </Row>
            ))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setGradeSummaryDialogOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={!!commentToDelete} animation={false} centered>
        <Modal.Header>
          <Modal.Title>Delete comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Once deleted, it cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => deleteComment(commentToDelete)} disable={commentDeleting}>Delete</Button>
          <Button variant='secondary' onClick={() => setCommentToDelete('')} disable={commentDeleting}>Cancel</Button>
        </Modal.Footer>
      </Modal>
      <PasswordPrompt show={passwordDialogOpen} onSubmit={handlePasswordEntry} onCancel={() => setPasswordDialogOpen(false)} />
    </>
  ) : (noThesis &&
    <>
      <h3>My Thesis</h3>
      <p>This page is empty, which means that you have not registered your thesis project with the system.</p>
      <p>Why not <Link to='/thesis/new'>request that your thesis project be added by an administrator</Link>?</p>
    </>
  );
}

export default ThesisPage;
