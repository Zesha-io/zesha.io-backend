const db = require("../models");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const User = db.users;
const CreatorChannel = db.creatorchannels;

module.exports = {
    createVideoView: async () => {
        const { id } = req.params;
        const { watchedAt, watchDuration, exitedAt, viewerId } = req.body;
        try {
            let video = await Video.findById(id);
            if (!video)
                return res.status(404).json({ status: false, message: `Could not find video of ID ${id}` });
            // if creator is viewing
            if (viewerId === video.creator) {
                return;
            }
            let viewhistory = new ViewHistory({
                watchedAt,
                watchDuration,
                exitedAt,
                viewer: viewerId,
                creator: video.creator,
                channelId: video.channel,
            });
            viewhistory = await viewhistory.save();
            return res.json({ status: true, data: true })
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while creating video view.',
            });
        }
    }
};