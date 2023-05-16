module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Please provide a name for this tag.'],
        maxlength: [20, 'Name cannot be more than 20 characters'],
      },
      icon: {
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

  schema.virtual('tagdisplayname').get(function () {
    return this.name.toLowerCase();
  });

  const Tag = mongoose.model('tag', schema);
  return Tag;
};
