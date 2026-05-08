export const errorHandler = (err, req, res, next) => {
  console.error(err.response?.data || err.message);

  res.status(500).json({
    message: "Erreur serveur",
    details: err.response?.data || err.message,
  });
};