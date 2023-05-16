module.exports = (mongoose) => {
    const schema = mongoose.Schema(
      {
        deviceId: {
          type: String,
          required: true,
        },
        installDate: {
          type: Date,
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
  
    const UserExtension = mongoose.model('userextension', schema);
    return UserExtension;
  };
  