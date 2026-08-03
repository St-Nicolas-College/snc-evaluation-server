export default {
  routes: [
    {
      method: "GET",
      path: "/faculty-portfolios/me",
      handler: "faculty-portfolio.myPortfolio",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/faculty-portfolios/department",
      handler: "faculty-portfolio.departmentPortfolios",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/faculty-portfolios/department/:documentId",
      handler: "faculty-portfolio.departmentPortfolioDetail",
      config: {
        auth: {},
      },
    },
    {
      method: "POST",
      path: "/faculty-portfolios/:documentId/recalculate",
      handler: "faculty-portfolio.recalculate",
      config: {
        auth: {},
      },
    },
  ],
};
