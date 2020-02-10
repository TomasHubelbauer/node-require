const fs = require('fs-extra');

module.exports = async function () {
  await fs.writeFile('test.lol', 'TEST');
};

module.exports = module.exports();
