const Forecast = require("../models/Forecast");

async function getAllCitiesForecast(_, res) {
    let forecasts = await Forecast.find().populate("city");
    forecasts = forecasts.map(f => ({ ...f._doc, name: f.city.name }));
    res.render("forecasts", { title: "پیش بینی آب و هوای امروز شهرها", forecasts });
}

module.exports = { getAllCitiesForecast };