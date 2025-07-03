"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfesseurClasse = exports.NoteExamen = exports.NoteDevoir = exports.Examen = exports.Devoir = exports.Professeur = exports.Matiere = exports.Eleve = exports.Classe = exports.Parent = exports.Direction = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const connexion_1 = __importDefault(require("../connexion"));
exports.sequelize = connexion_1.default;
// Direction model
const Direction = connexion_1.default.define('Direction', {
    id_direction: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    prenom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    email: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    password: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'direction',
    timestamps: false,
});
exports.Direction = Direction;
// Parent model
const Parent = connexion_1.default.define('Parent', {
    id_parent: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    prenom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    email: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    password: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    id_direction: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'parent',
    timestamps: false,
});
exports.Parent = Parent;
// Classe model
const Classe = connexion_1.default.define('Classe', {
    id_classe: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
    niveau: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
}, {
    tableName: 'classe',
    timestamps: false,
});
exports.Classe = Classe;
// Eleve model
const Eleve = connexion_1.default.define('Eleve', {
    id_eleve: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    prenom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    email: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    password: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    id_parent: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    id_classe: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_direction: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'eleve',
    timestamps: false,
});
exports.Eleve = Eleve;
// Matiere model
const Matiere = connexion_1.default.define('Matiere', {
    id_matiere: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: { type: sequelize_1.DataTypes.TEXT, allowNull: false, unique: true },
}, {
    tableName: 'matiere',
    timestamps: false,
});
exports.Matiere = Matiere;
// Professeur model
const Professeur = connexion_1.default.define('Professeur', {
    id_professeur: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    prenom: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    email: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    password: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    id_matiere: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_direction: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'professeur',
    timestamps: false,
});
exports.Professeur = Professeur;
// Devoir model
const Devoir = connexion_1.default.define('Devoir', {
    num_devoir: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom_devoir: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    date_limite_devoir: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    semestre: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // ou false si obligatoire
        defaultValue: 'general',
    },
    id_matiere: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_professeur: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_classe: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'devoir',
    timestamps: false,
});
exports.Devoir = Devoir;
// Examen model
const Examen = connexion_1.default.define('Examen', {
    num_examen: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom_examen: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    date_examen: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    semestre: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'general'
    },
    id_matiere: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_professeur: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    id_classe: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'examen',
    timestamps: false,
});
exports.Examen = Examen;
// NoteDevoir model (join table Eleve<->Devoir)
const NoteDevoir = connexion_1.default.define('NoteDevoir', {
    id_eleve: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
    },
    num_devoir: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
    },
    note: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
}, {
    tableName: 'note_devoir',
    timestamps: false,
});
exports.NoteDevoir = NoteDevoir;
// NoteExamen model (join table Eleve<->Examen)
const NoteExamen = connexion_1.default.define('NoteExamen', {
    id_eleve: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
    },
    num_examen: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
    },
    note: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
}, {
    tableName: 'note_examen',
    timestamps: false,
});
exports.NoteExamen = NoteExamen;
// ProfesseurClasse model (join table Professeur <-> Classe)
const ProfesseurClasse = connexion_1.default.define('ProfesseurClasse', {
    id_professeur: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
    },
    id_classe: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
    },
}, {
    tableName: 'professeur_classe',
    timestamps: false,
});
exports.ProfesseurClasse = ProfesseurClasse;
// ==== Associations ====
// Direction - Parent (1:n)
Direction.hasMany(Parent, { foreignKey: 'id_direction' });
Parent.belongsTo(Direction, { foreignKey: 'id_direction' });
// Direction - Eleve (1:n)
Direction.hasMany(Eleve, { foreignKey: 'id_direction' });
Eleve.belongsTo(Direction, { foreignKey: 'id_direction' });
// Direction - Professeur (1:n)
Direction.hasMany(Professeur, { foreignKey: 'id_direction' });
Professeur.belongsTo(Direction, { foreignKey: 'id_direction' });
// Parent - Eleve (1:n)
Parent.hasMany(Eleve, { foreignKey: 'id_parent' });
Eleve.belongsTo(Parent, { foreignKey: 'id_parent' });
// Classe - Eleve (1:n)
Classe.hasMany(Eleve, { foreignKey: 'id_classe' });
Eleve.belongsTo(Classe, { foreignKey: 'id_classe' });
// Matiere - Professeur (1:n)
Matiere.hasMany(Professeur, { foreignKey: 'id_matiere' });
Professeur.belongsTo(Matiere, { foreignKey: 'id_matiere' });
// Matiere - Devoir (1:n)
Matiere.hasMany(Devoir, { foreignKey: 'id_matiere' });
Devoir.belongsTo(Matiere, { foreignKey: 'id_matiere' });
// Matiere - Examen (1:n)
Matiere.hasMany(Examen, { foreignKey: 'id_matiere' });
Examen.belongsTo(Matiere, { foreignKey: 'id_matiere' });
// Professeur - Devoir (1:n)
Professeur.hasMany(Devoir, { foreignKey: 'id_professeur' });
Devoir.belongsTo(Professeur, { foreignKey: 'id_professeur' });
// Professeur - Examen (1:n)
Professeur.hasMany(Examen, { foreignKey: 'id_professeur' });
Examen.belongsTo(Professeur, { foreignKey: 'id_professeur' });
// Classe - Devoir (1:n)
Classe.hasMany(Devoir, { foreignKey: 'id_classe' });
Devoir.belongsTo(Classe, { foreignKey: 'id_classe' });
// Classe - Examen (1:n)
Classe.hasMany(Examen, { foreignKey: 'id_classe' });
Examen.belongsTo(Classe, { foreignKey: 'id_classe' });
// Eleve <-> Devoir (Many-to-Many through NoteDevoir)
Eleve.belongsToMany(Devoir, { through: NoteDevoir, foreignKey: 'id_eleve', otherKey: 'num_devoir' });
Devoir.belongsToMany(Eleve, { through: NoteDevoir, foreignKey: 'num_devoir', otherKey: 'id_eleve' });
// Eleve <-> Examen (Many-to-Many through NoteExamen)
Eleve.belongsToMany(Examen, {
    through: NoteExamen,
    foreignKey: 'id_eleve',
    otherKey: 'num_examen'
});
Examen.belongsToMany(Eleve, {
    through: NoteExamen,
    foreignKey: 'num_examen',
    otherKey: 'id_eleve'
});
// Professeur <-> Classe (Many-to-Many through ProfesseurClasse)
Professeur.belongsToMany(Classe, {
    through: ProfesseurClasse,
    foreignKey: 'id_professeur',
    otherKey: 'id_classe',
});
Classe.belongsToMany(Professeur, {
    through: ProfesseurClasse,
    foreignKey: 'id_classe',
    otherKey: 'id_professeur',
});
