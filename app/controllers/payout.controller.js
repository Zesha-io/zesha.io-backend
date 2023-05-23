const db = require("../models");

const Video = db.videos;
const Wallet = db.wallets;
const User = db.users;
const Payout = db.payouts;

module.exports = {
    createPayout: async (req, res) => {
        const { amount, amountUSD, payoutMethod, zeshaFee, blockchainTrx, userId, walletAddress, destinationWallet } = req.body;
        try {
            // get wallet by address
            const wallet = await Wallet.findOne({
                walletAddress
            }).populate({
                path: 'user',
                model: User
            });
            if (!wallet)
                return res.status(404).json({ status: false, message: 'Wallet address not found' });
            if (userId !== wallet.user.id)
                return res.status(403).json({ status: false, message: 'User making request does not match wallet user ID' });
            // create payout entry - checks already done on blockchain to ensure wallet balance is sufficient
            let payout = new Payout({
                amount,
                amountUSD,
                payoutMethod,
                zeshaFee,
                user: wallet.user._id,
                wallet: wallet._id,
                destinationWallet,
                blockchainTrx
            });
            payout = await payout.save();
            return res.status(200).json({ status: true, data: payout });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while creating payout.',
            });
        }
    },
    getPayoutHistory: async (req, res) => {
        const { id } = req.params;
        try {
            let user = await User.findById(id);
            if (!user)
                return res.status(404).json({ status: false, message: `Cannot find user of ID: ${id}` });
            
            let userpayouts =  await Payout.find({ user: user._id })
                .populate({
                    path: 'user',
                    model: User
                }).populate({
                    path: 'wallet',
                    model: Wallet
                });
            return res.json({ status: true, data: userpayouts });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving payouts.',
            });
        }
    },
};