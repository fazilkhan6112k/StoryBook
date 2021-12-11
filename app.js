const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const morgan = require('morgan');

//load config
dotenv.config({ path: './config/config.env' });

//passport config
require('./config/passport')(passport)

connectDB();
const app = express();

//body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
}))

//logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs.js');

//handlebars
app.engine('.hbs', exphbs({ helpers: {formatDate, stripTags, truncate, editIcon, select}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');
 
//sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({ mongooseConnection: mongoose.connection })
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://fazilkhan6112k:sachin10@cluster0.xmvif.mongodb.net/storybooks?retryWrites=true&w=majority'
    })

  }))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next();
})

//static folders
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));
 
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})