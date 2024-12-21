const fs = require("fs");
const City = require("../models/City");
const Forecast = require("../models/Forecast");
const Weather = require("../models/Weather");
const User = require("../models/User");

function getCities() {
    const rawCities = fs.readFileSync("cities.json", "utf-8");
    const jsonData = JSON.parse(rawCities);
    return jsonData;
}

let enabled = false;
async function updateWeather() {
    if (!enabled)
        return;
    const cityList = getCities();
    const curRequests = cityList.map(c => fetch(`https://one-api.ir/weather/?token=574940:6536be411e121&action=current&city=${c}`));
    const curResponses = await Promise.all(curRequests);
    const curResults = await Promise.all(curResponses.map(res => res.json()));
    const forRequests = cityList.map(c => fetch(`https://one-api.ir/weather/?token=574940:6536be411e121&action=daily&city=${c}`));
    const forResponses = await Promise.all(forRequests);
    const forResults = await Promise.all(forResponses.map(res => res.json()));

    let weathers = cityList.map((name, index) => ({
        name,
        temp: curResults[index].result.main.temp,
        humidity: curResults[index].result.main.humidity,
        windSpeed: curResults[index].result.wind.speed,
        description: curResults[index].result.weather[0].description,
        morningTemp: forResults[index].result.list[0].temp.morn,
        eveningTemp: forResults[index].result.list[0].temp.eve,
        nightTemp: forResults[index].result.list[0].temp.night,
    }));

    for (const w of weathers) {
        const found = await City.findOne({ name: w.name });
        if (!found) {
            const city = await new City({ name: w.name }).save();
            await new Weather({ city: city._id, temp: w.temp, humidity: w.humidity, windSpeed: w.windSpeed, description: w.description }).save();
            await new Forecast({ city: city._id, morningTemp: w.morningTemp, eveningTemp: w.eveningTemp, nightTemp: w.nightTemp }).save();
        } else {
            await Weather.updateOne({ city: found._id }, {
                $set: {
                    temp: w.temp,
                    humidity: w.humidity,
                    windSpeed: w.windSpeed,
                    description: w.description
                }
            });
            await Forecast.updateOne({ city: found._id }, {
                $set: {
                    monringTemp: w.morningTemp,
                    eveningTemp: w.eveningTemp,
                    nightTemp: w.nightTemp
                }
            });
        }
    }
    console.log("UPDATED");
}

const disableUpdateWeather = () => enabled = false;
const enableUpdateWeather = () => enabled = true;
function automaticUpdateHandler(req, res) {
    const shouldUpdate = req.body?.shouldUpdate;
    if (shouldUpdate)
        enableUpdateWeather();
    else
        disableUpdateWeather();
    res.status(200).json({ status: "success" });
}

async function getAdminPanel(req, res) {
    if (!req.session.user?.isAdmin) {
        return res.redirect("/");
    }

    const cities = await City.find();
    res.render("control-panel", { title: "پنل مدیریت", shouldUpdate: enabled, cities, cpanel: true });
}


async function deleteCityHandler(req, res) {
    if (req.session.user?.isAdmin) {
        const name = req.params.city;
        const city = await City.findOne({ name });
        if (!city)
            return res.redirect("/cpanel");
        await City.deleteOne({ name });
        await Weather.deleteOne({ city: city._id })
        await Forecast.deleteOne({ city: city._id });
        await User.updateMany({}, { $pull: { savedCities: city._id } });
        res.redirect("/cpanel");
    } else {
        res.redirect("/");
    }
}

async function getUpdateCity(req, res) {
    if (req.session.user?.isAdmin) {
        const name = req.params.city;
        const city = await City.findOne({ name });
        if (!city)
            return res.redirect("/cpanel");
        const weather = await Weather.findOne({ city: city._id }).populate("city");
        weather.name = weather.city.name;
        res.render("update-city", { title: "ویرایش اطلاعات", city: weather });
    } else {
        res.redirect("/");
    }
}

async function updateCityHandler(req, res) {
    if (!req.session.user?.isAdmin)
        return res.redirect("/");

    const { temp, humidity, windSpeed, description } = req.body;
    const { city: name } = req.params;
    const city = await City.findOne({ name });
    if (!city)
        return res.redirect("/cpanel");
    await Weather.updateOne({ city: city._id }, {
        $set: {
            temp, humidity, windSpeed, description
        }
    });
    res.redirect("/");
}

async function getWeatherData(req, res) {
    enableUpdateWeather();
    await updateWeather();
    disableUpdateWeather();
    res.redirect("/");
}


module.exports = {
    getAdminPanel,
    updateWeather,
    automaticUpdateHandler,
    deleteCityHandler,
    getUpdateCity,
    updateCityHandler,
    getWeatherData
}; 