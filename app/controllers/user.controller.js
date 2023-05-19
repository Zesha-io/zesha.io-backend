const db = require("../models");

const User = db.users;
const Wallet = db.wallets;
const CreatorChannel = db.creatorchannels;

module.exports = {
    createUser: async (req, res) => {
        try {
            const { name, email, phone, profileAvatar, userType, walletAddress } = req.body;
            const usercheck = await User.findOne({ email });
            if (usercheck)
                return res.status(403).json({ status: false, message: 'Email already exists' });

            let user = new User({
                name,
                email,
                phone,
                profileAvatar,
                userType,
            });
            // Save user in the database
            user = await user.save(user);
            user = user.toJSON();
            // then create user's wallet and save in the database
            let wallet = new Wallet({
                walletAddress,
                user: user._id
            });
            wallet = await wallet.save(wallet);
            user.wallet = wallet;
            // if userType == creator, automatically create channel with the user's details
            if (userType === 'CREATOR') {
                let creatorchannel = new CreatorChannel({
                    name: user.name,
                    description: `${user.name}'s channel on Zesha`,
                    channelAvatar: user.profileAvatar,
                    creator: user._id,
                });
                creatorchannel = await creatorchannel.save(creatorchannel);
                user.creatorchannel = creatorchannel;
            }
            return res.json({
                status: true,
                data: user,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || `There was an error creating this user`,
            });
        }
    },
    updateUserProfile: async (req, res) => {
        const { id } = req.params;
        const { name, phone, userInterests, userViewMode, userFrequency, channelName, channelDescription, channelLogo } = req.body;
        
        try {
            let user = await User.findOneAndUpdate(
                {
                  _id: id
                },
                {
                  name,
                  phone,
                  userInterests,
                  userViewMode,
                  userFrequency
                },
                {
                  new: true,
                }
            ).exec();
            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: 'User does not exist',
                });
            }
            user = user.toJSON();
            // get wallet
            let wallet = await Wallet.findOne({
                user: user._id
            });
            user.wallet = wallet;

            // update channel details if within request
            if (channelName && channelDescription && channelLogo) {
                let creatorchannel = await CreatorChannel.findOneAndUpdate(
                    {
                        creator: user._id
                    },
                    {
                        name: channelName,
                        description: channelDescription,
                        channelAvatar: channelLogo
                    },
                    {
                        new: true
                    }
                ).exec();
                user.creatorchannel = creatorchannel;
            }
            return res.json({
                status: true,
                data: user,
            });
        } catch (error) {
            return res.status(500).json({
                message:
                    error.message || `Some error occurred while saving user's profile.`,
            });
        }
    },
    getUser: async (req, res) => {
        const { by, email, id } = req.query;
        let user;
        try {
            if (by === 'email') {
                user = await User.findOne({ email }).exec();
            } else if (by === 'id') {
                user = await User.findById(id).exec();
            } else {
                return res.status(403).json({ status: false, message: 'No parameters sent for getting user' });
            }
            if (!user) {
                return res.json({ status: false, message: 'User does not exist' });
            }
            user = user.toJSON();
            // get wallet
            let wallet = await Wallet.findOne({
                user: user._id
            });
            user.wallet = wallet;
            // get creator channel if user is creator
            if (user.userType === 'CREATOR') {
                let creatorchannel = await CreatorChannel.findOne({
                    creator: user._id
                });
                if (!creatorchannel) {
                    return res.json({ status: false, message: 'Cannot find user creator channel' });
                }
                user.creatorchannel = creatorchannel;
            }
            return res.json({ status: true, data: user });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving user details.',
            });
        }
    },
};