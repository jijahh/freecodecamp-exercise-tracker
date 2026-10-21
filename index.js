const express = require('express')
const app = express()
let mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config()
const { User, Exercise, Log } = require('./models');
const bodyParser = require('body-parser');
mongoose.connect(process.env.MONGO_URI);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.route('/api/users').get( async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.json({error: "no users"});
  }
}).post( async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (user) {
      return res.json(user);
    }
  } catch (error) {
  }
  const newUser = await User.create({ username: req.body.username });
  res.json(newUser);
});
app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  let { description, duration, date } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    date = date ? new Date(date) : new Date();
    const newExercise = new Exercise({
      username: user.username,
      description: description,
      duration: Number(duration),
      date: date.toDateString()
    });
    let log = await Log.findOne({userId: userId}); 
    if (!log) {
      log = await Log.create({
        userId: userId,
        count: 1,
        log: [newExercise]
      });
    } else {
      log.count++;
      log.log.push(newExercise);
      await log.save();
    }
    res.json({
      _id: userId,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }
    let userLog = await Log.findOne({userId: userId});
    if (!userLog) {
      return res.status(404).json({error: 'Log not found'});
    }
    let filteredLog = userLog.log;
    if (from) {
      const fromDate = new Date(from);
      filteredLog = filteredLog.filter(exercise => new Date(exercise.date) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      filteredLog = filteredLog.filter(exercise => new Date(exercise.date) <= toDate);
    }
    if (limit) {
      filteredLog = filteredLog.slice(0, parseInt(limit));
    }
    res.json({
      _id: user._id,
      username: user.username,
      count: userLog.count,
      log: filteredLog
    });
  } catch (err){
    res.status(500).json({ error: 'Internal server error' });
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
