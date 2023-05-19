const { isEmail } = require('validator');

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: {
        type: String,
        // required: [true, 'Collector name is required.'],
      },
      email: {
        type: String,
        required: [true, 'Email Address is required for user.'],
        validate: [isEmail, 'Invalid email'],
        unique: true,
      },
      phone: String,
      verifiedAt: Date,
      profileAvatar: String,
      userType: {
        type: String,
        enum: ['VIEWER', 'CREATOR'],
        required: [true, 'User type is required']
      },
      userInterests: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interest'
        }],
        required: true,
      },
      userViewMode: {
        type: String,
        enum: ['OVERLAY_MODE', 'FULL_MODE'],
        default: 'OVERLAY_MODE',
      },
      userFrequency: {
        type: String,
        enum: ['LESS', 'BALANCED', 'MORE'],
        default: 'MORE',
      }
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model('user', schema);
  return User;
};
