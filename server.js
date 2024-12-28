const express = require("express");
const mongoose = require("mongoose");
const {
    getAllCitiesWeather,
    getCityWeatherDetails,
    getSavedCities,
    saveCityHandler,
    unsaveCityHandler } = require("./controllers/city");
const { getAllCitiesForecast } = require("./controllers/forecast");
const notFoundHandler = require("./controllers/404");
const {
    getLogin,
    loginHandler,
    logoutHandler,
    getRegister,
    registerHandler } = require("./controllers/auth");
const {
    getAdminPanel,
    updateWeather,
    automaticUpdateHandler,
    deleteCityHandler,
    getUpdateCity,
    updateCityHandler,
    getWeatherData } = require("./controllers/admin");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();
const tenMinutes = 1000 * 60 * 10;

// Setting the template engine to be Pugjs
app.set("view engine", "pug");

// Serving static files
app.use(express.static("public"));

// Parsing request bodies
app.use(express.urlencoded());
app.use(express.json());

// Session management
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env["SESSION_DB"] }),
    cookie: { maxAge: tenMinutes }
}));

// Custom middleware
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.user.isAdmin = req.session.user.isAdmin;
    }
    next();
});

// Express Route Definitions
app.get("/", getAllCitiesWeather);
app.get("/city/:city", getCityWeatherDetails);
app.get("/forecasts", getAllCitiesForecast);

app.get("/login", getLogin);
app.get("/register", getRegister);
app.get("/logout", logoutHandler);

app.get("/saved", getSavedCities);
app.get("/save/:city", saveCityHandler);
app.get("/unsave/:city", unsaveCityHandler);

app.get("/cpanel", getAdminPanel);

app.post("/login", loginHandler);
app.post("/register", registerHandler);

app.post("/switchAutomaticUpdate", automaticUpdateHandler);
app.get("/cpanel/delete-city/:city", deleteCityHandler);
app.get("/cpanel/update-city/:city", getUpdateCity);
app.post("/cpanel/update-city/:city", updateCityHandler);
app.get("/cpanel/get-weather-data", getWeatherData);

app.get("*", notFoundHandler);

mongoose.connect(process.env["APP_DB"])
    .then(() => {
        setInterval(updateWeather, tenMinutes);
        app.listen(3000);
    });
