module.exports = async (req, res, ctx, ...args) => {
  const results = await args[0].elastic.search({
    index: req.query.docName,
    type: req.query.docType,
    size: 50,
    body: {
      query: {
        multi_match: {
          query: req.query.search,
          type: "cross_fields",
          fields: [
            "full_name",
            "description^2",
            "readme^3",
            "topics^4",
            "language^5",
          ],
          operator: "or",
          tie_breaker: 1.0,
          cutoff_frequency: 0.1,
        },
      },
    },
  });
  return results.hits.hits.map(
    ({
      _source: {
        full_name,
        description,
        language,
        html_url,
        stargazers_count,
        owner,
        id,
      },
    }) => ({
      full_name,
      description,
      language,
      html_url,
      stargazers_count,
      owner,
      id,
    })
  );
};
