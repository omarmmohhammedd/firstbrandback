const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
//middleware
const morgan = require("morgan");
//env file
const cors = require("cors");
const compression = require("compression");

const rateLimit = require("express-rate-limit");

const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

//database
const dbConnection = require("./config/database");
//route
const mountRoutes = require("./routes");

//error class that i made in utils to handle operational error
const ApiError = require("./utils/apiError");
//GLobal error handling middleware for express
const globalError = require("./middlewares/errorMiddleware");

const { webhookCheckout } = require("./services/OrderService");

//connect with database
dbConnection();
mongoose.set("strictQuery", true);
//express app
const app = express();
//enable other domains access your application
app.use(cors());
app.options("*", cors());

app.use(passport.initialize());

// compress all responses
app.use(compression());



//middlewares
//pasring the comming data to json
app.use(
  express.json()
);

//checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);
//serve static files inside 'uploads'
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(process.env.NODE_ENV);
}

// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000000,
  message:
    "Too many requsts created from this IP, please try again after an 15minute interval",
});
// Apply the rate limiting middleware to all requests
app.use("/api", limiter);

app.get('/sucess',(req,res)=>{
  res.redirect('https://www.thefirstbrand.shop/payment-success')
})

// Mount Routes
mountRoutes(app);

//if there is a problem with routes
// catch the wrong routes that i never Mount
app.all("*", (req, res, next) => {
  //create error and send it to error handling middleware
  next(new ApiError(`Cant Find This Route ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`app running on ${PORT}`);
});

//handle Rejection out side express
//Events =>list =>callback(err)
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors :${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Shutting Down.....");
    process.exit(1);
  });
});
