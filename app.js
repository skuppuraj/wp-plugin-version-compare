
const Main = require('./main');

const args = process.argv.slice(2);

let obj = new Main(args);

obj.run();