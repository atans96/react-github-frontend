const Models = require("../models");

const ApolloCache = {
  getUserInfoStarred: async ({ eventEmitter }) => {
    eventEmitter.on("getUserInfoStarred", async (cacheData) => {
      await Models.UserStarred.findOneAndUpdate(
        { userName: cacheData.username },
        {
          $addToSet: {
            starred: {
              $each: JSON.parse(cacheData.data).starred,
            },
          },
        },
        { upsert: true }
      );
    });
  },
  getUserData: async ({ eventEmitter }) => {
    eventEmitter.on("getUserData", async (cacheData) => {
      await Models.User.findOneAndUpdate(
        { userName: cacheData.username },
        {
          $set: {
            avatar: JSON.parse(cacheData.data).avatar,
            code: JSON.parse(cacheData.data).code,
            languagePreference: JSON.parse(cacheData.data).languagePreference,
            token: JSON.parse(cacheData.data).token,
            tokenRSS: JSON.parse(cacheData.data).tokenRSS,
          },
        },
        { upsert: true }
      );
    });
  },
  getRSSFeed: async ({ eventEmitter }) => {
    eventEmitter.on("getRSSFeed", async (cacheData) => {
      await Models.RSSFeed.findOneAndUpdate(
        { userName: cacheData.username },
        {
          $addToSet: {
            rss: {
              $each: JSON.parse(cacheData.data).rss,
            },
            lastSeen: {
              //cannot be lastSeen as it will complain: "cannot index parallel" since it has similar rss name on it
              $each: JSON.parse(cacheData.data).lastSeen,
            },
          },
        },
        { upsert: true }
      );
      await Models.RSSFeed.findOneAndUpdate(
        { userName: cacheData.username },
        {
          $push: {
            rss: {
              //for $each takes an array of items to "add" in the $push operation,
              // which in this case we leave empty since we do not actually want to add anything
              $each: [],
              $slice: -300, //get the last 300, which means to exclude anything greater than 300 at first n element (the oldest data)
            },
            lastSeen: {
              $each: [],
              $slice: -300,
            },
          },
        },
        { new: true } //return new document
      );
    });
  },
  getSeen: async ({ eventEmitter }) => {
    eventEmitter.on("getSeen", async (cacheData) => {
      await Models.Seen.findOneAndUpdate(
        { userName: cacheData.username },
        {
          $addToSet: {
            seenCards: {
              $each: JSON.parse(cacheData.data).seenCards,
            },
          },
        },
        { upsert: true }
      );
    });
  },
  getSearches: async ({ eventEmitter }) => {
    eventEmitter.on("getSearches", async (cacheData) => {
      JSON.parse(cacheData.data).forEach((obj) => {
        (async () => {
          if (obj.search.length > 0) {
            const searchDB = await Models.Search.find({
              "searches.search": obj.search,
            });
            if (searchDB !== null && searchDB.length > 0) {
              await Models.Search.findOneAndUpdate(
                {
                  userName: cacheData.username,
                  "searches.search": obj.search,
                },
                {
                  $set: {
                    "searches.$.updatedAt": new Date(),
                  },
                  $inc: {
                    "searches.$.count": 1,
                  },
                },
                { upsert: true }
              );
            } else {
              await Models.Search.findOneAndUpdate(
                { userName: cacheData.username },
                {
                  $addToSet: {
                    searches: { $each: [obj] },
                  },
                },
                { upsert: true }
              );
            }
          }
        })();
      });
    });
  },
  getClicked: async ({ eventEmitter }) => {
    eventEmitter.on("getClicked", async (cacheData) => {
      JSON.parse(cacheData.data).clicked.forEach((obj) => {
        (async () => {
          const hasSeen = await Models.Seen.aggregate([
            {
              $match: {
                userName: cacheData.username,
                "seenCards.full_name": obj.full_name,
              },
            },
            {
              $project: {
                is_queried: {
                  $filter: {
                    input: "$seenCards",
                    as: "seenCards",
                    cond: { $eq: ["$$seenCards.is_queried", true] },
                  },
                },
              },
            },
          ]);
          //if seenCards has been queried by the github-api-static, don't append the Clicked database to prevent being queried again
          if (hasSeen.length === 0 || hasSeen[0].is_queried.length === 0) {
            //always take the first element in array since we're querying for 1 full_name ("seenCards.full_name": clickedInfo[0].full_name) above
            await Models.Clicked.findOneAndUpdate(
              { userName: cacheData.username },
              {
                $addToSet: {
                  clicked: {
                    $each: [obj],
                  },
                },
              },
              { upsert: true }
            );
          }
        })();
      });
    });
  },
};

module.exports = ApolloCache;
