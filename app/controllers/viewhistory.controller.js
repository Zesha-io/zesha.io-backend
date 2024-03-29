const db = require("../models");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const User = db.users;
const CreatorChannel = db.creatorchannels;

module.exports = {
    createVideoView: async (req, res) => {
        const { id } = req.params;
        const { watchedAt, watchDuration, exitedAt, viewerId } = req.body;
        try {
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
            // if creator is viewing
            if (viewerId === video.creator.id) {
                return res.json({ status: false, data: false })
            }
            
            let viewhistory = new ViewHistory({
                watchedAt,
                watchDuration,
                exitedAt,
                viewer: viewerId,
                creator: video.creator.id,
                channel: video.channel.id,
                video: id
            });
            viewhistory = await viewhistory.save();
            return res.json({ status: true, data: viewhistory })
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while creating video view.',
            });
        }
    }
};