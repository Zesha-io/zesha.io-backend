/* TODO: LikedBy&video combined must be unique index */

module.exports = (mongoose) => {
    const schema = mongoose.Schema(
      {
        actionType: {
          type: String,
          enum: ['LIKE', 'DISLIKE'],
          required: true,
        },
        actionDate: {
          type: Date
        },
        viewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        creator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        channel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CreatorChannel',
          required: true,
        },
        video: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Video',
          required: true,
        },
      },
      { timestamps: true }
    );
  
    schema.method('toJSON', function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const LikeDislikeHistory = mongoose.model('likedislikehistory', schema);
    return LikeDislikeHistory;
  };
  