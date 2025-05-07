import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { db } from './db';
import * as schema from '@shared/schema';

// Define tables to backup
const tables = [
  { name: 'users', schema: schema.users },
  { name: 'products_services', schema: schema.productsAndServices },
  { name: 'sales', schema: schema.sales },
  { name: 'income_statements', schema: schema.incomeStatements },
  { name: 'client_queries', schema: schema.clientQueries }
];

// Backup directory
const backupDir = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Create a backup of all database tables
 */
export async function createBackup(): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
    
    const backup: Record<string, any[]> = {};
    
    // Fetch data from each table
    for (const table of tables) {
      const data = await db.select().from(table.schema);
      backup[table.name] = data;
    }
    
    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    return backupPath;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error(`Failed to create backup: ${(error as Error).message}`);
  }
}

/**
 * Restore database from a backup file
 */
export async function restoreFromBackup(backupFilePath: string): Promise<void> {
  try {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    // Restore data for each table
    for (const table of tables) {
      const tableData = backupData[table.name];
      
      if (tableData && Array.isArray(tableData) && tableData.length > 0) {
        // Clear existing data
        // Note: In production, you might want to implement a more sophisticated strategy
        // like merging records rather than deleting everything
        await db.delete(table.schema);
        
        // Insert backed up data
        for (const record of tableData) {
          // Clean record to remove any properties not in the schema
          const cleanRecord = { ...record };
          await db.insert(table.schema).values(cleanRecord);
        }
      }
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw new Error(`Failed to restore from backup: ${(error as Error).message}`);
  }
}

/**
 * Get list of available backups
 */
export function getAvailableBackups(): string[] {
  if (!fs.existsSync(backupDir)) {
    return [];
  }
  
  return fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .sort()
    .reverse(); // Latest first
}

/**
 * Schedule automatic backups
 * @param intervalHours How often to backup in hours
 */
export function scheduleBackups(intervalHours = 24): NodeJS.Timer {
  // Convert hours to milliseconds
  const interval = intervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling automatic backups every ${intervalHours} hours`);
  
  return setInterval(async () => {
    try {
      const backupPath = await createBackup();
      console.log(`Automatic backup created: ${backupPath}`);
      
      // Cleanup old backups - keep only last 5
      const backups = getAvailableBackups();
      
      if (backups.length > 5) {
        for (let i = 5; i < backups.length; i++) {
          const oldBackupPath = path.join(backupDir, backups[i]);
          fs.unlinkSync(oldBackupPath);
          console.log(`Removed old backup: ${oldBackupPath}`);
        }
      }
    } catch (error) {
      console.error('Error during scheduled backup:', error);
    }
  }, interval);
}