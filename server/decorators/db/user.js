class UserDbController {
  constructor({ db }) {
    this.db = db;
  }
  async getByUserName({ username }) {
    const user = await this.db
      .collection("users")
      .findOne({ userName: username });

    if (!user) return user;

    const { userName, ...rest } = user;
    return { userName, ...rest };
  }
}

module.exports = UserDbController;
