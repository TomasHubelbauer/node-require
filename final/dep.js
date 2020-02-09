module.exports = async function () {
  console.log('resolving');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('resolved');
};

module.exports = module.exports();
