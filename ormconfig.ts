import { DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.NODE_ENV === 'test' ? ':memory:' : 'db.sqlite',
  entities: [__dirname + '/src/entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
};

export default config;