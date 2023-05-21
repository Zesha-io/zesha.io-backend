const db = require("../models");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const Earning = db.earnings;
const Wallet = db.wallets;

module.exports = {
    createEarning: async (req, res) => {
        const {adId, viewId, extensionId, blockchainTrx } = req.body;
        // base currency - THETA
        const VIEWER_AMOUNT = 0.1;
        const CREATOR_AMOUNT = 0.25;
        try {
            let videoview = await ViewHistory.findById(viewId);
            if (!videoview)
                return res.status(404).json({ status: false, message: `Could not find view of ID ${viewId}` });
            // make sure the person hasn't earned on that specific video
            let pastearning = await Earning.findOne({
                viewer: videoview.viewer,
                video: videoview.video
            }).exec();
            if (pastearning)
                return res.status(200).json({ status: true, data: null });
            // create earning entry
            let newearning = new Earning({
                adId,
                viewerAmount: VIEWER_AMOUNT,
                creatorAmount: CREATOR_AMOUNT,
                video: videoview.video,
                view: viewId,
                viewer: videoview.viewer,
                creator: videoview.creator,
                extension: extensionId,
                blockchainTrx
            });
            newearning = await newearning.save(newearning);
            if (newearning) {
                // add to creator and viewer's wallet balance
                await Promise.all([
                    Wallet.findOneAndUpdate({ user: videoview.viewer }, { $inc : {'walletBalance' : VIEWER_AMOUNT} }).exec(),
                    Wallet.findOneAndUpdate({ user: videoview.creator }, { $inc : {'walletBalance' : CREATOR_AMOUNT} }).exec()
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