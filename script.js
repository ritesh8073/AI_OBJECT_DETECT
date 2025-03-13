document.addEventListener("DOMContentLoaded", async () => {
    const apiKey = "2e2a57960836800a7ddd9e621b1c1f60"; // Use environment variables in production
    const weatherResult = document.getElementById("weatherResult");
    const cityName = document.getElementById("cityName");
    const forecastContainer = document.getElementById("forecast");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const citySearch = document.getElementById("citySearch");
    const searchButton = document.getElementById("searchButton");
    const refreshButton = document.getElementById("refreshButton");
    const locationCache = {};

    async function getLocationAndWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const cacheKey = `${latitude},${longitude}`;
                if (!locationCache[cacheKey]) {
                    await fetchWeather(latitude, longitude);
                    locationCache[cacheKey] = true;
                } else {
                    displayCachedData(cacheKey);
                }
            }, handleLocationError);
        } else {
            handleLocationError();
        }
    }

    function handleLocationError() {
        cityName.innerText = "Geolocation not supported or denied.";
        weatherResult.innerHTML = `<p class="error">Enable location for weather updates.</p>`;
    }

    async function fetchWeather(lat, lon) {
        try {
            showLoading();
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            if (!weatherResponse.ok || !forecastResponse.ok) {
                throw new Error("Weather data fetch failed.");
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            displayWeather(weatherData);
            displayForecast(forecastData);
        } catch (error) {
            weatherResult.innerHTML = `<p class="error">${error.message}</p>`;
        } finally {
            hideLoading();
        }
    }

    async function fetchWeatherByCity(city) {
        try {
            showLoading();
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            if (!weatherResponse.ok || !forecastResponse.ok) {
                throw new Error("Weather data fetch failed.");
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            displayWeather(weatherData);
            displayForecast(forecastData);
        } catch (error) {
            weatherResult.innerHTML = `<p class="error">${error.message}</p>`;
        } finally {
            hideLoading();
        }
    }

    function displayWeather(data) {
        const { name, main, weather, wind, sys } = data;
        const weatherType = weather[0].main;
        const weatherIcon = getWeatherIcon(weatherType);
        const temperature = main.temp;
        const description = weather[0].description;
        const humidity = main.humidity;
        const windSpeed = wind.speed;
        const country = sys.country;
        const suggestion = getWeatherSuggestion(weatherType);

        cityName.innerText = `${name}, ${country}`;
        weatherResult.innerHTML = `
            <div class="weather-icon text-4xl mb-2">${weatherIcon.icon}</div>
            <h2 class="text-2xl">${name}</h2>
            <p>Temperature: ${temperature} °C</p>
            <p>Weather: ${description}</p>
            <p>Humidity: ${humidity} %</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p class="suggestion">${suggestion}</p>
        `;

        document.body.className = weatherIcon.class;
    }

    function displayForecast(data) {
        forecastContainer.innerHTML = "<h3 class='text-xl mb-2'>5-Day Forecast</h3>";

        for (let i = 0; i < data.list.length; i += 8) {
            const forecast = data.list[i];
            const date = new Date(forecast.dt * 1000).toDateString();
            const temp = forecast.main.temp;
            const weatherType = forecast.weather[0].main;
            const weatherIcon = getWeatherIcon(weatherType);

            forecastContainer.innerHTML += `
                <div class="forecast-item flex items-center justify-between mb-2">
                    <p>${date}</p>
                    <div class="weather-icon text-2xl">${weatherIcon.icon}</div>
                    <p>${temp} °C</p>
                </div>
            `;
        }
    }

    function getWeatherIcon(weatherType) {
        const icons = {
            Clear: { icon: "☀️", class: "sunny" },
            Rain: { icon: "🌧️", class: "rainy" },
            Clouds: { icon: "☁️", class: "cloudy" },
            Snow: { icon: "❄️", class: "snowy" },
            Thunderstorm: { icon: "🌩️", class: "thunderstorm" },
            Fog: { icon: "🌫️", class: "foggy" },
            Mist: { icon: "🌫️", class: "misty" },
            Drizzle: { icon: "🌦️", class: "drizzly" },
            Haze: { icon: "🌁", class: "hazy" },
            Default: { icon: "🌍", class: "default" }
        };

        return icons[weatherType] || icons["Default"];
    }

    function getWeatherSuggestion(weatherType) {
        const suggestions = {
            Clear: "Perfect day for a walk! ☀️",
            Rain: "Don't forget your umbrella! 🌧️",
            Clouds: "A cozy day for a book and coffee. ☁️",
            Snow: "Great day for hot chocolate! ❄️",
            Thunderstorm: "Stay indoors and stay safe! ⚡",
            Fog: "Drive carefully! Visibility is low. 🌫️",
            Mist: "A refreshing, misty day. Enjoy! 🌫️",
            Drizzle: "A light rain—maybe grab a jacket. 🌦️",
            Haze: "Air quality might be low, wear a mask! 🌁",
            Default: "Enjoy your day! 🌍"
        };

        return suggestions[weatherType] || suggestions["Default"];
    }

    function showLoading() {
        weatherResult.innerHTML = `<div class="loader"></div>`;
    }

    function hideLoading() {
        weatherResult.innerHTML = "";
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    searchButton.addEventListener("click", () => {
        const city = citySearch.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        }
    });

    refreshButton.addEventListener("click", getLocationAndWeather);

    getLocationAndWeather();
});
