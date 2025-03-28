import axios from 'axios';

export class TomtomService {
  #urlBase = 'https://api.tomtom.com';
  #key = 'GmL5wOEl3iWP0n1l6O5sBV0XKo6gHwht';

  findAddress = async ({ street, district, city, zipCode, number }) => {
    try {
      const query = `${street},${number},${zipCode},${district},${city}`;
      const { data: address } = await axios.get(
        this.#urlBase +
        `/search/2/geocode/${encodeURIComponent(query)}.json?key=${this.#key}`
      );

      return address.results;
    } catch (error) {
      throw new Error(error);
    }
  };

  getDistance = async (originLat, originLon, destinationLat, destinationLon) => {
    try {
      const query = `${originLat},${originLon}:${destinationLat},${destinationLon}`;
      const { data } = await axios.get(
        this.#urlBase +
        `/routing/1/calculateRoute/${query}/json?key=${this.#key}`
      );

      return data;
    } catch (error) {
      throw new Error(error);
    }
  };
}
