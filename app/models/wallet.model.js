module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      walletAddress: {
        type: String,
        required: true,
      },
      walletBalance: {
        type: Number,
        default: 0,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

  const Wallet = mongoose.model('wallet', schema);
  return Wallet;
};
