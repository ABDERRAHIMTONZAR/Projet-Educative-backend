import { DataTypes } from 'sequelize';
export async function up(queryInterface) {
    await queryInterface.addColumn('eleve', 'nom', {
        type: DataTypes.STRING,
        allowNull: false,
    });
    await queryInterface.addColumn('eleve', 'prenom', {
        type: DataTypes.STRING,
        allowNull: false,
    });
}
export async function down(queryInterface) {
    await queryInterface.removeColumn('eleve', 'nom');
    await queryInterface.removeColumn('eleve', 'prenom');
}
