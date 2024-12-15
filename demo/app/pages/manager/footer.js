import { useEffect, useState } from 'react';
import styles from './pos.module.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

const Footer = ({handleMenuModalClick, handleEmployeeInfoClick, handleXReportClick, handleZReportClick, handleSalesReportClick, handleInventoryReportClick}) => {
  const [currentTime, setCurrentTime] = useState({ date: '', time: '' });
  const [weatherData, setWeatherData] = useState(null);

  // Function to fetch real-time data
  const fetchTime = async () => {
    try {
      const response = await axios.get('https://worldtimeapi.org/api/timezone/Etc/UTC');
      const data = response.data;
      const dateTime = new Date(data.utc_datetime);
      setCurrentTime({
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString(),
      });
    } catch (error) {
      console.error("Error fetching time:", error);
    }
  };

  // Set up an interval to fetch time every second
  useEffect(() => {
    fetchTime();  // Fetch initial time
    const intervalId = setInterval(fetchTime, 60000);  // Update time every second

    // Clear the interval on cleanup
    return () => clearInterval(intervalId);
  }, []);

  const fetchWeatherData = async () => {
    const apiKey = 'b2194f151958777dc04aa218c55b2dd0';
    const city = 'College Station';  // Replace with the desired city name or use coordinates for accuracy
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        console.error('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);
  

  return (
    <footer className={styles.footer}>
      <div className={styles.buttonContainer}>
      <button onClick={handleMenuModalClick} className={styles.reportButton}>Update Menu</button>
      <button onClick={handleEmployeeInfoClick} className={styles.reportButton}>Employee Information</button>
      <button onClick={handleXReportClick} className={styles.reportButton}>X Report</button>
      <button onClick={handleZReportClick} className={styles.reportButton}>Z Report</button>
      <button onClick={handleSalesReportClick} className={styles.reportButton}>Sales Report</button>
      <button onClick={handleInventoryReportClick} className={styles.reportButton}>Inventory Report</button>
      </div>
      <div className={styles.infoContainer}>
        <p>Date: {currentTime.date}</p> 
        <p>Time: {currentTime.time}</p> 
        {weatherData ? (
          <>
            <h3>Weather in {weatherData.name}</h3>
            <p>Temperature: {weatherData.main.temp} °C</p>
            <p>Condition: {weatherData.weather[0].description}</p>
          </>
        ) : (
          <p>Loading weather data...</p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
