module.exports = (mongoose) => {
    const schema = mongoose.Schema(
      {
        amount: {
          type: Number,
          required: true,
        },
        payoutMethod: {
          type: String,
          enum: ['GIFT_CARD', 'CHARITY', 'WALLET'],
        },
        payoutMethodMetadata: {
          type: Mixed
        },
        zeshaFee: {
          type: Number,
          // should it be percentage or total amount
        },
        payoutStatus: {
          type: String,
          enum: ['PENDING', 'COMPLETE', 'FAILED'],
        },
        payoutInitiatedAt: {
          type: Date,
        },
        payoutCompletedAt: {
          type: Date,
        },
        blockchainTrx: {
          type: String,
          required: true
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        wallet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Wallet',
          required: true,
        },
        destinationWallet: {
          type: String,
        },
      },
      { timestamps: true }
    );
  
    schema.method('toJSON', function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Payout = mongoose.model('payout', schema);
    return Payout;
  };
  