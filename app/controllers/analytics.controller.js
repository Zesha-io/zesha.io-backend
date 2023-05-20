const dayjs = require('dayjs');
const db = require("../models");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const Earning = db.earnings;
const User = db.users;

module.exports = {
    getCreatorAnalytics: async (req, res) => {
        // total views, total hours watched, total earnings
        // views over period, grouped by day/week
        const { id } = req.params;
        try {
            let creator = await User.findOne({
                _id: id,
                userType: 'CREATOR'
            });
            if (!creator)
                return res.status(404).json({ status: false, message: `Could not find creator of ID ${id}` });
            // total views (distinct users)
            let totalvideoviews = await ViewHistory.find({ creator: creator._id }).distinct('viewer').length;
            // total hours watched
            let totaltimewatched = await ViewHistory.aggregate([
                { $match: { creator: creator._id } },
                {
                    $group: {
                        _id: null,
                        totaltimewatched: { $sum: "$watchDuration" },
                    }
                }
            ]);
            // total earnings
            let totalearnings = await Earning.aggregate([
                { $match: { creator: creator._id } },
                {
                    $group: {
                        _id: null,
                        totalearnings: { $sum: { $add: ["$viewerAmount", "$creatorAmount"] } },
                        creatortotalearnings: { $sum: "$creatorAmount" },
                        viewerstotalearnings: { $sum: "$viewerAmount" },
                    }
                }
            ])
            // earnings grouped by week for the last 1 month
            let totalearningsgroupedbydate = await Earning.aggregate([
                { 
                    $match: { 
                        creator: creator._id,
                        createdAt: { $gt: dayjs().subtract(1, 'month') }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalearnings: { $sum: { $add: ["$viewerAmount", "$creatorAmount"] } },
                        creatortotalearnings: { $sum: "$creatorAmount" },
                        viewerstotalearnings: { $sum: "$viewerAmount" },
                    }
                }
            ])
            return res.status(200).json({ status: true, data: {
                totalvideoviews: 10,
                totaltimewatched: 500000,
                totalearnings: 2000,
                totalearningsgroupedbydate
            } });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving creator analytics.',
            });
        }
    },
    getVideoAnalytics: async (req, res) => {
        // total views, total hours watched, total earnings
        // views over period, grouped by day/week
        const { id } = req.params;
        try {
            let video = await Video.findById(id);
            if (!video)
                return res.status(404).json({ status: false, message: `Could not find video of ID ${id}` });
            // total views (distinct users)
            let totalvideoviews = await ViewHistory.find({ video: video.id }).count();
            let totalviewers = await ViewHistory.aggregate([
                { $match: { video: video._id } },
                {
                    $group: {
                        _id: "$viewer",
                        totalviewers: { $sum: 1 }
                    }
                }
            ]);
            console.log(totalviewers)
            // total hours watched
            /* 
                - https://stackoverflow.com/questions/39588588/mongoose-sum-a-value-across-all-documents
                - https://gist.github.com/arahmanali/ee7e4a82938212b2a512460e64f29d86
            */
            let totaltimewatched = await ViewHistory.aggregate([
                { $match: { video: video._id } },
                {
                    $group: {
                        _id: null,
                        totaltimewatched: { $sum: "$watchDuration" },
                    }
                }
            ]);
            // total earnings
            let totalearnings = await Earning.aggregate([
                { $match: { video: video._id } },
                {
                    $group: {
                        _id: null,
                        totalearnings: { $sum: { $add: ["$viewerAmount", "$creatorAmount"] } },
                        creatortotalearnings: { $sum: "$creatorAmount" },
                        viewerstotalearnings: { $sum: "$viewerAmount" },
                    }
                }
            ])
            // earnings grouped by week for the last 1 month
            /* 
                - https://stackoverflow.com/questions/34610096/how-to-group-by-documents-by-week-in-mongodb
                - https://www.statology.org/mongodb-group-by-date/
                - https://kb.objectrocket.com/mongo-db/how-to-use-mongoose-to-group-by-date-1210
            */
            let totalearningsgroupedbydate = await Earning.aggregate([
                { 
                    $match: { 
                        video: video._id,
                        createdAt: { $gt: dayjs().subtract(1, 'month') }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalearnings: { $sum: { $add: ["$viewerAmount", "$creatorAmount"] } },
                        creatortotalearnings: { $sum: "$creatorAmount" },
                        viewerstotalearnings: { $sum: "$viewerAmount" },
                    }
                }
            ])
            return res.status(200).json({ status: true, data: {
                totalvideoviews,
                totalviewers,
                totaltimewatched,
                totalearnings,
                totalearningsgroupedbydate
            } });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving video analytics.',
            });
        }
    },
    getAllVideoAnalytics: async (req, res) => {}
};