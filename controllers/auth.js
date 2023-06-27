const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");

const { User } = require("../models/users");

const { HttpError, ctrlWrapper, resize } = require("../helpers");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  const payload = {
    id: newUser._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(newUser._id, { token });

  res.status(201).json({
    message: "Account is successfully created",
    token: token,
    user: {
      name: newUser.name,
      email: newUser.email,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    message: "You are successfully login",
    token: token,
    user: { name: user.name, email: user.email },
  });
};

// Пример обновления токена при истечении
const refreshToken = async (req, res) => {
  const { token } = req.body;
  const decodedToken = jwt.verify(token, SECRET_KEY);
  const { id } = decodedToken;

  // Проверяем, истек ли токен или скоро истечет
  const user = await User.findById(id);
  if (!user) {
    throw HttpError(401, "User not found");
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (decodedToken.exp - currentTimestamp > 60) {
    // Токен еще не истек или не скоро истечет, возвращаем текущий токен
    return res.status(200).json({
      token: token,
    });
  }

  // Генерируем новый токен
  const payload = {
    id: user._id,
  };
  const newToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  // Обновляем токен в базе данных
  await User.findByIdAndUpdate(user._id, { token: newToken });

  // Возвращаем новый токен
  res.status(200).json({
    token: newToken,
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;
  res.json({
    email,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  await resize(tempUpload);

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  refreshToken: ctrlWrapper(refreshToken),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
