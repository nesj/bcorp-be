"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const user_1 = require("./src/models/user");
dotenv.config();
exports.connectionSource = new typeorm_1.DataSource({
    type: 'mysql',
    url: process.env.DATABASE_PUBLIC_URL,
    logging: ['error', 'warn'],
    synchronize: false,
    migrations: ['dist/migrations/*.js'],
    migrationsTableName: 'migrations',
    entities: [user_1.User, 'src/models/*.ts', 'src/**/*.entity.ts'],
    extra: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
});
//# sourceMappingURL=ormconfig.js.map