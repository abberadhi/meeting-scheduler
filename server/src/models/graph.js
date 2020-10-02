var graph = require('@microsoft/microsoft-graph-client');
const fs = require('fs');
require('isomorphic-fetch');


module.exports = {
  getUserDetails: async function(accessToken) {
    // await this.getUserPicture(accessToken);
    const client = getAuthenticatedClient(accessToken);
    // const user = await client.api('/me').get();



    const batch = {
      "requests": [
          {
              "url": "/me",
              "method": "GET",
              "id": "1",
              "headers": {
                  "Content-Type": "application/json"
              }
          },
          {
              "url": "/me/photos/48x48/$value",
              "method": "GET",
              "id": "2",
              "headers": {
                "Authorization": accessToken
            }
          }
      ]
  }

  let result = await client.api('/$batch')
    .version('beta')
    .post(batch);

    
    return result;
  },

  getEvents: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);
  
    const events = await client
      .api('/me/events')
      .select('subject,organizer,start,end')
      .orderby('createdDateTime DESC')
      .top(20)
      .get();

    return events;
  }
};

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  return client;
}