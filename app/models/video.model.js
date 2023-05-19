module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'Video title is required.'],
      },
      description: {
        type: String,
        required: [true, 'Description is required for video'],
      },
      videoUrl: {
        type: String,
        required: [true, 'URL is required for video'],
      },
      publishStatus: {
        type: String,
        enum: ['PUBLISHED', 'UNPUBLISHED'],
        required: [true, 'Status is required for video'],
      },
      videoThumbnail: {
        type: String,
        required: [true, 'Thumbnail is required for video'],
      },
      videoLength: {
        type: String,
      },
      videoShortLink: {
        type: String,
        required: [true, 'Short URL is required for video'],
      },
      forKids: {
        type: Boolean,
        default: false
      },
      nftCollection: {
        type: String
      },
      tags: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tag'
        }
      ],
      lastEditedAt: {
        type: Date,
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
    },
    { timestamps: true }
  );

  schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Video = mongoose.model('video', schema);
  return Video;
};
