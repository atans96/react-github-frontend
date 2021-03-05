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
      const user = await User.findOne({ userName: username });
      // populate MongoDB database
      if (user === null) {
        await new User({
          userName: username,
          tokenRSS: "",
          starred: [],
          avatar,
          code,
          languagePreference,
          token,
        }).save();
      } else {
        await User.findOneAndUpdate(
          { userName: username },
          {
            $set: {
              avatar: avatar,
              code: code,
              languagePreference: languagePreference,
              token: token,
            },
          }
        );
      }
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
      const user = await User.findOne({ userName: currentUser?.username });
      if (user !== null && languagePreference.length > 0) {
        const updated = User.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $set: {
              languagePreference: languagePreference,
            },
          }
        );
        return updated;
      }
    },
    watchUsersFeedsAdded: async (
      root,
      { login, feeds, lastSeenFeeds },
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
          }
        );
        const watchUsers = await WatchUsers.findOneAndUpdate(
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
        return watchUsers;
      }
    },
    watchUsersAdded: async (
      root,
      { login },
      { models: { WatchUsers }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const watchUsers = await WatchUsers.findOneAndUpdate(
        { userName: currentUser?.username }, //no limit at how many subscribe user you can
        {
          $push: {
            login: login,
          },
        },
        { upsert: true }
      );
      return watchUsers;
    },
    starredMeAdded: async (
      root,
      { starred },
      { models: { UserStarred }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const starredMeAdded = await UserStarred.findOneAndUpdate(
        { userName: currentUser?.username },
        { $addToSet: { starred: starred } }
      );
      return starredMeAdded;
    },
    starredMeRemoved: async (
      root,
      { removeStarred },
      { models: { UserStarred }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const starredMeRemoved = await UserStarred.findOneAndUpdate(
        { userName: currentUser?.username },
        { $pull: { starred: removeStarred } }
      );
      return starredMeRemoved;
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
        { $set: { tokenRSS: tokenRSS } }
      );
      return true;
    },
    rssFeedAdded: async (
      root,
      { rss, rssLastSeen },
      { models: { RSSFeed }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const Rss = await RSSFeed.findOne({ userName: currentUser?.username });
      if (Rss !== null) {
        await RSSFeed.updateOne(
          { userName: currentUser?.username },
          {
            $addToSet: {
              rss: {
                $each: rss,
              },
              rssLastSeen: {
                $each: rssLastSeen,
              },
            },
          }
        );
        const RSS = await RSSFeed.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $push: {
              rss: {
                //for $each takes an array of items to "add" in the $push operation,
                // which in this case we leave empty since we do not actually want to add anything
                $each: [],
                $slice: -100, //get the last 100, which means to exclude anything greater than 100 at first n element (the oldest data)
              },
              rssLastSeen: {
                $each: [],
                $slice: -100,
              },
            },
          },
          { new: true } //return new document
        );
        return RSS;
      } else {
        await new RSSFeed({
          userName: currentUser?.username,
          rss,
        }).save();
        return Rss;
      }
    },
    seenAdded: async (
      root,
      { seenCards },
      { models: { Seen, User }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const user = await User.findOne({ userName: currentUser?.username });
      if (user !== null) {
        const seens = await Seen.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              seenCards: seenCards,
            },
          },
          { upsert: true }
        );
        return seens;
      }
    },
    searchHistoryAdded: async (
      root,
      { search },
      { models: { Search, User }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const user = await User.findOne({ userName: currentUser?.username });
      if (user !== null && search[0].search.length > 0) {
        const searchDB = await Search.find({
          "searches.search": search[0].search,
        });
        if (searchDB !== null && searchDB.length > 0) {
          const searchHistory = await Search.findOneAndUpdate(
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
            }
          );
          return searchHistory;
        } else {
          const searchHistory = await Search.findOneAndUpdate(
            { userName: currentUser?.username },
            {
              $addToSet: {
                searches: search,
              },
            },
            { upsert: true }
          );
          return searchHistory;
        }
      }
    },
    clickedAdded: async (
      root,
      { clickedInfo },
      { models: { Clicked, User, Seen }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const user = await User.findOne({ userName: currentUser?.username });
      const clicked = await Clicked.findOne({
        userName: currentUser?.username,
      });
      if (user !== null && clicked === null) {
        const clicked = await Clicked.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              clicked: clickedInfo,
            },
          },
          { upsert: true }
        );
        return clicked;
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
      if (user !== null && clicked !== null && hasSeen.length === 0) {
        const clicked = await Clicked.findOneAndUpdate(
          { userName: currentUser?.username },
          {
            $addToSet: {
              clicked: clickedInfo,
            },
          },
          { upsert: true }
        );
        return clicked;
      }
    },
  },
};

module.exports = Mutation;
