router.get("/reduction-over-time", dashboardController.redutionOverTime);
router.get("/total-by-date", dashboardController.totalByDate);
router.get("/categories", dashboardController.categoriesDistribution);
router.get("/yearly-emissions", dashboardController.yearlyEmissions);
router.get("/energy-leaderboard", dashboardController.getEnergyLeaderboard);
