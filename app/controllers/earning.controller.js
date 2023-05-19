const db = require("../models");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const Earning = db.earnings;

module.exports = {
    createEarning: async (req, res) => {
        const {adId, videoId, creatorId, viewerId, viewId, extensionId, blockchainTrx } = req.body;
        // base currency - THETA
        const VIEWER_AMOUNT = 0.1;
        const CREATOR_AMOUNT = 0.25;
        try {
            let videoview = await ViewHistory.findById(viewId).populate({
                path: 'video',
                model: Video
            });
            if (!videoview)
                return res.status(404).json({ status: false, message: `Could not find view of ID ${viewId}` });
            // make sure the person hasn't earned on that specific video
            let pastearning = await Earning.findOne({
                viewer: viewerId,
                video: videoId
            }).exec();
            if (pastearning)
                return;
            // create earning entry
            let newearning = new Earning({
                adId,
                viewerAmount: VIEWER_AMOUNT,
                creatorAmount: CREATOR_AMOUNT,
                video: videoId,
                view: videoId,
                creator: creatorId,
                viewer: viewerId,
                extension: extensionId,
                blockchainTrx
            });
            newearning = await newearning.save(newearning);
            if (newearning) {
                // add to creator and viewer's wallet balance
                await Promise.all([
                    Wallet.findOneAndUpdate({ user: viewerId }, { $inc : {'walletBalance' : VIEWER_AMOUNT} }).exec(),
                    Wallet.findOneAndUpdate({ user: creatorId }, { $inc : {'walletBalance' : CREATOR_AMOUNT} }).exec()
                ]);
            }
            return res.status(200).json({ status: true, data: newearning });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while creating earning.',
            });
        }
    }
};