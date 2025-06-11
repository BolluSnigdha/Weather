const apiKey = '472ec3ab5c2a634f557dffc86f6009ca'; // Your API key

function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetchWeatherData(url);
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        document.getElementById('loading').style.display = 'block';
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            fetchWeatherData(url);
        }, error => {
            alert("Unable to get location.");
            document.getElementById('loading').style.display = 'none';
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherData(url) {
    document.getElementById('loading').style.display = 'block';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);
            document.getElementById('loading').style.display = 'none';

            const weatherResult = document.getElementById('weatherResult');
            if (data.cod === 200) {
                weatherResult.innerHTML = `
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icon">
                    <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
                    <p><strong>Feels Like:</strong> ${data.main.feels_like} °C</p>
                    <p><strong>Weather:</strong> ${data.weather[0].description}</p>
                    <p><strong>Humidity:</strong> ${data.main.humidity} %</p>
                    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
                    <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
                    <p><strong>Sunrise:</strong> ${convertUnixTime(data.sys.sunrise)} </p>
                    <p><strong>Sunset:</strong> ${convertUnixTime(data.sys.sunset)} </p>
                `;

                updateBackground(data.weather[0].main);
                fetchForecastData(data.name);
            } else {
                weatherResult.innerHTML = `<p style="color:red;">City not found! (${data.message})</p>`;
                updateBackground("");
                document.getElementById('forecastResult').innerHTML = "";
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('weatherResult').innerHTML = `<p style="color:red;">Error fetching weather data. Try again later.</p>`;
            updateBackground("");
            document.getElementById('forecastResult').innerHTML = "";
        });
}

function fetchForecastData(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Forecast Response:", data);

            const forecastResult = document.getElementById('forecastResult');
            forecastResult.innerHTML = "<h3>5-Day Forecast</h3>";

            const list = data.list;
            const daysShown = new Set();

            list.forEach(item => {
                const dateTime = item.dt_txt;
                const date = dateTime.split(" ")[0];
                const time = dateTime.split(" ")[1];

                if (time === "12:00:00" && !daysShown.has(date)) {
                    daysShown.add(date);

                    forecastResult.innerHTML += `
                        <div style="margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                            <strong>${date}</strong><br>
                            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon"><br>
                            <p>Temp: ${item.main.temp} °C</p>
                            <p>Weather: ${item.weather[0].description}</p>
                        </div>
                    `;
                }
            });
        })
        .catch(error => {
            console.error('Forecast fetch error:', error);
            document.getElementById('forecastResult').innerHTML = `<p style="color:red;">Error fetching forecast data.</p>`;
        });
}

function convertUnixTime(unixTime) {
    const date = new Date(unixTime * 1000);
    return date.toLocaleTimeString();
}

function updateBackground(weatherMain) {
    const body = document.body;
    let imageUrl = "";

    switch (weatherMain.toLowerCase()) {
        case 'clear':
            imageUrl = 'https://source.unsplash.com/1600x900/?clear-sky,sunny';
            break;
        case 'clouds':
            imageUrl = 'https://source.unsplash.com/1600x900/?cloudy';
            break;
        case 'rain':
        case 'drizzle':
            imageUrl = 'https://source.unsplash.com/1600x900/?rain';
            break;
        case 'thunderstorm':
            imageUrl = 'https://source.unsplash.com/1600x900/?thunderstorm';
            break;
        case 'snow':
            imageUrl = 'https://source.unsplash.com/1600x900/?snow';
            break;
        case 'mist':
        case 'fog':
            imageUrl = 'https://source.unsplash.com/1600x900/?fog';
            break;
        default:
            imageUrl = 'https://source.unsplash.com/1600x900/?weather';
            break;
    }

    body.style.backgroundImage = `url('${imageUrl}')`;
}
