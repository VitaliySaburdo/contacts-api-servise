const errorMassageList = {
  400: "Bad Request",
  401: "Not authorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
};

const HttpError = (status, massage = errorMassageList[status]) => {
  const error = new Error(massage);
  error.status = status;
  return error;
};

module.exports = HttpError;
