import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import LoginPrompt from "./LoginPrompt";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  push,
  query,
  orderByKey,
  onValue,
} from "firebase/database";

const GEOCODING_API_URL =
  "https://geocoding-api.open-meteo.com/v1/search?name=";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

const DISPLAYED_CITIES = [];

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsOIOEjEUF5jEQ7DCYB5CTRfPE8pmYhTg",
  authDomain: "hci-p3.firebaseapp.com",
  projectId: "hci-p3",
  storageBucket: "hci-p3.appspot.com",
  messagingSenderId: "937051622091",
  appId: "1:937051622091:web:4b5d6e6620bf29891de94e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

function App() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedCities, setSavedCities] = useState(DISPLAYED_CITIES);
  const [currentCity, setCurrentCity] = useState("");

  // useEffect(() => {
  //   seeDataFor(STARTING_CITIES[0]);
  // }, []);

  const handleUserLogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // signed in
        const user = userCredential.user;
        setLoggedInUser(user);
        // get users cities
        getUsersCities(user.uid);
      })
      .catch((error) => {
        // error
        console.log(error.message);
      });
  };

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
      alert("Already have this city.");
      return;
    }
    // get coords for input name
    seeDataFor(name);
    addCityToUser(name);
  };

  const getUsersCities = (uid) => {
    const savedCitiesRef = ref(db, "users/" + uid + "/cities");
    onValue(savedCitiesRef, (snapshot) => {
      const usersCities = [];
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        usersCities.push(childData);
      });
      setSavedCities(usersCities);
    }, {
      onlyOnce: true
    });
  };

  const addCityToUser = (name) => {
    const userCityRef = ref(db, "users/" + loggedInUser.uid + "/cities");
    set(push(userCityRef), name);
  };

  const seeDataFor = async (name) => {
    let cityCoords = await getCityCoords(name);
    let weatherData = await getWeatherForLocation(cityCoords);

    setCurrentCity(name);
    setData(weatherData);
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      setLoggedInUser("");
      setData([]);
      setSavedCities([]);
      setCurrentCity("")
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className="App">
      <h1>Weather Application</h1>
      {loggedInUser === "" ? (
        <LoginPrompt handleLogin={handleUserLogin} />
      ) : (
        <div>
          <div className="dataHeader">
            <p>User: {loggedInUser.email}</p>
            <button className="cityButton" onClick={handleLogout}>Logout</button>
          </div>
          <hr></hr>
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
      )}
    </div>
  );
}

export default App;
