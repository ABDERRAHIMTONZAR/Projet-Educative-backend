import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres://postgres:azerty123@localhost:5432/EvalyaSmart', {
  dialect: 'postgres',
});

async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('La connexion à la base de données a réussi.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
}
testConnection();

export default sequelize;
