//A resolver is a function that's responsible for populating the data for a single field in your schema.
// It can populate that data in any way you define, such as by fetching data from a back-end database or a third-party API.
const Query = {
  Query: {
    getStarRanking: async (
      root,
      {},
      { models: { StarRanking }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const starRanking = await StarRanking.findOne({
        userName: currentUser?.username,
      });

      return starRanking;
    },
    getSuggestedRepo: async (
      root,
      {},
      { models: { SuggestedRepo }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const suggestedRepo = await SuggestedRepo.findOne({
        userName: currentUser?.username,
      });

      return suggestedRepo;
    },
    getUserInfoData: async (
      root,
      {},
      { models: { UserLanguages }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const user = await UserLanguages.findOne({
        userName: currentUser?.username,
      })
        .populate(["repoContributions", "repoInfo"])
        .exec();
      const result = Object.assign(
        {},
        {
          userName: user.userName,
          repoInfo: user.repoInfo.repoInfo,
          repoContributions: user.repoContributions.repoContributions,
          languages: user.languages,
        }
      );
      return result;
    },
    getUserInfoStarred: async (
      root,
      {},
      { models: { UserStarred }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const starred = await UserStarred.findOne({
        userName: currentUser?.username,
      });
      return starred;
    },
    getUserData: async (root, {}, { models: { User }, currentUser }) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const user = await User.findOne({ userName: currentUser?.username });

      return user;
    },
    getWatchUsers: async (
      root,
      {},
      { models: { WatchUsers }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      //get all data from one field without returning _id
      const watchUsers = await WatchUsers.findOne({}, { login: 1, _id: 0 });
      return watchUsers;
    },
    getSeen: async (root, {}, { models: { Seen }, currentUser }) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      //get all data from one field without returning _id
      const seen = await Seen.findOne({ userName: currentUser?.username });
      return seen;
    },
    getSearches: async (
      root,
      {},
      { models: { Search, User }, currentUser }
    ) => {
      if (currentUser?.username === undefined) {
        return null;
      }
      const user = await User.findOne({ userName: currentUser?.username });
      if (user !== null) {
        const searches = await Search.aggregate([
          { $match: { userName: currentUser?.username } },
          { $unwind: "$searches" },
          {
            $sort: {
              "searches.updatedAt": -1, //most recent search will be at the top
            },
          },
        ]);
        const result = searches.reduce((acc, obj) => {
          acc.push(obj.searches);
          return acc;
        }, []);
        return result;
      }
    },
  },
};

module.exports = Query;
