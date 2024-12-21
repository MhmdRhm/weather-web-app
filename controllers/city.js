const City = require("../models/City");
const Weather = require("../models/Weather");
const Forecast = require("../models/Forecast");
const User = require("../models/User");


async function getCityWeatherDetails(req, res) {
    const name = req.params.city;
    const city = await City.findOne({ name });
    if (!city) {
        return res.render("404");
    }

    const weather = await Weather.findOne({ city: city._id });
    const forecast = await Forecast.findOne({ city: city._id });
    res.render(
        "details",
        {
            title: `آب و هوای ${city.name}`,
            ...weather._doc,
            ...forecast._doc,
            name: city.name,
            id: city._id.toString()
        });
};

async function getAllCitiesWeather(req, res) {
    const weathers = await Weather.find().populate('city');
    weathers.forEach(weather => {
        weather.name = weather.city.name;
        weather._id = weather.city._id.toString();
    });

    if (!req.session.user)
        return res.render("home", { title: "آب و هوای فعلی شهرهای کشور", cities: weathers });
    else {
        const user = await User.findOne({ username: req.session.user.username });
        res.render(
            "home",
            {
                title: "آب و هوای فعلی شهرهای کشور",
                cities: weathers,
                savedCities: user.savedCities
            });
    }
}

async function getSavedCities(req, res) {
    if (!req.session.user)
        return res.redirect("/login");

    const user = await User.findOne({ username: req.session.user.username });
    const cities = await Weather.find({ city: user.savedCities }).populate('city');
    if (cities.length < 1)
        return res.render("savedCities", { title: "شهرهای ذخیره شده", cities: [] });

    cities.forEach(c => {
        c.name = c.city.name;
    });

    res.render("savedCities", { title: "شهرهای ذخیره شده", cities });
}

function saveCityHandler(req, res) {
    if (req.session.user) {
        let user;
        User.findOne({ username: req.session.user.username })
            .then(fetchedUser => {
                user = fetchedUser;
                if (user) {
                    return City.findOne({ name: req.params.city });
                } else {
                    throw new Error("Something went wrong! User not found.");
                }
            })
            .then(city => {
                if (city) {
                    if (user.savedCities.find(c => c === city._id.toString())) {
                        throw new Error("Already saved city");
                    } else {
                        user.savedCities.push(city._id.toString());
                        req.session.user.savedCities.push(city._id);
                        return user.save();
                    }

                } else {
                    throw new Error("Something went wrong! City not found.");
                }
            })
            .then(() => {
                const reqSourceUrl = req.headers.referer.split("/");
                console.log(reqSourceUrl);
                if (reqSourceUrl.length === 4) {
                    res.redirect("/saved");
                } else {
                    res.redirect(`/city/${reqSourceUrl[reqSourceUrl.length - 1]}`);
                }
            })
            .catch(er => res.send(er.message));
    } else {
        res.redirect("/login");
    }
}

function unsaveCityHandler(req, res) {
    if (!req.session.user)
        return res.redirect("/login");

    const name = req.params.city;
    let user;
    User.findOne({ username: req.session.user.username })
        .then(fetchedUser => {
            user = fetchedUser;
            return City.findOne({ name });
        })
        .then(city => {
            user.savedCities = user.savedCities.filter(c => c !== city._id.toString());
            req.session.user.savedCities = req.session.user.savedCities.filter(c => c !== city._id.toString());
            return user.save();
        })
        .then(() => {
            const reqSourceUrl = req.headers.referer.split("/");
            if (reqSourceUrl[reqSourceUrl.length - 1] === "saved")
                return res.redirect("/saved");
            else if (reqSourceUrl[3] === "city")
                return res.redirect(`/city/${reqSourceUrl[reqSourceUrl.length - 1]}`);
            res.redirect("/");
        })
        .catch(er => res.send("Interval server error."));
}

module.exports = {
    getCityWeatherDetails,
    getAllCitiesWeather,
    getSavedCities,
    saveCityHandler,
    unsaveCityHandler
};