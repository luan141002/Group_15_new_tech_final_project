const express = require('express');
const requireToken = require('../middleware/requireToken');
const Account = require('../models/Account');
const Defense = require('../models/Defense');
const DefenseRequest = require('../models/DefenseRequest');
const Thesis = require('../models/Thesis');
const ServerError = require('../utility/error');

const DefenseController = express.Router();
const CURRENT_TERM = process.env.CURRENT_TERM;

DefenseController.get('/defense', requireToken, async (req, res) => {
    const { accountID, kind } = req.token;
    const { thesis, phase, status } = req.query;

    try {
        const query = { term: CURRENT_TERM };
        if (thesis) query.thesis = thesis;
        if (Number.parseInt(phase)) query.phase = Number.parseInt(phase);
        if (status) {
            const statuses = status.split(',');
            if (statuses.length === 1) {
                query.status = statuses[0];
            } else if (statuses.length > 1) {
                query.status = { $in: statuses };
            }
        }

        const thesisPopulate = kind !== 'student' ?
            { path: 'thesis', populate: [ { path: 'advisers' }, { path: 'authors' } ] } :
            { path: 'thesis', populate: [ { path: 'authors' } ] };

        const schedules = await Defense.find(query)
            .populate(thesisPopulate)
            .populate('panelists');

        return res.json(schedules.map(e => ({
            _id: e._id,
            start: e.start,
            end: e.end,
            title: e.title,
            thesis: {
                _id: e.thesis._id,
                title: e.thesis.title,
                advisers: e.thesis.advisers.map(e2 => ({
                    _id: e2._id,
                    lastName: e2.lastName,
                    firstName: e2.firstName,
                    middleName: e2.middleName
                })),
                authors: e.thesis.authors ? e.thesis.authors.map(e2 => ({
                    _id: e2._id,
                    lastName: e2.lastName,
                    firstName: e2.firstName,
                    middleName: e2.middleName
                })) : undefined
            },
            panelists: e.panelists.map(e2 => ({
                _id: e2._id,
                lastName: e2.lastName,
                firstName: e2.firstName,
                middleName: e2.middleName
            })),
            status: e.status,
            phase: e.phase
        })));
    } catch (error) {
        return res.error(error, 'Could not get defense schedule.');
    }
});

DefenseController.post('/defense', requireToken, async (req, res) => {
    const { accountID, kind } = req.token;
    const slots = Array.isArray(req.body) ? req.body : [req.body];

    try {
        if (kind === 'student') {
            let thesisQuery = { authors: accountID, locked: false };
            const thesis = await Thesis.findOne(thesisQuery);
            if (!thesis) throw new ServerError(403, 'Only students with a thesis can requesting defense slots.');
            if (thesis.status !== 'endorsed') throw new ServerError(403, 'The thesis must be endorsed before requesting defense slots.');

            const slotObjs = slots.map(e => {
                if (!e.action || e.action === 'create') {
                    return {
                        title: e.title || thesis.title,
                        start: e.start,
                        end: e.end,
                        thesis: thesis._id,
                        phase: thesis.phase,
                        term: CURRENT_TERM,
                        panelists: []
                    };
                } else if (e.action === 'delete') {
                    return {
                        _id: e._id,
                        action: 'delete'
                    };
                }
            });

            const slotsToCreate = slotObjs.filter(e => !e.action);
            const slotsToDelete = slotObjs.filter(e => e.action === 'delete');

            const added = await Defense.create(slotsToCreate);
            await Defense.deleteMany({ _id: { $in: slotsToDelete.map(e => e._id) }});

            return res.json([
                ...(added),
                ...(slotsToDelete.map(e => ({ _id: e._id, status: 'deleted' })))
            ]);
        } else if (kind === 'faculty') {
            const allIDs = slots.map(e => e._id);
            const defenseSlots = await Defense.find({ _id: { $in: allIDs }, status: { $not: 'confirmed' } }).populate('thesis');

            const idsToApprove = slots.filter(e => {
                const defenseSlot = defenseSlots.find(e2 => e2._id.toString() === e._id);
                if (!defenseSlot) return false;

                return e.action === 'approve' && !!defenseSlot.thesis.advisers.find(e2 => e2.toString() === accountID);
            });

            const idsToDecline = slots.filter(e => {
                const defenseSlot = defenseSlots.find(e2 => e2._id.toString() === e._id);
                if (!defenseSlot) return false;

                return e.action === 'decline' && !!defenseSlot.thesis.advisers.find(e2 => e2.toString() === accountID);
            });

            await Defense.updateMany({ _id: { $in: idsToApprove }}, { status: 'approved' });
            await Defense.updateMany({ _id: { $in: idsToDecline }}, { status: 'declined' });

            return res.json([
                ...(idsToApprove.map(e => ({ _id: e, status: 'approved' }))),
                ...(idsToDecline.map(e => ({ _id: e, status: 'declined' })))
            ]);
        } else if (kind === 'administrator') {
            const allIDs = slots.filter(e => !!e.action && e.action !== 'create').map(e => e._id);
            const allThesisIDs = slots
                .filter(e => !e.action || e.action === 'create')
                .map(e => e.thesis)
                .reduce((p, e) => ({ ...p, [e]: true }), {});
            const allTheses = await Thesis.find({ _id: { $in: Object.keys(allThesisIDs) }});
            for (const nthesis of allTheses) {
                allThesisIDs[nthesis._id.toString()] = { phase: nthesis.phase, title: nthesis.title };
            }

            const defenseSlots = await Defense.find({ _id: { $in: allIDs }, status: 'approved' });

            const slotObjs = slots.map(e => {
                if (!e.action || e.action === 'create') {
                    return {
                        title: e.title || allThesisIDs[e.thesis].title,
                        start: e.start,
                        end: e.end,
                        thesis: e.thesis,
                        phase: allThesisIDs[e.thesis].phase,
                        term: CURRENT_TERM,
                        panelists: [],
                        status: 'confirmed'
                    };
                } else {
                    return {
                        _id: e._id,
                        action: e.action
                    };
                }
            });

            const idsToConfirm = slotObjs.filter(e => {
                if (!e._id) return false;
                const defenseSlot = defenseSlots.find(e2 => e2._id.toString() === e._id);
                if (!defenseSlot) return false;

                return e.action === 'confirm';
            });

            const idsToDecline = slotObjs.filter(e => {
                if (!e._id) return false;
                const defenseSlot = defenseSlots.find(e2 => e2._id.toString() === e._id);
                if (!defenseSlot) return false;

                return e.action === 'decline';
            });

            const slotsToCreate = slotObjs.filter(e => {
                if (e._id) return false;
                return (!e.action || e.action === 'create') && !!e.thesis;
            });

            console.log(slotsToCreate);

            const results = await Defense.create(slotsToCreate);
            await Defense.updateMany({ _id: { $in: idsToConfirm }}, { status: 'confirmed' });
            await Defense.updateMany({ _id: { $in: idsToDecline }}, { status: 'declined' });

            return res.json([
                ...(results),
                ...(idsToConfirm.map(e => ({ _id: e, status: 'confirmed' }))),
                ...(idsToDecline.map(e => ({ _id: e, status: 'declined' })))
            ]);
        } else {
            throw new ServerError(403, 'No permission to create defense schedules');
        }
    } catch (error) {
        return res.error(error, 'Could not create defense schedule.')
    }
});

module.exports = DefenseController;
