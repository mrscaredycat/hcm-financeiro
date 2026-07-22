import 'dotenv/config'
import oracledb from 'oracledb'

async function run() {
  const user = process.env.MEGA_DB_USER
  const password = process.env.MEGA_DB_PASSWORD
  const connectString = process.env.MEGA_DB_CONNECTION_STRING

  const isWindows = process.platform === 'win32'
  if (isWindows) {
    const winLibDir = process.env.ORACLE_LIB_DIR_WIN
    if (winLibDir) {
      oracledb.initOracleClient({ libDir: winLibDir })
    } else {
      oracledb.initOracleClient()
    }
  }

  let connection
  try {
    connection = await oracledb.getConnection({ user, password, connectString })
    
    // Check FIN_CONTACORRENTE
    const res = await connection.execute(`SELECT column_name FROM all_tab_columns@HCMENG WHERE table_name = 'GLO_AGENTES' AND owner = 'MEGA' AND (column_name LIKE '%FANTASIA%' OR column_name LIKE '%APELIDO%' OR column_name LIKE '%NOME%')`)
    console.log(res.rows)
  } catch (err) {
    console.error(err)
  } finally {
    if (connection) await connection.close()
  }
}

run()
