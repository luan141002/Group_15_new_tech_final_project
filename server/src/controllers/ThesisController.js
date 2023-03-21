const express = require('express');
const multer = require('multer');
const requirePass = require('../middleware/requirePass');
const requireToken = require('../middleware/requireToken');
const Comment = require('../models/Comment');
const Submission = require('../models/Submission');
const Thesis = require('../models/Thesis');
const ServerError = require('../utility/error');
const isQueryTrue = require('../utility/isQueryTrue');

const ThesisController = express.Router();

const upload = multer();

ThesisController.get('/thesis', requireToken, async (req, res) => {
    const { all, q, status, phase } = req.query;
    const { accountID, kind } = req.token;
    
    try {
        let query = { $or: [ { authors: accountID }, { advisers: accountID } ] };

        if ((all === undefined && kind === 'administrator') || isQueryTrue(all)) query = {};
        if (q) query.title = { $regex: q, $options: 'i' };
        if (status) query.status = status;
        if (phase && Number.parseInt(phase)) query.phase = Number.parseInt(phase);

        let results = await Thesis.find(query).populate('authors').populate('advisers');

        const thesisIDs = results.map(e => e._id);
        const submissions = await Submission.find({ thesis: { $in: thesisIDs } }).select('-attachments');
        results = results.filter(thesis => {
            const thesisSubmissions = submissions.filter(sub => sub.thesis.toString() === thesis._id.toString());
            const submissionsByDate = [ ...thesisSubmissions ].sort((a, b) => b.submitted.getTime() - a.submitted.getTime());
            const latest = submissionsByDate[0];

            if (thesisSubmissions.length > 0) {
                thesis.submission = {
                    latest: latest._id.toString(),
                    when: latest.submitted
                };
            }

            if (isQueryTrue(req.query.getSubmissions)) {
                thesis.submissions = submissionsByDate.map(e => ({
                    _id: e._id.toString(),
                    submitted: e.submitted,
                    submitter: e.submitter
                }))
            }

            return true;
        });

        return res.json(results.map(e => ({
            _id: e._id,
            title: e.title,
            description: e.description,
            authors: e.authors.map(e2 => ({
                _id: e2._id,
                lastName: e2.lastName,
                firstName: e2.firstName,
                middleName: e2.middleName
            })),
            advisers: e.advisers.map(e2 => ({
                _id: e2._id,
                lastName: e2.lastName,
                firstName: e2.firstName,
                middleName: e2.middleName
            })),
            phase: e.phase,
            status: e.status,
            submission: e.submission,
            submissions: e.submissions
        })));
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.get('/thesis/:id', requireToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        let result = await Thesis.findById(id).populate('authors').populate('advisers');

        if (!!req.query.getSubmissions) {
            const submissions = await Submission.find({ thesis: result }).select('-attachments.data');
            submissions.sort((a, b) => b.submitted.getTime() - a.submitted.getTime());

            result.submissions = submissions.map(e => ({
                _id: e._id.toString(),
                submitted: e.submitted,
                submitter: e.submitter,
                attachments: e.attachments.map(e2 => ({
                    _id: e2._id,
                    originalName: e2.originalName,
                    size: e2.size
                }))
            }));
        }

        const grades = result.grades || [];
        grades.sort((a, b) => -(a.when.getTime() - b.when.getTime()));

        return res.json({
            _id: result._id,
            title: result.title,
            description: result.description,
            authors: result.authors.map(e2 => ({
                _id: e2._id,
                lastName: e2.lastName,
                firstName: e2.firstName,
                middleName: e2.middleName
            })),
            advisers: result.advisers.map(e2 => ({
                _id: e2._id,
                lastName: e2.lastName,
                firstName: e2.firstName,
                middleName: e2.middleName
            })),
            phase: result.phase,
            grade: grades[0] ? grades[0].value : undefined,
            status: result.status,
            remarks: grades[0] ? grades[0].remarks : undefined,
            submissions: result.submissions
        });
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.put('/thesis/:id', requireToken, async (req, res) => {
    const { id } = req.params;
    const { accountID, kind } = req.token;
    const { title, description, authors, advisers, status, phase } = req.body;
    
    try {
        const thesis = await Thesis.findById(id);

        if (!thesis) throw new ServerError(404, 'Thesis not found.');
        if (title) thesis.title = title;
        if (description) thesis.description = description;
        if (authors) {
            if (kind.toLowerCase() !== 'administrator' && !authors.includes(accountID)) throw new ServerError(400, 'Current user must be part of the group');
            thesis.authors = authors;
        }
        if (advisers) {
            if (!advisers || (Array.isArray(advisers) && advisers.length > 2)) throw new ServerError(400, 'Only 1-2 advisers can be added.');
            thesis.advisers = advisers;
        }
        if (status && kind.toLowerCase() !== 'student') thesis.status = status;
        if (phase && Number.parseInt(phase) && kind.toLowerCase() === 'administrator') thesis.phase = Number.parseInt(phase);

        await thesis.save();

        return res.sendStatus(204);
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.get('/thesis/:id/comment', requireToken, async (req, res) => {
    const { id } = req.params;
    const { accountID, kind } = req.token;
    
    try {
        const thesis = await Thesis.findById(id);

        if (!thesis) throw new ServerError(404, 'Thesis not found.');
        if (kind === 'student' && !thesis.authors.find(e => e.toString() === accountID))
            throw new ServerError(403, 'You must be an author to be able to read comments.');
        
        const comments = await Comment.find({ thesis: id }).populate('author');

        return res.json(comments.map(e => ({
            _id: e._id,
            author: {
                _id: e.author._id,
                lastName: e.author.lastName,
                firstName: e.author.firstName,
                middleName: e.author.middleName
            },
            text: e.text,
            sent: e.sent
        })));
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.post('/thesis/:id/comment', requireToken, async (req, res) => {
    const { id } = req.params;
    const { accountID, kind, lastName, firstName, middleName } = req.token;
    const { text } = req.body;
    
    try {
        const thesis = await Thesis.findById(id);

        if (!thesis) throw new ServerError(404, 'Thesis not found.');
        if (kind === 'student' && !thesis.authors.find(e => e.toString() === accountID))
            throw new ServerError(403, 'You must be an author to comment.');
        
        const comment = await Comment.create({
            thesis: id,
            author: accountID,
            text
        });

        return res.status(201).location(`/thesis/${id}/comment/${comment._id}`).json({
            _id: comment._id,
            thesis: id,
            author: {
                _id: accountID,
                lastName,
                firstName,
                middleName
            },
            text,
            sent: comment.sent
        });
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.delete('/thesis/:id/comment/:cid', requireToken, async (req, res) => {
    const { id, cid } = req.params;
    const { accountID } = req.token;
    
    try {
        await Comment.deleteOne({ _id: cid, thesis: id, author: accountID });
        return res.sendStatus(204);
    } catch (error) {
        return res.error(error);
    }
});

const transitions = [
    [ 'new', 'for_checking' ],
    [ 'for_checking', 'for_checking' ],
    [ 'for_checking', 'checked' ],
    [ 'for_checking', 'endorsed' ],
    [ 'checked', 'for_checking' ],
    [ 'checked', 'endorsed' ],
    [ 'endorsed', 'pass' ],
    [ 'endorsed', 'fail' ],
    [ 'endorsed', 'redefense' ],
    [ 'redefense', 'endorsed' ],
    [ 'pass', 'new' ],
    [ 'fail', 'new' ],
    [ 'pass', 'for_checking' ],
    [ 'fail', 'for_checking' ],
];

const isValidTransition = (prev, next) => {
    for (const [p, n] of transitions) {
        if (p === prev && n === next) return true;
    }

    return false;
};

ThesisController.post('/thesis/:tid/status', requireToken, requirePass, async (req, res) => {
    const { tid } = req.params;
    const { accountID, kind } = req.token;
    const { status, grade, remarks } = req.body;

    try {
        if (kind === 'student') throw new ServerError(403, 'Cannot change status.');
        
        const thesis = await Thesis.findById(tid);
        if (!thesis) throw new ServerError(404, 'Thesis not found.');

        if (thesis.locked) throw new ServerError(403, 'Thesis is locked and cannot be edited.');

        if (!status) throw new ServerError(400, 'Status required.');

        const initialStatus = thesis.status;
        const nextStatus = status;
        if (!isValidTransition(initialStatus, nextStatus)) throw new ServerError(400, 'Invalid status.');

        let newGrade = 0.0;
        if (status === 'pass') {
            if (!grade) throw new ServerError(400, 'Grade required.');
            newGrade = grade;
        }

        thesis.status = nextStatus;
        if (status === 'pass' || status === 'fail') {
            thesis.grades.push({
                value: newGrade,
                phase: thesis.phase,
                remarks: remarks ? remarks.trim() : null,
                by: accountID
            });
        }

        await thesis.save();
        return res.sendStatus(204);
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.post('/thesis/:tid/submission', requireToken, upload.array('files'), async (req, res) => {
    // TODO: limit the number of uploads per day
    const { tid, sid } = req.params;
    const { accountID, kind } = req.token;

    try {
        const thesis = await Thesis.findById(tid);
        if (kind.toLowerCase() !== 'student') throw new ServerError(403, 'Only students can submit new files.');
        if (!thesis) throw new ServerError(404, 'Thesis not found');
        if (thesis.locked) throw new ServerError(403, 'Thesis is locked and cannot be edited.');
        if (!thesis.authors.find(e => e.toString() === accountID)) throw new ServerError(403, 'You cannot submit to a thesis in which you are not the author.');

        let submission = null;
        if (req.files) {
            const attachments = req.files.map(e => ({
                originalName: e.originalname,
                data: e.buffer,
                mime: e.mimetype
            }));

            submission = await Submission.create({
                thesis,
                submitter: accountID,
                attachments
            });
        }

        if (submission) {
            thesis.status = 'for_checking';
            await thesis.save();
            return res.status(201).location(`/thesis/${tid}/submission/${thesis._id}`).json({
                _id: submission._id,
                submitter: accountID,
                submitted: submission.submitted
            })
        } else {
            throw new ServerError(500, 'Could not add submission for a reason');
        }
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.get('/thesis/:tid/submission/latest', requireToken, async (req, res) => {
    const { tid } = req.params;
    
    try {
        const submission = await Submission.findOne({ thesis: tid }, {}, { submitted: -1 })
            .populate('submitter').populate('thesis').select('-attachments.data');

        return res.json({
            thesis: {
                _id: submission.thesis._id,
                title: submission.thesis.title
            },
            submitter: {
                _id: submission.submitter._id,
                lastName: submission.submitter.lastName,
                firstName: submission.submitter.firstName,
                middleName: submission.submitter.middleName
            },
            submitted: submission.submitted,
            attachments: submission.attachments
        });
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.get('/thesis/:tid/submission/:sid', requireToken, async (req, res) => {
    const { tid, sid } = req.params;
    
    try {
        const submission = await Submission.findOne({ thesis: tid, _id: sid }).populate('submitter').populate('thesis').select('-attachments.data');

        return res.json({
            thesis: {
                _id: submission.thesis._id,
                title: submission.thesis.title
            },
            submitter: {
                _id: submission.submitter._id,
                lastName: submission.submitter.lastName,
                firstName: submission.submitter.firstName,
                middleName: submission.submitter.middleName
            },
            submitted: submission.submitted,
            attachments: submission.attachments
        });
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.get('/thesis/:tid/submission/:sid/attachment/:aid', requireToken, async (req, res) => {
    const { tid, sid, aid } = req.params;
    
    try {
        const submission = await Submission.findOne({ thesis: tid, _id: sid });
        if (!submission) throw new ServerError(404, 'Submission not found');

        const attachment = submission.attachments.id(aid);
        if (!attachment) throw new ServerError(404, 'Attachment not found');
        return res.contentType(attachment.mime).send(attachment.data);
    } catch (error) {
        return res.error(error);
    }
});

ThesisController.post('/thesis', requireToken, upload.array('files'), async (req, res) => {
    const { title, description, authors, advisers } = req.body;
    const { accountID, kind } = req.token;

    try {
        if (!title) throw new ServerError(400, 'Title is required');
        if (!authors) throw new ServerError(400, 'Author list is required');
        if (!advisers) throw new ServerError(400, 'Adviser list is required');
        if (kind.toLowerCase() !== 'administrator' && !authors.includes(accountID)) throw new ServerError(400, 'Current user must be part of the group');
        if (!advisers || (Array.isArray(advisers) && advisers.length > 2)) throw new ServerError(400, 'Only 1-2 advisers can be added.');
        
        const thesis = await Thesis.create({
            title,
            description,
            authors,
            advisers
        });

        if (req.files && req.files.length > 0) {
            const attachments = req.files.map(e => ({
                originalName: e.originalname,
                data: e.buffer,
                mime: e.mimetype
            }));

            const submission = await Submission.create({
                thesis,
                submitter: accountID,
                attachments
            });
        }

        return res.status(201).location(`/thesis/${thesis._id}`).json({
            _id: thesis._id,
            title,
            description
        })
    } catch (error) {
        return res.error(error);
    }
});

module.exports = ThesisController;
