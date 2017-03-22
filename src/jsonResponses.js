// Node's built-in cryptography module.
const crypto = require('crypto');

// Note this object is purely in memory
const recipe = {};
const categories = { Miscellaneous: 'Miscellaneous' };

// sha1 is a bit of a quicker hash algorithm for insecure things
let etag = crypto.createHash('sha1').update(JSON.stringify(recipe));
// grab the hash as a hex string
let digest = etag.digest('hex');

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  console.log(`respondJSON ${request}`);
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  console.log(`respondJSONMeta ${status}`);
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.end();
};

// removes a specific recipe
const removeRecipe = (request, response, body) => {
  if (recipe[body.id]) {
    delete recipe[body.id];
  }
  // update etag since a change has been made
  etag = crypto.createHash('sha1').update(JSON.stringify(recipe));
  digest = etag.digest('hex');
  const responseJSON = {
    recipe,
  };
  if (request.headers['if-none-match'] === digest) {
    console.log(request.headers['if-none-match']);

    return respondJSONMeta(request, response, 304);
  }
  return respondJSON(request, response, 200, responseJSON);
};
// returns all recipes
const getRecipe = (request, response) => {
  const responseJSON = {
    recipe,
  };
  if (request.headers['if-none-match'] === digest) {
    console.log(request.headers['if-none-match']);

    return respondJSONMeta(request, response, 304);
  }

  return respondJSON(request, response, 200, responseJSON);
};
// adds a new recipe
const addRecipe = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and age are both required.',
  };
  // default status code to 201 created
  let responseCode = 201;

  // if that user's name already exists in our object
  // then switch to a 204 updated status
  if (recipe[body.id]) {
    recipe[body.id].ingredients = body.ingredients;
    recipe[body.id].category = body.category;
    recipe[body.id].notes = body.notes;
    recipe[body.id].name = body.name;
    recipe[body.id].color = body.color;
    responseCode = 204;
  } else {
    // otherwise create an object with that name
    recipe[body.id] = {};
  }
  // check if a new category has been added
  if (!categories[body.category]) {
    categories[body.category] = body.category;
  }
  // add or update fields for this recipe
  recipe[body.id].id = body.id;
  recipe[body.id].name = body.name;
  recipe[body.id].ingredients = body.ingredients;
  recipe[body.id].category = body.category;
  recipe[body.id].notes = body.notes;
  recipe[body.id].color = body.color;

  etag = crypto.createHash('sha1').update(JSON.stringify(recipe));
  digest = etag.digest('hex');

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.category = categories;
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  // 204 has an empty payload, just a success
  // 204 will not alter the browser in any way!!!
  return respondJSONMeta(request, response, responseCode);
};
// returns all categories for dropdown
const getCategory = (request, response, body) => {
  const temp = [];
  Object.keys(recipe).forEach = (key) => {
    const value = recipe[key].category;
    if (value === body.category) {
      temp.push(recipe[key]);
    }
  };
  recipe.find(body.category);
  const responseJSON = {
    temp,
  };
  console.dir(temp);
  if (request.headers['if-none-match'] === digest) {
    console.log(request.headers['if-none-match']);

    return respondJSONMeta(request, response, 304);
  }

  return respondJSON(request, response, 200, responseJSON);
};

const notFound = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    console.log(request.headers['if-none-match']);
    return respondJSONMeta(request, response, 404);
  }
  const responseJSON = {
    id: 'notFound',
    message: 'The page you are looking for was not found.',
  };
  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) =>
  respondJSONMeta(request, response, 404);

module.exports = {
  getRecipe,
  addRecipe,
  removeRecipe,
  notFound,
  notFoundMeta,
  getCategory,
};
