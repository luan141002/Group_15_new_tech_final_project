const express = require('express');
const requireToken = require('../middleware/requireToken');
const transacted = require('../middleware/transacted');
const Account = require('../models/Account');
const Defense = require('../models/Defense');
const Thesis = require('../models/Thesis');
const ServerError = require('../utility/error');
const DefenseWeek = require('../models/DefenseWeek');

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

        const thesisPopulate = { path: 'thesis', populate: [ { path: 'advisers' }, { path: 'authors' } ] };
        const schedules = await Defense.find(query)
            .populate(thesisPopulate)
            .populate('panelists.faculty');

        return res.json(schedules.map(e => ({
            _id: e._id,
            start: e.start,
            end: e.end,
            description: e.description,
            thesis: {
                _id: e.thesis._id,
                title: e.thesis.title,
                advisers: e.thesis.advisers.map(e2 => ({
                    _id: e2._id,
                    lastName: e2.lastName,
                    firstName: e2.firstName,
                    middleName: e2.middleName
                })),
                authors: e.thesis.authors.map(e2 => ({
                    _id: e2._id,
                    lastName: e2.lastName,
                    firstName: e2.firstName,
                    middleName: e2.middleName
                }))
            },
            panelists: e.panelists.map(e2 => ({
                faculty: {
                    _id: e2.faculty._id,
                    lastName: e2.faculty.lastName,
                    firstName: e2.faculty.firstName,
                    middleName: e2.faculty.middleName
                },
                approved: e2.approved,
                declined: e2.declined
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
                        start: e.start,
                        end: e.end,
                        thesis: thesis._id,
                        description: e.description,
                        phase: thesis.phase,
                        term: CURRENT_TERM,
                        panelists: e.panelists ? e.panelists.map(e2 => ({ faculty: e2 })) : []
                    };
                } else if (e.action === 'update') {
                    return {
                        _id: e._id,
                        description: e.description,
                        panelists: e.panelists || [],
                        action: 'update'
                    };
                } else if (e.action === 'delete') {
                    return {
                        _id: e._id,
                        action: 'delete'
                    };
                }
            });

            const slotsToCreate = slotObjs.filter(e => !e.action);
            const slotsToUpdate = slotObjs.filter(e => e.action === 'update');
            const slotsToDelete = slotObjs.filter(e => e.action === 'delete');

            const added = await Defense.create(slotsToCreate);
            for (const slotToUpdate of slotsToUpdate) {
                await Defense.updateOne({
                    _id: slotToUpdate._id,
                    description: slotToUpdate.description,
                    panelists: slotToUpdate.panelists || []
                });
            }
            await Defense.deleteMany({ _id: { $in: slotsToDelete.map(e => e._id) }});

            return res.json([
                ...(added),
                ...(slotsToDelete.map(e => ({ _id: e._id, status: 'deleted' })))
            ]);
        } else if (kind === 'faculty') {
            const allIDs = slots.map(e => e._id);
            const defenseSlots = await Defense.find({ _id: { $in: allIDs }, status: { $not: /^confirmed$/ } });

            const updateSlots = {};
            const errors = [];

            slots.forEach((e, index) => {
                const defenseSlot = defenseSlots.find(e2 => e2._id.toString() === e._id.toString());
                if (!defenseSlot) return;

                const panelists = defenseSlot.panelists;
                const entryIndex = panelists.findIndex(e2 => e2.faculty.toString() === accountID);
                if (entryIndex === -1) {
                    errors.push({ index, message: 'You cannot approve or decline a slot that you are not a panel member of.' });
                }

                if (e.action === 'approve') {
                    panelists[entryIndex] = { faculty: accountID, approved: true };
                    if (panelists.every(e2 => e2.approved)) {
                        updateSlots[defenseSlot._id] = { panelists, status: 'approved' };
                    } else {
                        updateSlots[defenseSlot._id] = { panelists };
                    }
                } else if (e.action === 'decline') {
                    panelists[entryIndex] = { faculty: accountID, declined: true };
                    updateSlots[defenseSlot._id] = { panelists, status: 'declined' };
                }
            });

            for (const [key, value] of Object.entries(updateSlots)) {
                await Defense.updateOne({ _id: key }, value);
            }

            return res.json([]);
        } else if (kind === 'administrator') {
            const allIDs = slots.filter(e => !!e.action && e.action !== 'create').map(e => e._id);
            const allThesisIDs = slots
                .filter(e => !e.action || e.action === 'create')
                .map(e => e.thesis)
                .reduce((p, e) => ({ ...p, [e]: true }), {});
            const allTheses = await Thesis.find({ _id: { $in: Object.keys(allThesisIDs) }});
            for (const nthesis of allTheses) {
                allThesisIDs[nthesis._id.toString()] = { phase: nthesis.phase };
            }

            const defenseSlots = await Defense.find({ _id: { $in: allIDs }, status: 'approved' });

            const slotObjs = slots.map(e => {
                if (!e.action || e.action === 'create') {
                    return {
                        start: e.start,
                        end: e.end,
                        thesis: e.thesis,
                        phase: allThesisIDs[e.thesis].phase,
                        term: CURRENT_TERM,
                        panelists: e.panelists ? e.panelists.map(e2 => ({ faculty: e2 })) : [],
                        status: 'confirmed'
                    };
                } else if (e.action === 'update') {
                    return {
                        _id: e._id,
                        description: e.description,
                        panelists: e.panelists || [],
                        action: 'update'
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

            const idsToDelete = slotObjs.filter(e => {
                if (!e._id) return false;
                const defenseSlot = defenseSlots.find(e2 => e2._id.toString() === e._id);
                if (!defenseSlot) return false;

                return e.action === 'decline';
            });

            const slotsToCreate = slotObjs.filter(e => {
                if (e._id) return false;
                return (!e.action || e.action === 'create') && !!e.thesis;
            });
            const slotsToUpdate = slotObjs.filter(e => e.action === 'update');

            for (const slotToUpdate of slotsToUpdate) {
                await Defense.updateOne({
                    _id: slotToUpdate._id,
                    description: slotToUpdate.description,
                    panelists: slotToUpdate.panelists || []
                });
            }
            const slotsToDelete = slotObjs.filter(e => e.action === 'delete');

            const results = await Defense.create(slotsToCreate);
            await Defense.updateMany({ _id: { $in: idsToConfirm }}, { status: 'confirmed' });
            await Defense.updateMany({ _id: { $in: idsToDecline }}, { status: 'declined' });
            await Defense.deleteMany({ _id: { $in: slotsToDelete.map(e => e._id) }});

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

DefenseController.get('/defenseweek', requireToken, async (req, res) => {
    try {
        const week = await DefenseWeek.find();
        return res.json(week.map(e => ({
            dates: e.dates.map(e2 => ({
                start: e2.start,
                end: e2.end
            })),
            phase: e.phase
        })));
    } catch (error) {
        return res.error(error, 'Could not get defense schedule.')
    }
});

DefenseController.post('/defenseweek', requireToken, transacted, async (req, res) => {
    const { body, token, session } = req;
    const { accountID, kind } = token;
    const entries = Array.isArray(body) ? body : [body];

    try {
        if (kind !== 'administrator') throw new ServerError(403, 'You cannot modify the defense schedule');
        
        session.startTransaction();
        
        for (const entry of entries) {
            const { phase, dates } = entry;
            const defenseWeek = await DefenseWeek.findOne({ phase }, { session });
            if (defenseWeek) {
                defenseWeek.dates = dates;
                await defenseWeek.save();
            } else {
                await DefenseWeek.create({ phase, dates }, { session });
            }
        }

        await session.commitTransaction();

        return res.sendStatus(204);
    } catch (error) {
        return res.error(error, 'Could not post defense schedule.')
    }
});

module.exports = DefenseController;
