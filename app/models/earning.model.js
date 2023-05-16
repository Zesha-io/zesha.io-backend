module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      adId: {
        type: Number,
        required: true,
      },
      creatorAmount: {
        type: Number,
      },
      viewerAmount: {
        type: Number,
      },
      blockchainTrx: {
        type: String,
      },
      zeshaFee: {
        type: Number,
        // should it be percentage or total amount
      },
      watchLength: {
        type: Number
      },
      videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
      },
      creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
      },
      extensionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserExtension'
      }
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Earning = mongoose.model('earning', schema);
  return Earning;
};
