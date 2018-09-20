import sqlite3 from "sqlite3";

export let run = (onDB: ((db: sqlite3.Database) => any)) => {
    const db = new sqlite3.Database("./data/db.db", (err) => {
        if (err) {
            console.error("Failed to connect to the database.");
            console.error(err);
        }
    });
    onDB(db);
    db.close();
};

export let setupDB = (db: sqlite3.Database) => {
    db.serialize(function () {
    });
};

