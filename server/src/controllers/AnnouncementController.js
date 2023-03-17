const express = require('express');
const requirePass = require('../middleware/requirePass');
const requireToken = require('../middleware/requireToken');
const Announcement = require('../models/Announcement');
const AnnouncementRead = require('../models/AnnouncementRead');
const ServerError = require('../utility/error');
const isQueryTrue = require('../utility/isQueryTrue');

const AnnouncementController = express.Router();

AnnouncementController.get('/announcement', requireToken, async (req, res) => {
    const { accountID } = req.token;
    const { all, items, page } = req.query;

    try {

        const query = {};
        if (!isQueryTrue(all)) {
            const allRead = await AnnouncementRead.find({ account: accountID });
            query._id = { $nin: allRead.map(e => e._id.toString()) };
        }

        const count = await Announcement.countDocuments(query);
        let isPaginated = false;
        let nItems = 10;
        let nPage = 1;
        let nTotalPages = 1;
        if (items || page) {
            isPaginated = true;
            nItems = Number.parseInt(items) || nItems;
            nPage = Number.parseInt(page) || nPage;

            nTotalPages = Math.floor((count - 1) / nItems) + 1;
            if (nPage > nTotalPages) {
                nPage = nTotalPages;
            } else if (nPage < 1) {
                nPage = 1;
            }
        }

        if (count === 0) {
            const empty = { items: [] };
            if (isPaginated) {
                empty = {
                    page: 1,
                    maxPages: 1,
                    items: [],
                    total: 0
                };
            }

            return res.json(empty);
        }

        let announcementsQuery = Announcement.find(query).sort({ sent: 'desc' }).populate('author');
        if (isPaginated) {
            announcementsQuery = announcementsQuery.skip((nPage - 1) * nItems).limit(nItems);
        }

        const announcements = await announcementsQuery;
        if (!isQueryTrue(all)) {
            const read = announcements.map(e => ({ announcement: e._id, account: accountID }));
            try {
                await AnnouncementRead.create(read);
            } catch (err) {
                // no error handling
            }
        }

        const results = {
            items: (await announcements).map(e => ({
                _id: e._id,
                author: {
                    _id: e.author._id,
                    lastName: e.author.lastName,
                    firstName: e.author.firstName,
                    middleName: e.author.middleName
                },
                title: e.title,
                text: e.text,
                sent: e.sent
            }))
        };

        if (isPaginated) {
            results.page = nPage;
            results.maxPages = nTotalPages;
            results.total = count;
        }

        return res.json(results);
    } catch (error) {
        return res.error(error);
    }
});

AnnouncementController.post('/announcement', requireToken, async (req, res) => {
    const { accountID, kind, lastName, firstName, middleName } = req.token;
    const { title, text } = req.body;

    try {
        if (kind !== 'administrator') throw new ServerError(403, 'You must be an administrator to create announcements');

        const announcement = await Announcement.create({
            author: accountID,
            title,
            text
        });

        return res.status(201).location(`/announcement/${announcement._id}`).json({
            _id: announcement._id,
            author: {
                _id: accountID,
                lastName,
                firstName,
                middleName
            },
            text,
            sent: announcement.sent
        })
    } catch (error) {
        return res.error(error);
    }
});

AnnouncementController.delete('/announcement/:id', requireToken, async (req, res) => {
    const { id } = req.params;
    const { kind } = req.token;

    try {
        if (kind !== 'administrator') throw new ServerError(403, 'You must be an administrator to delete announcements');
        await Announcement.deleteOne({ _id: id });
        return res.sendStatus(204);
    } catch (error) {
        return res.error(error);
    }
});

module.exports = AnnouncementController;
