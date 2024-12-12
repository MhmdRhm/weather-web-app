const express = require("express");
const mongoose = require("mongoose");
const { getAllCitiesWeather, getCityWeatherDetails, getSavedCities, saveCityHandler, unsaveCityHandler } = require("./controllers/city");
const { getAllCitiesForecast } = require("./controllers/forecast");
const notFoundHandler = require("./controllers/404");
const { getLogin, loginHandler, logoutHandler, getRegister, registerHandler } = require("./controllers/auth");
const { getAdminPanel } = require("./controllers/admin");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();
app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1/session-store" })
}));
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session?.user;
        res.locals.user.isAdmin = req.session?.user?.isAdmin;
    }
    next();
});

app.get("/", getAllCitiesWeather);
app.get("/city/:name", getCityWeatherDetails);
app.get("/forecasts", getAllCitiesForecast);

app.get("/login", getLogin);
app.get("/register", getRegister);
app.get("/logout", logoutHandler);

app.get("/cpanel", getAdminPanel);
app.get("/saved", getSavedCities);
app.get("/save/:city", saveCityHandler)
app.get("/unsave/:city", unsaveCityHandler);

app.post("/login", loginHandler);
app.post("/register", registerHandler);

app.get("*", notFoundHandler);

mongoose.connect("mongodb://127.0.0.1:27017/weather_db")
    .then(() => {
        app.listen(process.env.PORT || 3000);
    });
