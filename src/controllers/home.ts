import { Request, Response } from "express";
import * as database from "../models/Database";

/**
 * GET /
 */
export let index = (req: Request, res: Response) => {
  res.render("home");
};

/**
 * GET /earthquakes
 */
export let earthquakes = (req: Request, res: Response) => {
  res.render("earthquakes");
};

/**
 * GET /weatheralerts
 */
export let weatheralerts = (req: Request, res: Response) => {
  res.render("weatheralerts");
};
