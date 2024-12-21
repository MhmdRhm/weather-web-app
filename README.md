## Prerequisites 
In order to install and set things up you'll need to have:
1. [Mongodb Daemon](https://www.mongodb.com/try/download/community)
3. [Mongodb Compass](https://www.mongodb.com/try/download/compass) (optional)

## Installation
1. git clone https://github.com/mhmdrhm/weather-web-app.git
2. cd weather-web-app
3. npm install (to install all of the project's dependencies)
4. create `.env` file within your project's root directory
5. add two variables, `SESSION_DB` and `APP_DB`, and assign them the paths to their associated databases.
6. node `server.js`
7. open a browser and head over to localhost:3000
