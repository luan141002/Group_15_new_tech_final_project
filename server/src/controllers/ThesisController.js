const express = require('express');
const requireToken = require('../middleware/requireToken');
const Thesis = require('../models/Thesis');
const multer = require('multer');
const Submission = require('../models/Submission');
const ServerError = require('../utility/error');

const ThesisController = express.Router();

const upload = multer();

ThesisController.get('/thesis', requireToken, async (req, res) => {
    const { all, q } = req.query;
    const { accountID } = req.token;
    
    try {
        let query = { $or: [ { authors: accountID }, { advisers: accountID } ] };

        if (all) query = {};
        if (q) query.title = { $regex: q, $options: 'i' };

        let results = await Thesis.find(query).populate('authors').populate('advisers');

        if (req.query.hasSubmission || req.query.getSubmissions) {
            const thesisIDs = results.map(e => e._id);
            const submissions = await Submission.find({ thesis: { $in: thesisIDs } }).select('-attachments');
            results = results.filter(thesis => {
                if (!req.query.hasSubmission && !req.query.getSubmissions) return true;
                const thesisSubmissions = submissions.filter(sub => sub.thesis.toString() === thesis._id.toString());
                if (!!req.query.hasSubmission && thesisSubmissions.length === 0) return false;
                const submissionsByDate = [ ...thesisSubmissions ].sort((a, b) => a.submitted.getTime() - b.submitted.getTime());
                const latest = submissionsByDate[0];

                if (!!req.query.hasSubmission) {
                    thesis.submission = {
                        latest: latest._id.toString(),
                        when: latest.submitted
                    };
                }

                // TODO: figure out why !getSubmission works
                if (!req.query.getSubmission) {
                    thesis.submissions = submissionsByDate.map(e => ({
                        _id: e._id.toString(),
                        submitted: e.submitted,
                        submitter: e.submitter
                    }))
                }

                return true;
            });
        }

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
            submissions.sort((a, b) => a.submitted.getTime() - b.submitted.getTime());

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
            submissions: result.submissions
        });
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
        if (!thesis) throw new ServerError(404, 'Thesis not found');

        if (thesis.locked) throw new ServerError(403, 'Thesis is locked and cannot be edited.');

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
        if (!authors) throw new ServerError(400, 'Author list is required');
        if (!advisers) throw new ServerError(400, 'Adviser list is required');
        if (!authors.includes(accountID)) throw new ServerError(400, 'Current user must be part of the group');
        if (!advisers || (Array.isArray(advisers) && advisers.length > 2)) throw new ServerError(400, 'Only 1-2 advisers can be added.');
        
        const thesis = await Thesis.create({
            title,
            description,
            authors,
            advisers
        });

        if (req.files) {
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
