import { PoolClient } from 'pg';
import { WineRecord } from './csv-parser';

export async function upsertWineRecord(
  client: PoolClient,
  record: WineRecord,
  userId: string,
  existingWineIds: Set<number>
) {
  const recordWineId = record.wine_id ? parseInt(record.wine_id) : null;
  
  if (recordWineId && existingWineIds.has(recordWineId)) {
    return await updateWine(client, record, recordWineId, userId);
  }
  
  return await insertWine(client, record, userId);
}

async function updateWine(client: PoolClient, record: WineRecord, wineId: number, userId: string) {
  const { rows } = await client.query(`
    UPDATE wine_table 
    SET name = $1, producer = $2, grapes = $3, country = $4, 
        region = $5, year = $6, price = $7, quantity = $8, 
        bottle_size = $9
    WHERE id = $10 AND user_id = $11
    RETURNING id
  `, [
    record.wine_name,
    record.producer,
    record.grapes,
    record.country,
    record.region,
    record.year,
    record.price,
    record.quantity,
    record.bottle_size,
    wineId,
    userId
  ]);
  
  return rows[0].id;
}

async function insertWine(client: PoolClient, record: WineRecord, userId: string) {
  const { rows } = await client.query(`
    INSERT INTO wine_table (
      name, producer, grapes, country, region, year, 
      price, quantity, bottle_size, user_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `, [
    record.wine_name,
    record.producer,
    record.grapes,
    record.country,
    record.region,
    record.year,
    record.price,
    record.quantity,
    record.bottle_size,
    userId
  ]);
  
  return rows[0].id;
} 