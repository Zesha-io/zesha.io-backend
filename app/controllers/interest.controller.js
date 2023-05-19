const db = require("../models");

const Interest = db.interests;

module.exports = {
    getInterests: async (req, res) => {
        try {
            let interests = await Interest.find();
            return res.json({ status: true, data: interests });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message || 'Error occured while retrieving interests.',
            });
        }
    }
};