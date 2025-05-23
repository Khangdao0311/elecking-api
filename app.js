require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require("mongoose");

mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => console.log("Connect successful"))
  .catch((err) => console.log("Connect fail", err));

var cors = require("cors");

var corsOptionsDelegate = function (req, callback) {
  var corsOptions = { origin: true };
  callback(null, corsOptions);
};

var indexRouter = require('./routes/index');
var categoryRouter = require('./routes/category');
var brandRouter = require('./routes/brand');
var productRouter = require('./routes/product');
var userRouter = require('./routes/user');
var vnpayRouter = require('./routes/vnpay');
var orderRouter = require('./routes/order');
var payment_methodRouter = require('./routes/payment_method');
var addressRouter = require('./routes/address');
var voucherRouter = require('./routes/voucher');
var authRouter = require('./routes/auth');
var uploadRouter = require('./routes/upload');
var mailRouter = require('./routes/mail');
var propertyRouter = require('./routes/property');
var reviewRouter = require('./routes/review');
var proptypeRouter = require('./routes/proptype');
var statsRouter = require('./routes/stats');

var app = express();

app.use(cors(corsOptionsDelegate));
// app.use(cors({
//   origin: "http://localhost:3000", // Cho phép gọi từ Next.js
//   methods: "GET,POST",
//   allowedHeaders: "Content-Type",
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/category', categoryRouter);
app.use('/brand', brandRouter);
app.use('/product', productRouter);
app.use('/user', userRouter);
app.use('/vnpay', vnpayRouter);
app.use('/order', orderRouter);
app.use('/payment_method', payment_methodRouter);
app.use('/voucher', voucherRouter);
app.use('/address', addressRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);
app.use('/mail', mailRouter);
app.use('/property', propertyRouter);
app.use('/review', reviewRouter);
app.use('/proptype', proptypeRouter);
app.use('/stats', statsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
