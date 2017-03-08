const fs = require('fs');  // pull in the file system module

const index = fs.readFileSync(`${__dirname}/../public/client.html`);
const css = fs.readFileSync(`${__dirname}/../public/styles.css`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  console.log('loading css file');
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
};
