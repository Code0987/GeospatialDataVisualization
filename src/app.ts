import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import logger from "./util/logger";
import dotenv from "dotenv";
import path from "path";
import sqlite3 from "sqlite3";

// Controllers (route handlers)
import * as homeController from "./controllers/home";

// Create Express server
const app = express();

// Init DB
import * as database from "./models/Database";

database.run(db => {
  database.setupDB(db);
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
app.use("/data", express.static(path.join(__dirname, "../data")));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);

app.get("/earthquakes", homeController.earthquakes);

app.get("/weatheralerts", homeController.weatheralerts);

export default app;