import webpush from 'web-push';

export class NotificationService {
  #publicKey = 'BIKAYUcYP8q6CbBFRfBJsOz9zJcl8siDpqr7vAu5I1Y8q5M0bW2UGpimc4lwzEVD4VlpUzeZ7HRyNjh6J7xOOQI';
  #privateKey = 'wprmUJjkAFtgeotuD11T8KNcvEGFZnOc3KCrmpIuha0';
  #endpoint;
  #keys;

  constructor(endpoint, keys) {
    this.#endpoint = endpoint;
    this.#keys = keys;
  }

  send = async (title, body) => {
    try {
      const subscription = { endpoint: this.#endpoint, keys: this.#keys };
      webpush.setVapidDetails(
        'mailto:gnerisdev@email.com',
        this.#publicKey,
        this.#privateKey
      );

      const payload = JSON.stringify({
        title: title,
        body: body,
        image:
          'https://fastly.picsum.photos/id/481/200/300.jpg?hmac=mlbIyGYg8TMyId9tAwMZz1VppVzNObkpL0cVVxnjTVo',
      });
      const response = await webpush.sendNotification(subscription, payload);
      return response;
    } catch (error) {
      throw new Error(error);
    }
  };
}
