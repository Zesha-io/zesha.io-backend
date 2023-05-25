const dayjs = require("dayjs");
const db = require("../models");
const { ethers } = require("ethers");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const Earning = db.earnings;
const User = db.users;
const Wallet = db.wallets;
const LikeDislikeHistory = db.likedislikehistories;

// this is for use in other endpoints
const videoAnalyticsHelper = async (videoId) => {
    try {
        // total views
        let totalvideoviews = await ViewHistory.find({
            video: videoId,
        }).count();
        //  (distinct viewers)
        let totalviewers = await ViewHistory.distinct("viewer", {
            video: videoId,
        });
        totalviewers = totalviewers.length ? totalviewers.length : 0;

        // another method, but this one also returns the count for each viewer
        /* await ViewHistory.aggregate([
            { $match: { video: video._id } },
            {
                $group: {
                    _id: "$viewer",
                    count: { $sum: 1 }
                }
            }
        ]); */

        // total hours watched
        let totaltimewatched = await ViewHistory.aggregate([
            { $match: { video: videoId } },
            {
                $group: {
                    _id: null,
                    sum: { $sum: "$watchDuration" },
                },
            },
        ]);
        totaltimewatched = totaltimewatched.length
            ? totaltimewatched[0].sum
            : 0;
        let totallikes = await LikeDislikeHistory.aggregate([
            { $match: { video: videoId, actionType: "LIKE" } },
            {
                $group: {
                    _id: "$actionType",
                    count: { $sum: 1 },
                },
            },
        ]);
        totallikes = totallikes.length ? totallikes[0].count : 0;
        let totaldislikes = await LikeDislikeHistory.aggregate([
            { $match: { video: videoId, actionType: "DISLIKE" } },
            {
                $group: {
                    _id: "$actionType",
                    count: { $sum: 1 },
                },
            },
        ]);
        totaldislikes = totaldislikes.length ? totaldislikes[0].count : 0;
        // total earnings
        let totalearnings = await Earning.aggregate([
            { $match: { video: videoId } },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: { $add: ["$viewerAmount", "$creatorAmount"] },
                    },
                    creator: { $sum: "$creatorAmount" },
                    viewers: { $sum: "$viewerAmount" },
                },
            },
        ]);
        let creatorearnings = totalearnings.length
            ? totalearnings[0].creator
            : 0;
        let viewersearnings = totalearnings.length
            ? totalearnings[0].viewers
            : 0;
        let creatorandviewersearnings = totalearnings.length
            ? totalearnings[0].total
            : 0;
        let viewsgroupedbydate = await ViewHistory.aggregate([
            {
                $match: {
                    video: videoId,
                    createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    count: { $count: {} },
                },
            },
        ]);
        viewsgroupedbydate = viewsgroupedbydate.length
            ? viewsgroupedbydate.map(Object.values)
            : [];
        let timewatchedgroupedbydate = await ViewHistory.aggregate([
            {
                $match: {
                    video: videoId,
                    createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    sum: { $sum: "$watchDuration" },
                },
            },
        ]);
        timewatchedgroupedbydate = timewatchedgroupedbydate.length
            ? timewatchedgroupedbydate.map(Object.values)
            : [];
        let likesgroupedbydate = await LikeDislikeHistory.aggregate([
            {
                $match: {
                    video: videoId,
                    actionType: "LIKE",
                    createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    sum: { $count: {} },
                },
            },
        ]);
        likesgroupedbydate = likesgroupedbydate.length
            ? likesgroupedbydate.map(Object.values)
            : [];
        let dislikesgroupedbydate = await LikeDislikeHistory.aggregate([
            {
                $match: {
                    video: videoId,
                    actionType: "DISLIKE",
                    createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    sum: { $count: {} },
                },
            },
        ]);
        dislikesgroupedbydate = dislikesgroupedbydate.length
            ? dislikesgroupedbydate.map(Object.values)
            : [];
        // earnings grouped by week for the last 1 month
        let creatorearningsgroupedbydate = await Earning.aggregate([
            {
                $match: {
                    video: videoId,
                    createdAt: { $gt: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    creatortotalearnings: { $sum: "$creatorAmount" },
                },
            },
        ]);
        creatorearningsgroupedbydate = creatorearningsgroupedbydate.length
            ? creatorearningsgroupedbydate.map(Object.values)
            : [];
        let viewersearningsgroupedbydate = await Earning.aggregate([
            {
                $match: {
                    video: videoId,
                    createdAt: { $gt: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    viewerstotalearnings: { $sum: "$viewerAmount" },
                },
            },
        ]);
        viewersearningsgroupedbydate = viewersearningsgroupedbydate.length
            ? viewersearningsgroupedbydate.map(Object.values)
            : [];
        let creatorsandviewersearningsgroupedbydate = await Earning.aggregate([
            {
                $match: {
                    video: videoId,
                    createdAt: { $gt: dayjs().subtract(1, "month").toDate() },
                },
            },
            {
                $group: {
                    _id: { $toLong: "$createdAt" },
                    totalearnings: {
                        $sum: { $add: ["$viewerAmount", "$creatorAmount"] },
                    },
                },
            },
        ]);
        creatorsandviewersearningsgroupedbydate = creatorsandviewersearningsgroupedbydate.length
            ? creatorsandviewersearningsgroupedbydate.map(Object.values)
            : [];
        return {
            totalvideoviews,
            totalviewers,
            totaltimewatched,
            creatorearnings,
            viewersearnings,
            creatorandviewersearnings,
            totallikes,
            totaldislikes,
            viewsgroupedbydate,
            timewatchedgroupedbydate,
            likesgroupedbydate,
            dislikesgroupedbydate,
            creatorearningsgroupedbydate,
            viewersearningsgroupedbydate,
            creatorsandviewersearningsgroupedbydate
        };
    } catch (error) {
        throw new Error(
            error.message ||
                `There was an error retrieving this video's analytics`
        );
    }
};
// receives array of video IDs
const multipleVideosAnalyticsHelper = async (videoIds) => {
    try {
        //  (distinct viewers)
        // let totalviewers = await ViewHistory.distinct('viewer', { video: videoId })
        // totalviewers = totalviewers.length ? totalviewers.length : 0

        // another method, but this one also returns the count for each viewer
        const totalvideoviews = await ViewHistory.aggregate([
            { $match: { video: { $in: videoIds } } },
            {
                $group: {
                    _id: "$video",
                    count: { $sum: 1 },
                },
            },
        ]);

        // total hours watched
        let totaltimewatched = await ViewHistory.aggregate([
            { $match: { video: { $in: videoIds } } },
            {
                $group: {
                    _id: "$video",
                    sum: { $sum: "$watchDuration" },
                },
            },
        ]);

        // total earnings
        let totalearnings = await Earning.aggregate([
            { $match: { video: { $in: videoIds } } },
            {
                $group: {
                    _id: "$video",
                    total: {
                        $sum: { $add: ["$viewerAmount", "$creatorAmount"] },
                    },
                    creator: { $sum: "$creatorAmount" },
                    viewers: { $sum: "$viewerAmount" },
                },
            },
        ]);
        /* totalvideoviews = videoIds.filter(function(id) {
            return !totalvideoviews.some(function(view) {
                return id === view._id;
            })
        }) */
        return {
            totalvideoviews,
            totaltimewatched,
            totalearnings,
        };
    } catch (error) {
        throw new Error(
            error.message ||
                `There was an error retrieving analytics for these videos`
        );
    }
};

const getWalletBalance = async (wallet) => {
    const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-rpc-api-testnet.thetatoken.org/rpc"
    );

    balance = await provider.getBalance(wallet?.walletAddress || "0x0");

    return Number(ethers.utils.formatEther(balance)).toFixed(2);
};

module.exports = {
    getUserAnalytics: async (req, res) => {
        // total views, total hours watched, total earnings
        // views over period, grouped by day/week
        const { id } = req.params;
        const { type } = req.query;
        try {
            if (type === "CREATOR") {
                let creator = await User.findOne({
                    _id: id,
                    userType: "CREATOR",
                });
                if (!creator)
                    return res.status(404).json({
                        status: false,
                        message: `Could not find creator of ID ${id}`,
                    });

                let wallet = await Wallet.findOne({
                    user: creator._id,
                });

                //Wallet Balance
                let walletbalance = await getWalletBalance(wallet);

                // total views
                let totalcreatorviews = await ViewHistory.find({
                    creator: creator._id,
                }).count();
                //  (distinct viewers)
                let totalcreatorviewers = await ViewHistory.distinct("viewer", {
                    creator: creator._id,
                });
                totalcreatorviewers = totalcreatorviewers.length
                    ? totalcreatorviewers.length
                    : 0;
                // total hours watched
                /* 
                    - https://stackoverflow.com/questions/39588588/mongoose-sum-a-value-across-all-documents
                    - https://gist.github.com/arahmanali/ee7e4a82938212b2a512460e64f29d86
                */
                let totaltimewatched = await ViewHistory.aggregate([
                    { $match: { creator: creator._id } },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$watchDuration" },
                        },
                    },
                ]);
                totaltimewatched = totaltimewatched.length
                    ? totaltimewatched[0].sum
                    : 0;
                // total earnings
                let totalearnings = await Earning.aggregate([
                    { $match: { creator: creator._id } },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$creatorAmount" },
                        },
                    },
                ]);
                let totalcreatorearnings = totalearnings.length
                    ? totalearnings[0].sum
                    : 0;
                let creatorviewsgroupedbydate = await ViewHistory.aggregate([
                    {
                        $match: {
                            creator: creator._id,
                            createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                        },
                    },
                    {
                        $group: {
                            _id: { $toLong: "$createdAt" },
                            count: { $count: {} },
                        },
                    },
                ]);
                creatorviewsgroupedbydate = creatorviewsgroupedbydate.length
                    ? creatorviewsgroupedbydate.map(Object.values)
                    : [];
                // time by date
                let creatortimewatchedgroupedbydate = await ViewHistory.aggregate([
                    {
                        $match: {
                            creator: creator._id,
                            createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                        },
                    },
                    {
                        $group: {
                            _id: { $toLong: "$createdAt" },
                            sum: { $sum: "$watchDuration" },
                        },
                    },
                ]);
                creatortimewatchedgroupedbydate = creatortimewatchedgroupedbydate.length
                    ? creatortimewatchedgroupedbydate.map(Object.values)
                    : [];
                // earnings grouped by week for the last 1 month
                /* 
                    - https://stackoverflow.com/questions/34610096/how-to-group-by-documents-by-week-in-mongodb
                    - https://www.statology.org/mongodb-group-by-date/
                    - https://kb.objectrocket.com/mongo-db/how-to-use-mongoose-to-group-by-date-1210
                */
                let creatorearningsgroupedbydate = await Earning.aggregate(
                    [
                        {
                            $match: {
                                creator: creator._id,
                                createdAt: {
                                    $gt: dayjs().subtract(1, "month").toDate(),
                                },
                            },
                        },
                        {
                            $group: {
                                _id: { $toLong: "$createdAt" },
                                earnings: { $sum: "$creatorAmount" },
                            },
                        },
                    ]
                );
                creatorearningsgroupedbydate = creatorearningsgroupedbydate.length
                    ? creatorearningsgroupedbydate.map(Object.values)
                    : [];
                return res.status(200).json({
                    status: true,
                    data: {
                        totalcreatorviews,
                        totalcreatorviewers,
                        totaltimewatched,
                        totalcreatorearnings,
                        creatorviewsgroupedbydate,
                        creatortimewatchedgroupedbydate,
                        creatorearningsgroupedbydate,
                        walletbalance: Number(walletbalance),
                    },
                });
            } else if (type === "VIEWER") {
                let viewer = await User.findOne({
                    _id: id,
                    userType: "VIEWER",
                });
                if (!viewer)
                    return res.status(404).json({
                        status: false,
                        message: `Could not find viewer of ID ${id}`,
                    });
                // total views
                let totalviewerviews = await ViewHistory.find({
                    viewer: viewer._id,
                }).count();
                // total hours watched
                /* 
                    - https://stackoverflow.com/questions/39588588/mongoose-sum-a-value-across-all-documents
                    - https://gist.github.com/arahmanali/ee7e4a82938212b2a512460e64f29d86
                */
                let totaltimewatched = await ViewHistory.aggregate([
                    { $match: { viewer: viewer._id } },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$watchDuration" },
                        },
                    },
                ]);
                totaltimewatched = totaltimewatched.length
                    ? totaltimewatched[0].sum
                    : 0;
                // total earnings
                let totalearnings = await Earning.aggregate([
                    { $match: { viewer: viewer._id } },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$viewerAmount" },
                        },
                    },
                ]);
                let totalviewerearnings = totalearnings.length
                    ? totalearnings[0].sum
                    : 0;

                let wallet = await Wallet.findOne({
                    user: viewer._id,
                });

                //Wallet Balance
                let walletbalance = await getWalletBalance(wallet);

                let viewerviewsgroupedbydate = await ViewHistory.aggregate([
                    {
                        $match: {
                            viewer: viewer._id,
                            createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                        },
                    },
                    {
                        $group: {
                            _id: { $toLong: "$createdAt" },
                            count: { $count: {} },
                        },
                    },
                ]);
                viewerviewsgroupedbydate = viewerviewsgroupedbydate.length
                    ? viewerviewsgroupedbydate.map(Object.values)
                    : [];
                // time by date
                let viewertimewatchedgroupedbydate = await ViewHistory.aggregate([
                    {
                        $match: {
                            viewer: viewer._id,
                            createdAt: { $gte: dayjs().subtract(1, "month").toDate() },
                        },
                    },
                    {
                        $group: {
                            _id: { $toLong: "$createdAt" },
                            sum: { $sum: "$watchDuration" },
                        },
                    },
                ]);
                viewertimewatchedgroupedbydate = viewertimewatchedgroupedbydate.length
                    ? viewertimewatchedgroupedbydate.map(Object.values)
                    : [];

                // earnings grouped by week for the last 1 month
                /* 
                    - https://stackoverflow.com/questions/34610096/how-to-group-by-documents-by-week-in-mongodb
                    - https://www.statology.org/mongodb-group-by-date/
                    - https://kb.objectrocket.com/mongo-db/how-to-use-mongoose-to-group-by-date-1210
                */
                let viewerearningsgroupedbydate = await Earning.aggregate([
                    {
                        $match: {
                            viewer: viewer._id,
                            createdAt: {
                                $gt: dayjs().subtract(1, "month").toDate(),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: { $toLong: "$createdAt" },
                            earnings: { $sum: "$viewerAmount" },
                        },
                    },
                ]);
                viewerearningsgroupedbydate = viewerearningsgroupedbydate.length
                    ? viewerearningsgroupedbydate.map(Object.values)
                    : [];
                return res.status(200).json({
                    status: true,
                    data: {
                        totalviewerviews,
                        totaltimewatched,
                        totalviewerearnings,
                        viewerviewsgroupedbydate,
                        viewertimewatchedgroupedbydate,
                        viewerearningsgroupedbydate,
                        walletbalance: Number(walletbalance),
                    },
                });
            } else {
                return res.status(403).json({
                    status: false,
                    message: "Invalid user type. Enter VIEWER or CREATOR",
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message:
                    error.message ||
                    "Error occured while retrieving user analytics.",
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
                return res.status(404).json({
                    status: false,
                    message: `Could not find video of ID ${id}`,
                });
            let analytics = await videoAnalyticsHelper(video._id);
            return res.status(200).json({ status: true, data: analytics });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message:
                    error.message ||
                    "Error occured while retrieving video analytics.",
            });
        }
    },
    videoAnalyticsHelper,
    multipleVideosAnalyticsHelper,
};
