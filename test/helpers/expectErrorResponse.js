const { expect } = require("chai");

function expectErrorResponse(response, { statusCode, error, message }) {
  expect(response.status).to.equal(statusCode);
  expect(response.body).to.deep.equal({
    error,
    message,
    statusCode
  });
}

module.exports = {
  expectErrorResponse
};
