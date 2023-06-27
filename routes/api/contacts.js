const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/contacts");

const {
  validateCreateBody,
  isValidId,
  validatePatchBody,
  authenticate,
} = require("../../middlewares");

const { schemas } = require("../../models/contact");

router.get("/", authenticate, ctrl.getAllContacts);

router.get("/:id", authenticate, isValidId, ctrl.getContactsById);

router.post(
  "/",
  authenticate,
  validateCreateBody(schemas.addSchema),
  ctrl.createContact
);

router.delete("/:id", authenticate, isValidId, ctrl.deleteContact);

router.put("/:id", authenticate, isValidId, ctrl.changeContactById);

router.patch(
  "/:id/favorite",
  isValidId,
  validatePatchBody(schemas.upDateFavoriteSchema),
  ctrl.upDateFavorite
);

module.exports = router;

// NsIjAOnMmoCVEP0T
