#!/bin/sh
set -e

echo "⏳ Running database migrations..."
node -e "
const { DataSource } = require('typeorm');
const ds = require('./dist/database/typeorm.config').default;
ds.initialize().then(() => ds.runMigrations()).then(() => { console.log('✅ Migrations done'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
"

echo "🌱 Running database seed..."
node dist/seed/run-seed.js

echo "🚀 Starting application..."
exec node dist/main
