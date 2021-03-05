module.exports = async (req, res, ctx, ...args) => {
  args[0]
    .axios({
      url: "https://api.github.com/graphql",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${req.body.token}`,
      },
      data: {
        query: `
                  query {
                    organization(login: "facebook") {
                        name
                        url
                        repository(name: "graphql") {
                            name
                        }
                    }
                  }
      `,
      },
    })
    .then((result) => {
      if (result.data.data.organization.name) {
        res.send({
          success: true,
        });
      } else {
        res.send({
          success: false,
        });
      }
    })
    .catch((err) => {
      ctx.log.error(err);
      res.send({
        success: false,
      });
    });
};
