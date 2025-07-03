import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Important pour Railway ou Render
    },
  },
});

async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion réussie à la base de données');
  } catch (error) {
    console.error('❌ Échec de connexion à la base de données :', error);
  }
}

testConnection();

export default sequelize;