const { HttpError } = require("../helpers");

const validateCreateBody = (schema) => {
  const func = (req, res, next) => {
    const requiredFields = ["name", "number"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length) {
      next(
        HttpError(400, `missing required ${missingFields.join(", ")} field`)
      );
    }
    const { error } = schema.validate(req.body);
    if (error) {
      next(HttpError(400, error.message));
    }
    next();
  };
  return func;
};
module.exports = validateCreateBody;
