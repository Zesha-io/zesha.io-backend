const db = require("../models");
const fetch = require("node-fetch-commonjs");
const { ethers } = require("ethers");

const ViewHistory = db.viewhistories;
const Video = db.videos;
const Earning = db.earnings;
const Wallet = db.wallets;
const User = db.users;

module.exports = {
    createEarning: async (req, res) => {
        const { adId, viewId } = req.body;
        // base currency - THETA
        const VIEWER_AMOUNT = 0.1;
        const CREATOR_AMOUNT = 0.25;
        try {
            let videoview = await ViewHistory.findById(viewId).populate({
                path: "viewer",
                model: User,
            });
            if (!videoview)
                return res.status(404).json({
                    status: false,
                    message: `Could not find view of ID ${viewId}`,
                });
            // don't create earning entry if viewer is a creator (any creator at all)
            if (videoview.viewer.userType === "CREATOR") {
                return res.status(200).json({
                    status: false,
                    data: null,
                    message: `Viewer is a creator`,
                });
            }
            // make sure the person hasn't earned on that specific video
            let pastearning = await Earning.findOne({
                viewer: videoview.viewer,
                video: videoview.video,
            }).exec();
            if (pastearning)
                return res.status(200).json({
                    status: false,
                    data: null,
                    message: `Viewer has earned before on this video`,
                });
            // create earning entry
            let price = 0;
            let tfuelusdprice = await fetch(
                `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=TFUEL&tsyms=USD`
            );
            tfuelusdprice = await tfuelusdprice.json();
            price = tfuelusdprice.RAW.TFUEL.USD.PRICE;
            let newearning = new Earning({
                adId,
                viewerAmount: VIEWER_AMOUNT,
                viewerAmountUSD: VIEWER_AMOUNT * price,
                creatorAmount: CREATOR_AMOUNT,
                creatorAmountUSD: CREATOR_AMOUNT * price,
                video: videoview.video,
                view: viewId,
                viewer: videoview.viewer,
                creator: videoview.creator,
            });

            let viewerWallet = await Wallet.findOne({
                user: videoview.viewer._id,
            });
            let creatorWallet = await Wallet.findOne({
                user: videoview.creator._id,
            });

            console.log("viewerWallet", viewerWallet.walletAddress);
            console.log("creatorWallet", creatorWallet.walletAddress);

            newearning = await newearning.save(newearning);
            if (newearning) {
                // DISCARD - add to creator and viewer's wallet balance
                await Promise.all([
                    // Wallet.findOneAndUpdate({ user: videoview.viewer }, { $inc : {'walletBalance' : VIEWER_AMOUNT} }).exec(),
                    // Wallet.findOneAndUpdate({ user: videoview.creator }, { $inc : {'walletBalance' : CREATOR_AMOUNT} }).exec()
                ]);

                const p = new ethers.providers.JsonRpcProvider(
                    "https://eth-rpc-api-testnet.thetatoken.org/rpc"
                );

                let signer = new ethers.Wallet(
                    process.env.PAYER_PRIVATE_KEY,
                    p
                );
                const tx = await signer.sendTransaction({
                    to: viewerWallet.walletAddress,
                    value: ethers.utils.parseEther("0.1"),
                });
                const receipt = await tx.wait();

                const tx2 = await signer.sendTransaction({
                    to: creatorWallet.walletAddress,
                    value: ethers.utils.parseEther("0.25"),
                });
                const receipt2 = await tx2.wait();

                newearning.blockchainTrxViewer = receipt.transactionHash;
                newearning.blockchainTrxCreator = receipt2.transactionHash;

                /* TODO: add TFUEL to Wallet - real payment. add blockchainTrxCreator & blockchainTrxViewer to entry */
                newearning = await newearning.save();
            }
            return res.status(200).json({ status: true, data: newearning });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message:
                    error.message || "Error occured while creating earning.",
            });
        }
    },
    getEarningHistory: async (req, res) => {
        const { id } = req.params;
        try {
            let user = await User.findById(id);
            if (!user)
                return res.status(404).json({
                    status: false,
                    message: `Cannot find user of ID: ${id}`,
                });

            let userearnings = [];
            if (user.userType === "CREATOR") {
                userearnings = await Earning.find({ creator: user._id })
                    .select([
                        "-viewerAmount",
                        "-viewerAmountUSD",
                        "-blockchainTrxViewer",
                        "-viewer",
                    ])
                    .populate({
                        path: "creator",
                        model: User,
                    })
                    .populate({
                        path: "video",
                        model: Video,
                    });
            } else {
                userearnings = await Earning.find({ viewer: user._id })
                    .select([
                        "-creatorAmount",
                        "-creatorAmountUSD",
                        "-blockchainTrxCreator",
                        "-creator",
                    ])
                    .populate({
                        path: "viewer",
                        model: User,
                    })
                    .populate({
                        path: "video",
                        model: Video,
                    });
            }
            return res.json({ status: true, data: userearnings });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message:
                    error.message || "Error occured while retrieving earnings.",
            });
        }
    },
};
