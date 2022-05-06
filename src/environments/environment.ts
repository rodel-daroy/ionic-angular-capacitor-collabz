// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api: {
    url: 'http://192.168.1.84:3004/v1'
  },
  firebaseConfig: {
    apiKey: "AIzaSyCTVnhjgeDByJe0UcQkEI3m5L9xhaOYOGI",
    authDomain: "collabz-a9f09.firebaseapp.com",
    projectId: "collabz-a9f09",
    storageBucket: "collabz-a9f09.appspot.com",
    messagingSenderId: "313751134101",
    appId: "1:313751134101:web:af7f2ec34a6aece335a09c",
    measurementId: "G-TQFVTFYB7D"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
