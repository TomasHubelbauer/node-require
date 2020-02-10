void async function () {
  try {
    process.chdir('path');
    const promise = await require('./dep');
    console.log('ok', promise);
  }
  catch (error) {
    console.log('fail');
  }

  process.chdir('..');
  console.log(process.cwd());
}()
