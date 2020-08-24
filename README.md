# TinyApp

A URL shortening service built with [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/), and [EJS](https://ejs.co/).

## Installation

Clone this repository and `npm install` inside of the project directory.

## Run
`npm run start`. A `PORT` environment variable can be specified, or 8080 is used as a default if none is set.

```js
const PORT = process.env.PORT || 8080;
```

## Notes

There is no data persistence for users and URLs.

There is no logic to check the validity of URLs being entered by users, so URLs missing protocols won't redirect.

## Dependencies

- [bcrypt](https://www.npmjs.com/package/bcrypt) to hash passwords
- [body-parser](https://www.npmjs.com/package/body-parser) to parse request bodies
- [cookie-session](https://www.npmjs.com/package/cookie-session) to store session data on the client within a cookie
- [ejs](https://www.npmjs.com/package/ejs) for templating
- [express](https://www.npmjs.com/package/express) as a web server

## Screenshots

Login page
![TinyApp login page](https://raw.githubusercontent.com/ty2k/tinyapp/master/docs/Screenshot-TinyApp-login-page.png)

URLs index for authenticated user
![TinyApp URLs index page for authenticated user](https://raw.githubusercontent.com/ty2k/tinyapp/master/docs/Screenshot-TinyApp-shortened-URLs-index.png)

## Contact Author

[Tyler Krys](https://tylerkrys.ca) made this.
