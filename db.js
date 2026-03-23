import Database from "better-sqlite3"

const db = new Database('/db_data/postsBuffer.db')
const createTableStmt = `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post TEXT NOT NULL
  )`

db.exec(createTableStmt) // create database if it doesn't exist to store posts that don't get posted by the bot due to error

export default db
