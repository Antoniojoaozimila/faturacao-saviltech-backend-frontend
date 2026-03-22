import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = ''
} = process.env

if (!DB_NAME) {
  console.error(
    'Erro: defina DB_NAME no .env (nome da base de dados). Em Docker, use o mesmo valor que MYSQL_DATABASE na raiz.'
  )
  process.exit(1)
}

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function testConnection() {
  const conn = await pool.getConnection()
  await conn.ping()
  conn.release()
}

