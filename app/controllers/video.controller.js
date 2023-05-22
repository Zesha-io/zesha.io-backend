const db = require("../models");
const { nanoid } = require('nanoid');
const { videoAnalyticsHelper, multipleVideosAnalyticsHelper } = require('./analytics.controller');

const Video = db.videos;
const User = db.users;
const CreatorChannel = db.creatorchannels;
const LikeDislikeHistory = db.likedislikehistories;


module.exports = {
    createVideo: async (req, res) => {
        const { title, description, videoUrl, videoThumbnail, videoLength, videoSize, publishStatus, creatorId, channelId, nftCollection } = req.body;
        try {
            const videoShortLink = nanoid(15);
            let video = new Video({
                title,
                description,
                videoUrl,
                videoThumbnail,
                videoLength,
                videoShortLink,
                videoSize,
                publishStatus,
                creator: creatorId,
                channel: channelId,
                nftCollection
            });
            video = await video.save(video);
            video = await Video.findById(video._id).populate({
                path: 'creator',
                model: User
            }).populate({
                path: 'channel',
                model: CreatorChannel
            });
            return res.json({ status: true, data: video });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while creating video.',
            });
        }
    },
    updateVideo: async (req, res) => {
        const { id } = req.params;
        const { title, description, publishStatus, videoThumbnail, nftCollection, creatorId } = req.body;
        try {
            let video = await Video.findOne({
                _id: id, creator: creatorId
            });
            if (!video)
                return res.status(404).json({ status: false, message: `Could not find video of ID ${id} and creator ID ${creatorId}` });
            video = await Video.findOneAndUpdate(
                {
                  _id: id
                },
                {
                    $set: {
                        title: title || undefined,
                        description: description || undefined,
                        videoThumbnail: videoThumbnail || undefined,
                        publishStatus: publishStatus || undefined,
                        nftCollection: nftCollection || undefined
                    }
                },
                {
                  new: true,
                }
            ).populate({
                path: 'creator',
                model: User
            }).populate({
                path: 'channel',
                model: CreatorChannel
            }).exec();
            return res.json({ status: true, data: video });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while updating video.',
            });
        }
    },
    getOneVideo: async (req, res) => {
        const { id } = req.params;
        try {
            let video = await Video.findById(id)
            .populate({
                path: 'creator',
                model: User
            }).populate({
                path: 'channel',
                model: CreatorChannel
            });
            if (!video)
                return res.status(404).json({ status: false, message: `Could not find video of ID ${id}` });
            let analytics = await videoAnalyticsHelper(video._id);
            video = video.toJSON();
            video.analytics = analytics;
            return res.json({ status: true, data: video });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving video.',
            });
        }
    },
    getCreatorVideos: async (req, res) => {
        const { id } = req.params;
        try {
            let videos = await Video.find({
                creator: id
            }).populate({
                path: 'creator',
                model: User
            }).populate({
                path: 'channel',
                model: CreatorChannel
            }).lean().exec();
            // Map the docs into an array of just the _ids
            const videoids = videos.map(function(doc) { return doc._id; });
            // const videoanalytics = await multipleVideosAnalyticsHelper(videoids);
            for (let video of videos) {
                video.analytics = await videoAnalyticsHelper(video._id);
            }
            return res.json({ status: true, data: videos });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving videos for creator.',
            });
        }
    },
    getAllVideos: async (req, res) => {
        try {
            let videos = await Video.find()
            .populate({
                path: 'creator',
                model: User
            }).populate({
                path: 'channel',
                model: CreatorChannel
            }).lean().exec();
            for (let video of videos) {
                video.analytics = await videoAnalyticsHelper(video._id);
            }
            return res.json({ status: true, data: videos });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving videos.',
            });
        }
    },
    likeDislikeVideo: async (req, res) => {
        const { id } = req.params;
        const { actionType, viewerId } = req.body;
        try {
            if (actionType === "LIKE" || actionType === "DISLIKE") {
                let video = await Video.findById(id)
                    .populate({
                        path: 'creator',
                        model: User
                    }).populate({
                        path: 'channel',
                        model: CreatorChannel
                    }).exec();
                if (!video)
                    return res.status(404).json({ status: false, message: `Could not find video of ID ${id}` });
                let viewer = await User.findById(viewerId);
                if (!viewer)
                    return res.status(404).json({ status: false, message: `Could not find viewer of ID ${viewerId}` });
                let action = await LikeDislikeHistory.findOneAndUpdate(
                    {
                        video: video.id,
                        viewer: viewerId
                    },
                    {
                        $set: {
                            actionType,
                            viewer: viewerId,
                            creator: video.creator.id,
                            channel: video.channel.id,
                            video: video.id
                        }
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                );
                return res.json({ status: true, data: action });
            } else {
                return res.status(403).json({ status: false, message: 'Invalid action. Use either LIKE or DISLIKE' })
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while liking or disliking video.',
            });
        }   
    },
    getRecommendedVideos: async (req, res) => {
        try {
            let videos = await Video.aggregate([{ $sample: { size: 10 } }])
            for (let video of videos) {
                video.creator = await User.findById(video.creator);
                video.channel = await CreatorChannel.findById(video.channel);
                video.analytics = await videoAnalyticsHelper(video._id);
            }
            return res.json({ status: true, data: videos });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving recommended videos.',
            });
        }
    },
    deleteVideo: async (req, res) => {}
};