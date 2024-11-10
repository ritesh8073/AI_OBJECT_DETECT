document.getElementById('getWeather').addEventListener('click', getWeather);

async function getWeather() {
    const city = document.getElementById('city').value;
    const apiKey = '2e2a57960836800a7ddd9e621b1c1f60'; // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        document.getElementById('weatherResult').innerText = error.message;
    }
}

function displayWeather(data) {
    const weatherResult = document.getElementById('weatherResult');
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;

    weatherResult.innerHTML = `
        <div class="weather-icon ${weatherIcon.class}">${weatherIcon.icon}</div>
        <h2>${data.name}</h2>
        <p>Temperature: ${temperature} °C</p>
        <p>Weather: ${description}</p>
        <p>Humidity: ${humidity} %</p>
    `;
    weatherResult.style.opacity = 1; // Fade in effect

    // Apply animation based on weather condition
    weatherResult.className = `weather-result ${weatherIcon.class}`;
}

function getWeatherIcon(weatherType) {
    let icon = '';
    let className = '';

    switch (weatherType) {
        case 'Clear':
            icon = '☀️';  // Sunny
            className = 'sunny';
            break;
        case 'Rain':
            icon = '🌧️';  // Rainy
            className = 'rainy';
            break;
        case 'Clouds':
            icon = '☁️';  // Cloudy
            className = 'cloudy';
            break;
        case 'Snow':
            icon = '❄️';  // Snowy
            className = 'snowy';
            break;
        case 'Thunderstorm':
            icon = '🌩️';  // Thunderstorm
            className = 'thunderstorm';
            break;
        default:
            icon = '🌍';  // Default icon for unknown weather
            className = 'default';
    }

    return { icon, class: className };
}
