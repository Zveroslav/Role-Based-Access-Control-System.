// filepath: app/seed/seed.ts
import { users, roles, records } from './data';

export async function seed() {
  console.log('Seeding data...');
  console.log({ users, roles, records });
}

seed();