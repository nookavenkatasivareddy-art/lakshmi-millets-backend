/**
 * Shared plugin applied to every schema (and sub-schema).
 * Makes every Mongoose document serialize the same way the old
 * db.json objects did: an `id` string field, no `_id` / `__v`.
 * This means the Angular frontend (which expects `product.id`,
 * `user.id`, etc.) needs ZERO changes.
 */
function toJSONPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  });
}

module.exports = toJSONPlugin;
