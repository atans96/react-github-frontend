const jwtService = require("../../helpers/jwt-service");
const createToken = (username, expiresIn) => {
  return jwtService.sign(
    { username },
    {
      expiresIn: expiresIn,
    }
  );
};
const Mutation = {
  Mutation: {
    signUp: async (
      root,
      { username, avatar, token, languagePreference, code },
      { models: { User } }
    ) => {
      await User.findOneAndUpdate(
        { userName: username },
        {
          $set: {
            avatar: avatar,
            code: code,
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
      if (currentUser?.username === undefined) {
        return null;
      }
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
      if (currentUser?.username === undefined) {
        return null;
      }
      return await User.findOneAndUpdate(
        { userName: currentUser?.username },
        {
          $set: {
            languagePreference: languagePreference,
          },
        },
        { upsert: true }
      );
    },
    watchUsersFeedsAdded: async (
      root,
      { login, feeds, lastSeenFeeds },
      { models: { WatchUsers }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      return await WatchUsers.findOneAndUpdate(
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
      // return await WatchUsers.findOneAndUpdate(
      //   { userName: currentUser?.username, "login.login": login },
      //   {
      //     $push: {
      //       "login.$.feeds": {
      //         //for $each takes an array of items to "add" in the $push operation,
      //         // which in this case we leave empty since we do not actually want to add anything
      //         $each: [],
      //         $slice: -300, //get the last 300, which means to exclude anything greater than 300 at first n element (the oldest data)
      //       },
      //       "login.$.lastSeenFeeds": {
      //         $each: [],
      //         $slice: -300,
      //       },
      //     },
      //   },
      //   { new: true } //return new document
      // );
    },
    watchUsersAdded: async (
      root,
      { login },
      { models: { WatchUsers }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      return await WatchUsers.findOneAndUpdate(
        { userName: currentUser?.username }, //no limit at how many subscribe user you can
        {
          $push: {
            login: login,
          },
        },
        { upsert: true }
      );
    },
    starredMeAdded: async (
      root,
      { starred },
      { models: { UserStarred }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      return await UserStarred.findOneAndUpdate(
        { userName: currentUser?.username },
        { $addToSet: { starred: starred } },
        {
          $set: {
            userName: currentUser?.username,
          },
        },
        { upsert: true }
      );
    },
    starredMeRemoved: async (
      root,
      { removeStarred },
      { models: { UserStarred }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      return await UserStarred.findOneAndUpdate(
        { userName: currentUser?.username },
        { $pull: { starred: removeStarred } },
        { upsert: true }
      );
    },
    tokenRSSAdded: async (
      root,
      { tokenRSS },
      { models: { User }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
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
      if (currentUser?.username === undefined) {
        return null;
      }
      return await RSSFeed.findOneAndUpdate(
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
        {
          $set: {
            userName: currentUser?.username,
          },
        },
        { upsert: true }
      );
      // return await RSSFeed.findOneAndUpdate(
      //   { userName: currentUser?.username },
      //   {
      //     $push: {
      //       rss: {
      //         //for $each takes an array of items to "add" in the $push operation,
      //         // which in this case we leave empty since we do not actually want to add anything
      //         $each: [],
      //         $slice: -100, //get the last 100, which means to exclude anything greater than 100 at first n element (the oldest data)
      //       },
      //       lastSeen: {
      //         $each: [],
      //         $slice: -100,
      //       },
      //     },
      //   },
      //   { new: true } //return new document
      // );
    },
    seenAdded: async (
      root,
      { seenCards },
      { models: { Seen }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      return await Seen.findOneAndUpdate(
        { userName: currentUser?.username },
        {
          $addToSet: {
            seenCards: seenCards,
          },
        },
        {
          $set: {
            userName: currentUser?.username,
          },
        },
        { upsert: true }
      );
    },
    searchHistoryAdded: async (
      root,
      { search },
      { models: { Search }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      if (search[0].search.length > 0) {
        const searchDB = await Search.find({
          "searches.search": search[0].search,
        });
        if (searchDB !== null && searchDB.length > 0) {
          return await Search.findOneAndUpdate(
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
        } else {
          return await Search.findOneAndUpdate(
            { userName: currentUser?.username },
            {
              $addToSet: {
                searches: search,
              },
            },
            {
              $set: {
                userName: currentUser?.username,
              },
            },
            { upsert: true }
          );
        }
      }
    },
    clickedAdded: async (
      root,
      { clickedInfo },
      { models: { Clicked, Seen }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const clicked = await Clicked.findOne({
        userName: currentUser?.username,
      });
      if (clicked === null) {
        return await Clicked.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              clicked: clickedInfo,
            },
          },
          {
            $set: {
              userName: currentUser?.username,
            },
          },
          { upsert: true }
        );
      }
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
      if (hasSeen.length === 0) {
        return await Clicked.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              clicked: clickedInfo,
            },
          },
          {
            $set: {
              userName: currentUser?.username,
            },
          },
          { upsert: true }
        );
      }
    },
  },
};

module.exports = Mutation;
