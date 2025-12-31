var express = require('express');
var router = express.Router();
const queryExecutor = require('../controllers/queryExecution-controller');
const { validateSQL } = require('../middleware/query-validation');
const challengesController = require('../controllers/challenges-controller');
const adminController = require('../controllers/admin-controller');
const metadataController = require('../controllers/metadata-controller');



// for retieving challenges
// 1. Sorting by difficulty
router.get('/challenges/sort/difficulty/:order', challengesController.sortChallengesByDifficulty);

// 2. Get challenge by ID ( includes required tables)
router.get('/challenges/:id', challengesController.getChallengesById);

// 3. Get all challenges
router.get('/api/challenges', challengesController.getChallenges);


//for executing user-submitted SQL queries
router.post('/api/query', validateSQL, queryExecutor.executeQuery);

//for executing user-submitted SQL queries
router.post('/api/check/:id', validateSQL, queryExecutor.checkSolution);    

// Admin routes
router.post('/admin/create-challenge-table', adminController.createNewChallengeTable);
router.post('/admin/insert-challenge-table', adminController.insertintoChallengeTable);
router.post('/admin/modify-challenge-table', adminController.modifyChallengetable);
router.post('/admin/create-new-challenge', adminController.createNewChallenge);
router.post('/admin/modify-challenge/:id', adminController.modifyChallenge);
router.post('/admin/query-execution', adminController.adminqueryExecution);

// Metadata route
router.post('/api/metadata/columns', metadataController.getColumnInfo);


module.exports = router;
