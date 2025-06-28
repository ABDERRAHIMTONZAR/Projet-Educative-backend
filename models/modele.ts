import { DataTypes } from 'sequelize';
import sequelize from '../connexion';

// Direction model
const Direction = sequelize.define('Direction', {
  id_direction: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.TEXT, allowNull: false },
  prenom: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'direction',
  timestamps: false,
});

// Parent model
const Parent = sequelize.define('Parent', {
  id_parent: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.TEXT, allowNull: false },
  prenom: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  id_direction: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'parent',
  timestamps: false,
});

// Classe model
const Classe = sequelize.define('Classe', {
  id_classe: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.TEXT, allowNull: false, unique: true },
  niveau: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'classe',
  timestamps: false,
});

// Eleve model
const Eleve = sequelize.define('Eleve', {
  id_eleve: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.TEXT, allowNull: false },
  prenom: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  id_parent: { type: DataTypes.INTEGER, allowNull: true },
  id_classe: { type: DataTypes.INTEGER, allowNull: false },
  id_direction: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'eleve',
  timestamps: false,
});

// Matiere model
const Matiere = sequelize.define('Matiere', {
  id_matiere: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.TEXT, allowNull: false, unique: true },
}, {
  tableName: 'matiere',
  timestamps: false,
});

// Professeur model
const Professeur = sequelize.define('Professeur', {
  id_professeur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: { type: DataTypes.TEXT, allowNull: false },
  prenom: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  id_matiere: { type: DataTypes.INTEGER, allowNull: false },
  id_direction: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'professeur',
  timestamps: false,
});

// Devoir model
const Devoir = sequelize.define('Devoir', {
  num_devoir: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom_devoir: { type: DataTypes.TEXT, allowNull: false },
  date_limite_devoir: { type: DataTypes.DATEONLY, allowNull: false },
  semestre: { type: DataTypes.TEXT, allowNull: false },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {              // <-- Ajout du nouveau champ
    type: DataTypes.STRING,
    allowNull: true,    // ou false si obligatoire
    defaultValue: 'general',
  },
    id_matiere: { type: DataTypes.INTEGER, allowNull: false },
  id_professeur: { type: DataTypes.INTEGER, allowNull: false },
  id_classe: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'devoir',
  timestamps: false,
});

// Examen model
const Examen = sequelize.define('Examen', {
  num_examen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom_examen: { type: DataTypes.TEXT, allowNull: false },
  date_examen: { type: DataTypes.DATEONLY, allowNull: false },
  semestre: { type: DataTypes.TEXT, allowNull: false },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  },
  id_matiere: { type: DataTypes.INTEGER, allowNull: false },
  id_professeur: { type: DataTypes.INTEGER, allowNull: false },
  id_classe: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'examen',
  timestamps: false,
});

// NoteDevoir model (join table Eleve<->Devoir)
const NoteDevoir = sequelize.define('NoteDevoir', {
  id_eleve: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  num_devoir: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  note: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
}, {
  tableName: 'note_devoir',
  timestamps: false,
});

// NoteExamen model (join table Eleve<->Examen)
const NoteExamen = sequelize.define('NoteExamen', {
  id_eleve: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  num_examen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  note: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
}, {
  tableName: 'note_examen',
  timestamps: false,
});

// ProfesseurClasse model (join table Professeur <-> Classe)
const ProfesseurClasse = sequelize.define('ProfesseurClasse', {
  id_professeur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  id_classe: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: 'professeur_classe',
  timestamps: false,
});

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

export {
  sequelize,
  Direction,
  Parent,
  Classe,
  Eleve,
  Matiere,
  Professeur,
  Devoir,
  Examen,
  NoteDevoir,
  NoteExamen,
  ProfesseurClasse,
};
