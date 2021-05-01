const jwtService = require("../../helpers/jwt-service");
const createToken = (username, expiresIn) => {
  return jwtService.sign(
    { username },
    {
      expiresIn: expiresIn,
    }
  );
};
//addToSet and set cannot be the same operation
const Mutation = {
  Mutation: {
    signUp: async (
      root,
      { username, avatar, token, languagePreference, code, tokenRSS },
      { models: { User } }
    ) => {
      User.findOneAndUpdate(
        { userName: username },
        {
          $set: {
            avatar: avatar,
            code: code,
            tokenRSS: tokenRSS,
            languagePreference: languagePreference,
            token: token,
          },
        },
        { upsert: true }
      );
      return {
        token: createToken(username, "6hr"),
      };
    },
    watchUsersRemoved: async (
      root,
      { login },
      { models: { WatchUsers }, currentUser }
    ) => {
      const watchUsers = await WatchUsers.findOne({
        userName: currentUser?.username,
      });
      if (watchUsers !== null) {
        await WatchUsers.updateOne(
          { userName: currentUser?.username },
          {
            $pull: {
              login: { login: login },
            },
          }
        );
        return true;
      }
      return false;
    },
    setLanguagePreference: async (
      root,
      { languagePreference },
      { models: { User }, currentUser }
    ) => {
      await User.findOneAndUpdate(
        { userName: currentUser?.username },
        {
          $set: {
            languagePreference: languagePreference,
          },
        },
        { upsert: true }
      );
      return await User.findOne({ userName: currentUser?.username });
    },
    watchUsersFeedsAdded: async (
      root,
      { login, feeds, lastSeenFeeds },
      { models: { WatchUsers }, currentUser }
    ) => {
      await WatchUsers.findOneAndUpdate(
        { userName: currentUser?.username, "login.login": login },
        {
          $addToSet: {
            "login.$.feeds": {
              $each: feeds,
            },
            "login.$.lastSeenFeeds": {
              $each: lastSeenFeeds,
            },
          },
        },
        { upsert: true }
      );
      // return await WatchUsers.findOne({ userName: currentUser?.username });
      return await WatchUsers.findOneAndUpdate(
        { userName: currentUser?.username, "login.login": login },
        {
          $push: {
            "login.$.feeds": {
              //for $each takes an array of items to "add" in the $push operation,
              // which in this case we leave empty since we do not actually want to add anything
              $each: [],
              $slice: -300, //get the last 300, which means to exclude anything greater than 300 at first n element (the oldest data)
            },
            "login.$.lastSeenFeeds": {
              $each: [],
              $slice: -300,
            },
          },
        },
        { new: true } //return new document
      );
    },
    watchUsersAdded: async (
      root,
      { login },
      { models: { WatchUsers }, currentUser }
    ) => {
      await WatchUsers.findOneAndUpdate(
        { userName: currentUser?.username }, //no limit at how many subscribe user you can
        {
          $push: {
            login: login,
          },
        },
        { upsert: true }
      );
      return await WatchUsers.findOne({ userName: currentUser?.username });
    },
    starredMeAdded: async (
      root,
      { starred },
      { models: { UserStarred }, currentUser }
    ) => {
      await UserStarred.findOneAndUpdate(
        { userName: currentUser?.username },
        { $addToSet: { starred: { $each: starred } } },
        { upsert: true }
      );
      return await UserStarred.findOne({ userName: currentUser?.username });
    },
    starredMeRemoved: async (
      root,
      { removeStarred },
      { models: { UserStarred }, currentUser }
    ) => {
      await UserStarred.findOneAndUpdate(
        { userName: currentUser?.username },
        { $pull: { starred: removeStarred } },
        { upsert: true }
      );
      return await UserStarred.findOne({ userName: currentUser?.username });
    },
    tokenRSSAdded: async (
      root,
      { tokenRSS },
      { models: { User }, currentUser }
    ) => {
      await User.updateOne(
        { userName: currentUser?.username },
        { $set: { tokenRSS: tokenRSS } },
        { upsert: true }
      );
      return true;
    },
    rssFeedAdded: async (
      root,
      { rss, lastSeen },
      { models: { RSSFeed }, currentUser }
    ) => {
      await RSSFeed.findOneAndUpdate(
        { userName: currentUser?.username },
        {
          $addToSet: {
            rss: {
              $each: rss,
            },
            lastSeen: {
              //cannot be lastSeen as it will complain: "cannot index parallel" since it has similar rss name on it
              $each: lastSeen,
            },
          },
        },
        { upsert: true }
      );
      await RSSFeed.findOneAndUpdate(
        { userName: currentUser?.username },
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
      return await RSSFeed.findOne({ userName: currentUser?.username });
    },
    getSeen: async (
      root,
      { seenCards },
      { models: { Seen }, currentUser, eventEmitter }
    ) => {
      eventEmitter.on("getSeen", async (cacheData) => {
        await Seen.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              seenCards: {
                $each: seenCards,
              },
            },
          },
          { upsert: true }
        );
      });
    },
    searchHistoryAdded: async (
      root,
      { search },
      { models: { Search }, currentUser }
    ) => {
      if (search[0].search.length > 0) {
        const searchDB = await Search.find({
          "searches.search": search[0].search,
        });
        if (searchDB !== null && searchDB.length > 0) {
          await Search.findOneAndUpdate(
            {
              userName: currentUser?.username,
              "searches.search": search[0].search,
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
          return await Search.findOne({ userName: currentUser?.username });
        } else {
          await Search.findOneAndUpdate(
            { userName: currentUser?.username },
            {
              $addToSet: {
                searches: { $each: search },
              },
            },
            { upsert: true }
          );
          return await Search.findOne({ userName: currentUser?.username });
        }
      }
    },
    clickedAdded: async (
      root,
      { clickedInfo },
      { models: { Clicked, Seen }, currentUser }
    ) => {
      const hasSeen = await Seen.aggregate([
        {
          $match: {
            userName: currentUser?.username,
            "seenCards.full_name": clickedInfo[0].full_name,
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
        await Clicked.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              clicked: {
                $each: clickedInfo,
              },
            },
          },
          { upsert: true }
        );
        return Clicked.findOne({ userName: currentUser?.username });
      }
    },
  },
};

module.exports = Mutation;
