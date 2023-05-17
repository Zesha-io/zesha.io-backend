const db = require("../models");
const { nanoid } = require('nanoid');

const Video = db.videos;
const User = db.users;
const CreatorChannel = db.creatorchannels;


module.exports = {
    createVideo: async (req, res) => {
        const { title, description, videoUrl, videoThumbnail, videoLength, creatorId, channelId } = req.body;
        try {
            const videoShortLink = nanoid(15);
            let video = new Video({
                title,
                description,
                videoUrl,
                videoThumbnail,
                videoLength,
                videoShortLink,
                creatorId,
                channelId
            });
            video = await video.save(video);
            video = await Video.findById(video._id).populate({
                path: 'creatorId',
                model: User
            }).populate({
                path: 'channelId',
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
        const { title, description, videoThumbnail, creatorId } = req.body;
        try {
            let video = await Video.findOne({
                _id: id, creatorId
            });
            if (!video)
                return res.status(404).json({ status: false, message: `Could not find video of ID ${id} and creator ID ${creatorId}` });
            video = await Video.findOneAndUpdate(
                {
                  _id: id
                },
                {
                  title,
                  description,
                  videoThumbnail,
                },
                {
                  new: true,
                }
            ).exec();
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
                path: 'creatorId',
                model: User
            }).populate({
                path: 'channelId',
                model: CreatorChannel
            });
            if (!video)
                return res.status(404).json({ status: false, message: `Could not find video of ID ${id}` });
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
                creatorId: id
            }).populate({
                path: 'creatorId',
                model: User
            }).populate({
                path: 'channelId',
                model: CreatorChannel
            });
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
                path: 'creatorId',
                model: User
            }).populate({
                path: 'channelId',
                model: CreatorChannel
            });
            return res.json({ status: true, data: videos });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving videos.',
            });
        }
    }
};