import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
} 
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  private apiKey: string;
  private baseURL: string;
  private cityName: string;
  

  // TODO: Define the baseURL, API key, and city name properties
  constructor() {
    this.apiKey = process.env.API_KEY || '';
    this.baseURL = process.env.API_BASE_URL || '';
    this.cityName = '';
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geocodeQuery = `?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
    return `${this.baseURL}/geo/1.0/direct${geocodeQuery}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    const weatherQuery = `?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
    return `${this.baseURL}/data/2.5/forecast${weatherQuery}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const geocodeQuery = this.buildGeocodeQuery();
    const response = await fetch(geocodeQuery);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    const locationData = await response.json();
    return this.destructureLocationData(locationData[0]);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherQuery);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const weatherData = await response.json();
    return weatherData;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const currentWeather: Weather = {
      city: this.cityName,
      date: new Date(response.dt * 1000).toLocaleDateString(),
      icon: response.weather[0].icon,
      iconDescription: response.weather[0].description,
      tempF: response.main.temp,
      windSpeed: response.wind.speed,
      humidity: response.main.humidity
    };
    return currentWeather;  
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray : Weather[]= [];
    
    let previousDate = '';

    for(const day of weatherData) {
      if(previousDate !== day.dt_txt.slice(0, 10)) {
        
        forecastArray.push(
        new Weather(
          this.cityName,
          new Date(day.dt * 1000).toLocaleDateString(),
          day.weather[0].icon,
          day.weather[0].description,
          day.main.temp,
          day.wind.speed,
          day.main.humidity
        ));
        previousDate = day.dt_txt.slice(0,10);
      };
    };
    return [currentWeather, ...forecastArray];
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;

    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list.slice(1));
    
    return forecastArray;
  }
}

export default new WeatherService();
