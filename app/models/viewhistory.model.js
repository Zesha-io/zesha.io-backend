module.exports = (mongoose) => {
    const schema = mongoose.Schema(
      {
        watchedAt: {
          type: Date,
        },
        watchDuration: {
          type: Number,
        },
        exitedAt: {
          type: Date,
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
  
    const ViewHistory = mongoose.model('viewhistory', schema);
    return ViewHistory;
  };
  