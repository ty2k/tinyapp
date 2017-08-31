# TinyApp

A URL shortening service built with [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/), and [EJS](http://www.embeddedjs.com/). This project is coursework from [Lighthouse Labs](https://github.com/lighthouse-labs).

## Installation

Clone this repository and `npm install` inside of the project directory.

## Run
`node express_server.js` will launch the app on your environment's default port, or port 8080 if none is set.

```js
const PORT = process.env.PORT || 8080;
```

## Notes

Currently, users and URLs are hard-coded into the express_server.js app.

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

[Tyler Krys](https://tylerkrys.ca) made this to learn about web development.