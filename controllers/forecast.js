const Forecast = require("../models/Forecast");

async function getAllCitiesForecast(req, res) {
    const forecasts = [];
    const response = await Forecast.find().populate("city");
    response.forEach(forecast => {
        forecast._doc.name = forecast._doc.city.name;
        forecasts.push(forecast._doc);
    });
    res.render("forecasts", { title: "پیش بینی آب و هوای امروز شهرها", forecasts });
}

module.exports = { getAllCitiesForecast };