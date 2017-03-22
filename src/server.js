const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const query = require('querystring');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// handle POST requests
const handleParams = (request, response, parsedUrl) => {
  // if post is to /addUser (our only POST url)
  const res = response;
  // uploads come in as a byte stream that we need
  // to reassemble once it's all arrived
  const body = [];
  // if the upload stream errors out, just throw a
  // a bad request and send it back
  request.on('error', (err) => {
    console.dir(err);
    res.statusCode = 400;
    res.end();
  });
  // on 'data' is for each byte of data that comes in
  // from the upload. We will add it to our byte array.
  request.on('data', (chunk) => {
    body.push(chunk);
  });
  // on end of upload stream.
  request.on('end', () => {
    // combine our byte array (using Buffer.concat)
    // and convert it to a string value (in this instance)
    const bodyString = Buffer.concat(body).toString();
    // since we are getting x-www-form-urlencoded data
    // the format will be the same as querystrings
    // Parse the string into an object by field name
    const bodyParams = query.parse(bodyString);
    // pass to our addUser function
    if (parsedUrl.pathname === '/addRecipe') {
      jsonHandler.addRecipe(request, res, bodyParams);
    }
    if (parsedUrl.pathname === '/removeRecipe') {
      jsonHandler.removeRecipe(request, res, bodyParams);
    }
    if (parsedUrl.pathname === '/getCategory') {
      jsonHandler.getCategory(request, res, bodyParams);
    }
  });
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  switch (request.method) {
    case 'POST':
      handleParams(request, response, parsedUrl);
      break;
    case 'GET':
      if (parsedUrl.pathname === '/') {
        htmlHandler.getIndex(request, response);
      } else if (parsedUrl.pathname === '/styles.css') {
        htmlHandler.getCSS(request, response);
      } else if (parsedUrl.pathname === '/getRecipe') {
        jsonHandler.getRecipe(request, response);
      } else if (parsedUrl.pathname === '/getCategory') {
        handleParams(request, response, parsedUrl);
      } else {
        jsonHandler.notFound(request, response);
      }
      break;
    case 'HEAD':
      jsonHandler.notFoundMeta(request, response);
      break;
    case 'DELETE':
      handleParams(request, response, parsedUrl);
      break;
    default:
      jsonHandler.notFoundMeta(request, response);
  }
};

http.createServer(onRequest).listen(PORT);

console.log(`Listening on 127.0.0.1: ${PORT}`);
