export function getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
}> {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {

            reject("Geolocation is not supported");

            return;

        }

        navigator.geolocation.getCurrentPosition(

            (position) => {

                resolve({

                    latitude: position.coords.latitude,

                    longitude: position.coords.longitude,

                });

            },

            (error) => {

                reject(error.message);

            },

            {

                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 0,

            }

        );

    });

}