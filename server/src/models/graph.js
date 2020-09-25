var graph = require('@microsoft/microsoft-graph-client');
const fs = require('fs');
require('isomorphic-fetch');

module.exports = {
  getUserDetails: async function(accessToken) {
    await this.getUserPicture(accessToken);
    const client = getAuthenticatedClient(accessToken);
    const user = await client.api('/me').get();

    return user;
  },

  getUserPicture: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);
    const photo = await client
    .api('/me/photo/$value')
    .version('beta')
    .getStream()
    .then((stream) => {
      console.log("here");
        let writeStream = fs.createWriteStream(`../server/avatars/test.png`); // Eg: test.pdf
        stream.pipe(writeStream).on("error", (err) => {
          throw err;
        });
        writeStream.on("finish", () => {
          console.log("Downloaded profile picture");
        });
        writeStream.on("error", (err) => {
          throw err;
        });
      })
      .catch((error) => {
        throw error;
      });
    
    console.log("photo", photo)
    // return photo;
  },

  getEvents: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);
  
    const events = await client
      .api('/me/events')
      .select('subject,organizer,start,end')
      .orderby('createdDateTime DESC')
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