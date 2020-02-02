void function () {
  console.log('dep void sync');
}()

void async function () {
  console.log('dep void async before');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('dep void async after');
}()

async function run() {
  console.log('dep async uncoordinated before');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('dep async uncoordinated after');
}

// Fire and forget
run();

async function coordinated() {
  console.log('dep async coordinated before');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('dep async coordinated after');
}

// Fire and hand over
module.exports = coordinated();
