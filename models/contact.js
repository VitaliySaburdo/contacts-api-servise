const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

// Mongoose shemas
const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false }
);

contactSchema.post("save", handleMongooseError);

const Contact = model("contact", contactSchema);

// Joi schemas
const addSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});
const changeSchema = Joi.object({
  name: Joi.string(),
  phone: Joi.string(),
});

const upDateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const schemas = {
  addSchema: addSchema,
  changeSchema: changeSchema,
  upDateFavoriteSchema,
};

module.exports = { Contact, schemas };
