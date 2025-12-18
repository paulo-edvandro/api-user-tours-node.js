const url = (req, caminho, flag, token) => {
  if (flag !== true) {
    return `${req.protocol}://${req.get('host')}/${caminho}`;
  }

  return `${req.protocol}://${req.get('host')}/${caminho}/${token}`;
};

module.exports = url;
