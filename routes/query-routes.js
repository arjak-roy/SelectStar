var express = require('express');
var router = express.Router();
const queryExecutor = require('../controllers/queryExecution-controller');
const { validateSQL } = require('../middleware/query-validation');
const challengesController = require('../controllers/challenges-controller');
const adminController = require('../controllers/admin-controller');
const metadataController = require('../controllers/metadata-controller');
const authController = require('../controllers/auth');
const userController = require('../controllers/user-controller');
const verifyToken = require('../middleware/verify-token');

// for retieving challenges
// 1. Sorting by difficulty
router.get('/challenges/sort/difficulty/:order', challengesController.sortChallengesByDifficulty);

// 2. Get challenge by ID ( includes required tables)
router.get('/challenges/:id', challengesController.getChallengesById);

// 3. Get all challenges
router.get('/api/challenges', challengesController.getChallenges);


//for executing user-submitted SQL queries
router.post('/api/query', verifyToken, validateSQL, queryExecutor.executeQuery);

//for executing user-submitted SQL queries
router.post('/api/check/:id',verifyToken , validateSQL, queryExecutor.checkSolution);    

// Admin routes
router.post('/admin/create-challenge-table', adminController.createNewChallengeTable);
router.post('/admin/insert-challenge-table', adminController.insertintoChallengeTable);
router.post('/admin/modify-challenge-table', adminController.modifyChallengetable);
router.post('/admin/create-new-challenge', adminController.createNewChallenge);
router.post('/admin/modify-challenge/:id', adminController.modifyChallenge);
router.post('/admin/query-execution', adminController.adminqueryExecution);

// Metadata route
router.post('/api/metadata/columns', metadataController.getColumnInfo);

//Auth routes
router.post('/api/login', authController.login);
router.post('/api/signup', authController.signup);
router.post('/api/logout', authController.logout);
router.get('/api/getme', verifyToken, authController.getMe);
module.exports = router;

//user routes
router.get('/api/getUser/:id',verifyToken ,userController.getUser);
router.get('/api/user/progress/:id',verifyToken ,userController.getuserProgress);