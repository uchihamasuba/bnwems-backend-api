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
    
    // Remove CREATE DATABASE and USE statements to make it DB-agnostic
    sqlContent = sqlContent.replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '');
    sqlContent = sqlContent.replace(/USE .*?;/gi, '');
    
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
