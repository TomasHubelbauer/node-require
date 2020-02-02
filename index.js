void async function () {
  console.log('before');
  console.log(await require('./dep'));
  console.log('after');
}()
