module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      adId: {
        type: String,
        required: true,
      },
      creatorAmount: {
        type: Number,
      },
      creatorAmountUSD: {
        type: Number,
      },
      viewerAmount: {
        type: Number,
      },
      viewerAmountUSD: {
        type: Number,
      },
      zeshaFee: {
        type: Number,
        // should it be percentage or total amount
      },
      blockchainTrxCreator: {
        type: String,
      },
      blockchainTrxViewer: {
        type: String,
      },
      view: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ViewHistory'
      },
      video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
      },
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      viewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      extension: {
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
