class UserDbController {
  constructor({ db, models }) {
    this.db = db;
    this.models = models;
  }
  async getByUserName({ username }) {
    const user = await this.db
      .collection("users")
      .findOne({ userName: username });

    if (!user) return user;

    const { userName, ...rest } = user;
    return { userName, ...rest };
  }
  async getUserDataByUserName({ username }) {
    const user = await this.db
      .collection("users")
      .findOne({ userName: username });

    if (!user) return user;
    return Object.assign(
      {},
      {
        getUserData: {
          tokenRSS: user.tokenRSS,
          languagePreference: user.languagePreference,
          code: user.code,
          userName: user.userName,
          avatar: user.avatar,
          token: user.token,
          joinDate: user.joinDate,
        },
      }
    );
  }
  async getUserInfoByUserName({ username }) {
    const output = await this.models.UserLanguages.findOne({
      userName: username,
    })
      .populate(["repoContributions", "repoInfo"])
      .exec(); //to call populate method, you need model, not collection from mongoose
    if (!output)
      return Object.assign(
        {},
        {
          getUserInfoData: {
            userName: username,
            repoInfo: {},
            repoContributions: {},
            languages: {},
          },
        }
      );
    return Object.assign(
      {},
      {
        getUserInfoData: {
          userName: username,
          repoInfo: output.repoInfo.repoInfo,
          repoContributions: output.repoContributions.repoContributions,
          languages: output.languages,
        },
      }
    );
  }
}

module.exports = UserDbController;
