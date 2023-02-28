import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

const GEOCODING_API_URL =
  "https://geocoding-api.open-meteo.com/v1/search?name=";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

const STARTING_CITIES = ["Austin", "San Antonio", "Houston"];

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedCities, setSavedCities] = useState(STARTING_CITIES);
  const [currentCity, setCurrentCity] = useState("");

  useEffect(() => {
    seeDataFor(STARTING_CITIES[0]);
  }, [])

  const getCityCoords = async (name) => {
    try {
      const response = await fetch(GEOCODING_API_URL + name);
      const json = await response.json();
      let coords = {
        lat: json.results[0].latitude,
        long: json.results[0].longitude,
      };

      if (!savedCities.includes(name)) {
        setSavedCities([...savedCities, name]);
      }
      return coords;
    } catch (e) {
      alert("Invalid City Name!");
    }
  };

  const getWeatherForLocation = async (cityCoords) => {
    let query =
      "?latitude=" +
      cityCoords.lat +
      "&longitude=" +
      cityCoords.long +
      "&hourly=temperature_2m&timeformat=unixtime&temperature_unit=fahrenheit&timezone=CST";
    try {
      const response = await fetch(WEATHER_API_URL + query);
      const json = await response.json();

      let tempData = [];

      for (let i = 0; i < json.hourly.time.length; i++) {
        let date = new Date(json.hourly.time[i] * 1000);
        let readableTime = date.toLocaleTimeString("en-US");

        tempData.push({
          time: readableTime,
          temp: json.hourly.temperature_2m[i] + " F",
        });
      }
      return tempData;
    } catch (e) {
      console.log("Error:" + e);
    }
  };

  const onAddCity = async () => {
    if (searchQuery.length === 0) {
      return;
    }
    let name = searchQuery;
    setSearchQuery("");
    if (savedCities.includes(name)) {
      alert("Already have this city.")
      return;
    }
    // get coords for input name
    seeDataFor(name);
  };

  const seeDataFor = async (name) => {
    let cityCoords = await getCityCoords(name);
    let weatherData = await getWeatherForLocation(cityCoords);

    setCurrentCity(name);
    setData(weatherData);
  };

  return (
    <div className="App">
      <h1>Weather Application</h1>
      <div className="cityButtons">
        {savedCities.map((name) => (
          <button
            className={
              "cityButton" + (name === currentCity ? " currentCity" : "")
            }
            onClick={() => {
              seeDataFor(name);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="searchContainer">
        <input
          className="inputCity"
          type="text"
          value={searchQuery}
          placeholder="Search for a City"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="searchButton" onClick={onAddCity}>
          +
        </button>
      </div>
      <p className="cityHeader">
        {currentCity === "" ? "" : currentCity + " Temperature Forcast"}
      </p>
      <div className="dataHeader">
        <p className="dataHeaderItem">Time (CST)</p>
        <p className="dataHeaderItem">Temperature</p>
      </div>
      <hr />
      {data.map((tempIdx) => (
        <div className="dataHeader">
        <p className="dataHeaderItem">{tempIdx.time}</p>
        <p className="dataHeaderItem">{tempIdx.temp}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
