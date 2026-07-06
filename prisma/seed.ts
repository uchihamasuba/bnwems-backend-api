import { PrismaClient } from '@prisma/client';

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');
  
  const sqlFilePath = path.join(__dirname, '../documents/BNWEMS.sql');
  
  if (fs.existsSync(sqlFilePath)) {
    console.log(`Found SQL file: ${sqlFilePath}`);
    console.log('Preparing SQL script...');
    
    // Read the SQL file
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // We only want the INSERT INTO statements, ignoring the CREATE TABLE 
    // because Prisma already handles schema creation.
    const insertIndex = sqlContent.indexOf('INSERT INTO');
    
    if (insertIndex !== -1) {
      sqlContent = sqlContent.substring(insertIndex);
      
      // Prepend SET FOREIGN_KEY_CHECKS = 0 to avoid constraint errors during insert
      sqlContent = 'SET FOREIGN_KEY_CHECKS = 0;\n' + sqlContent + '\nSET FOREIGN_KEY_CHECKS = 1;\n';
      
      // Clean existing data first
      console.log('Cleaning existing database records...');
      const tables = await prisma.$queryRawUnsafe<Array<any>>(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE();`
      );
      
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name || table.TableName;
        if (tableName && tableName !== '_prisma_migrations') {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);
        }
      }
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
      console.log('Database cleaned.');

      // Write to a temporary file
      const tempSqlPath = path.join(__dirname, 'temp_seed.sql');
      fs.writeFileSync(tempSqlPath, sqlContent);
      
      console.log('Executing SQL script to populate database...');
      try {
        execSync(`npx prisma db execute --file "${tempSqlPath}" --schema "${path.join(__dirname, 'schema.prisma')}"`, { stdio: 'inherit' });
        console.log('Successfully executed BNWEMS.sql and populated the database.');
      } catch (error) {
        console.error('Failed to execute SQL script. Please ensure your database is running and credentials are correct.');
        console.error(error);
        process.exit(1);
      } finally {
        // Clean up the temporary file
        if (fs.existsSync(tempSqlPath)) {
          fs.unlinkSync(tempSqlPath);
        }
      }
    } else {
      console.log('No INSERT statements found in BNWEMS.sql');
    }
  } else {
    console.log(`SQL file not found at ${sqlFilePath}. Skipping SQL seed.`);
  }
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
