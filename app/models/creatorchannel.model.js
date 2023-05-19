module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Channel name is required.'],
      },
      description: {
        type: String,
        required: [true, 'Description is required for creator channel'],
      },
      channelAvatar: String,
      creator: {
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

  const CreatorChannel = mongoose.model('creatorchannel', schema);
  return CreatorChannel;
};
