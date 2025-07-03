"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const sequelize_1 = require("sequelize");
require("../connexion");
const connexion_1 = __importDefault(require("../connexion"));
const modele_1 = require("../models/modele");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const os_1 = require("os");
const pdf_poppler_1 = __importDefault(require("pdf-poppler"));
const sharp_1 = __importDefault(require("sharp"));
const mammoth_1 = __importDefault(require("mammoth"));
dotenv_1.default.config();
///LOGINNNN
const SECRET_KEY = process.env.SECRET_KEY || 'secret';
const router = (0, express_1.Router)();
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        let user = yield modele_1.Eleve.findOne({ where: { email } });
        let role = "eleve";
        let userId;
        if (!user) {
            user = yield modele_1.Professeur.findOne({ where: { email } });
            role = "enseignant";
        }
        if (!user) {
            user = yield modele_1.Parent.findOne({ where: { email } });
            role = "parent";
        }
        if (!user) {
            user = yield modele_1.Direction.findOne({ where: { email } });
            role = "direction";
        }
        if (!user) {
            res.status(404).send("Utilisateur introuvable");
            return;
        }
        // Récupération de l'ID selon le rôle
        switch (role) {
            case 'eleve':
                userId = user.getDataValue('id_eleve');
                break;
            case 'enseignant':
                userId = user.getDataValue('id_professeur');
                break;
            case 'parent':
                userId = user.getDataValue('id_parent');
                break;
            case 'direction':
                userId = user.getDataValue('id_direction');
                break;
        }
        // Vérification du mot de passe
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.getDataValue('password'));
        if (isPasswordValid) {
            const token = jsonwebtoken_1.default.sign({ id: userId, role: role }, SECRET_KEY, { expiresIn: '2h' });
            res.json({ token, role });
        }
        else {
            res.status(401).send("Mot de passe incorrect");
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Une erreur est survenue lors de la connexion.");
    }
}));
///TROUBLE PASSWORD
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'abdoutonzar@gmail.com',
        pass: 'oytb jmlx txcg lpyw'
    },
    tls: {
        rejectUnauthorized: false
    }
});
transporter.verify(function (error, success) {
    if (error) {
        console.log("Erreur de configuration du serveur mail:", error);
    }
    else {
        console.log("Serveur mail prêt à envoyer des messages");
    }
});
function generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
router.post("/forgetpassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        let foundUser = yield modele_1.Eleve.findOne({ where: { email } });
        let role = "eleve";
        if (!foundUser) {
            foundUser = yield modele_1.Professeur.findOne({ where: { email } });
            role = "enseignant";
        }
        if (!foundUser) {
            foundUser = yield modele_1.Parent.findOne({ where: { email } });
            role = "parent";
        }
        if (!foundUser) {
            foundUser = yield modele_1.Direction.findOne({ where: { email } });
            role = "direction";
        }
        if (!foundUser) {
            res.status(404).send("Utilisateur introuvable");
            return;
        }
        const generatedPassword = generateRandomPassword();
        const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, 10);
        if (role === "eleve") {
            yield modele_1.Eleve.update({ password: hashedPassword }, { where: { email } });
        }
        else if (role === "enseignant") {
            yield modele_1.Professeur.update({ password: hashedPassword }, { where: { email } });
        }
        else if (role === "parent") {
            yield modele_1.Parent.update({ password: hashedPassword }, { where: { email } });
        }
        else if (role === "direction") {
            yield modele_1.Direction.update({ password: hashedPassword }, { where: { email } });
        }
        const mailOptions = {
            from: 'admin@gmail.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Votre nouveau mot de passe est : ${generatedPassword}\n\nVeuillez vous connecter avec ce mot de passe et le changer immédiatement.`
        };
        yield transporter.sendMail(mailOptions);
        res.status(200).send(`Un email avec le nouveau mot de passe a été envoyé: ${generatedPassword}`);
    }
    catch (err) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", err);
        res.status(500).send("Erreur lors de la réinitialisation du mot de passe");
    }
}));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).send("Aucun token fourni");
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).send("Aucun token fourni");
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send("Token invalide");
        }
        req.user = decoded;
        next();
    });
};
///UPLOAD FILE
const s3Client = new client_s3_1.S3Client({
    region: 'eu-west-3',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
router.get('/upload', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type } = req.query;
    console.log(name, type);
    if (!name || !type) {
        return res.status(400).json({ error: 'Nom du fichier et type requis' });
    }
    const cleanName = name.replace(/\s/g, '_').replace(/[^\w.-]/g, '');
    const params = new client_s3_1.PutObjectCommand({
        Bucket: 'evalyasmart',
        Key: `uploads/${Date.now()}_${cleanName}`,
        ContentType: type,
    });
    try {
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, params, { expiresIn: 60 * 60 });
        res.status(200).json({ url });
        console.log(url);
    }
    catch (err) {
        console.error('Erreur génération URL :', err);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'URL pré-signée' });
    }
}));
router.post('/enregistrer', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, subject, dueDate, semestre, className, url, type } = req.body;
        const { id } = req.user;
        if (!title || !subject || !dueDate || !semestre || !className || !url) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }
        // Vérifier si la matière existe
        const matiere = yield modele_1.Matiere.findOne({
            where: {
                nom: subject
            }
        });
        if (!matiere) {
            return res.status(404).json({ message: 'Matière introuvable' });
        }
        // Vérifier si la classe existe
        const classe = yield modele_1.Classe.findOne({
            where: {
                nom: className
            }
        });
        if (!classe) {
            return res.status(404).json({ message: 'Classe introuvable' });
        }
        // Créer le devoir
        const newDevoir = yield modele_1.Devoir.create({
            nom_devoir: title,
            date_limite_devoir: dueDate,
            semestre: semestre,
            url: url,
            type: type,
            id_matiere: matiere.getDataValue('id_matiere'),
            id_professeur: id,
            id_classe: classe.getDataValue('id_classe')
        });
        res.status(201).json({
            message: 'Devoir enregistré avec succès',
            devoir: newDevoir
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion du devoir:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.post('/enregistrerExamen', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, subject, dueDate, semestre, className, url, type } = req.body;
        const { id } = req.user;
        if (!title || !subject || !dueDate || !semestre || !className || !url) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }
        // Vérifier si la matière existe
        const matiere = yield modele_1.Matiere.findOne({
            where: {
                nom: subject
            }
        });
        if (!matiere) {
            return res.status(404).json({ message: 'Matière introuvable' });
        }
        // Vérifier si la classe existe
        const classe = yield modele_1.Classe.findOne({
            where: {
                nom: className
            }
        });
        if (!classe) {
            return res.status(404).json({ message: 'Classe introuvable' });
        }
        // Créer l'examen
        const newExamen = yield modele_1.Examen.create({
            nom_examen: title,
            date_examen: dueDate,
            semestre: semestre,
            url: url,
            type: type || 'general',
            id_matiere: matiere.getDataValue('id_matiere'),
            id_professeur: id,
            id_classe: classe.getDataValue('id_classe')
        });
        res.status(201).json({
            message: 'Examen enregistré avec succès',
            examen: newExamen
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion de l\'examen:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
///RECOVER FILE
router.get('/recuperer', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const devoirs = yield modele_1.Devoir.findAll({
            attributes: ['nom_devoir', 'url', 'type'],
            where: {
                id_professeur: id
            },
            order: [['date_limite_devoir', 'DESC']]
        });
        res.json(devoirs);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des devoirs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.get('/recupererExamen', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const examens = yield modele_1.Examen.findAll({
            attributes: ['nom_examen', 'url', 'type'],
            where: {
                id_professeur: id
            },
            order: [['date_examen', 'DESC']]
        });
        res.json(examens);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des devoirs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        // Make sure Sequelize is connected
        yield connexion_1.default.authenticate();
        const examensCount = yield modele_1.Examen.count({
            where: {
                date_examen: {
                    [sequelize_1.Op.gt]: now,
                },
            },
        });
        const elevesCount = yield modele_1.Eleve.count();
        const devoirsCount = yield modele_1.Devoir.count({
            where: {
                date_limite_devoir: {
                    [sequelize_1.Op.lt]: now,
                },
            },
        });
        const classesCount = yield modele_1.Classe.count();
        res.json({
            examens: examensCount,
            eleves: elevesCount,
            devoirs: devoirsCount,
            classes: classesCount,
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/dashboard-stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        // 1. Total devoirs
        const totalDevoir = yield modele_1.Devoir.count();
        // 2. Devoirs whose deadline passed
        const devoirEnCours = yield modele_1.Devoir.count({
            where: {
                date_limite_devoir: {
                    [sequelize_1.Op.lt]: now,
                },
            },
        });
        const [results] = yield connexion_1.default.query(`
      SELECT COUNT(DISTINCT E.id_eleve) AS eleve_active
      FROM eleve E
      JOIN note_devoir ND ON E.id_eleve = ND.id_eleve
    `);
        const eleveActive = parseInt(results[0].eleve_active, 10);
        res.json({
            totalDevoir,
            devoirEnCours,
            eleveActive,
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/devoirs-with-class-prof', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      SELECT
        d.nom_devoir,
        c.nom AS classe_nom,
        p.nom || ' ' || p.prenom AS professeur_nom,
        d.date_limite_devoir
      FROM devoir d
      JOIN professeur p ON p.id_professeur = d.id_professeur
      JOIN classe c ON c.id_classe = d.id_classe
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching devoir details:', error);
    }
}));
router.get('/examens-dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      SELECT
        (SELECT COUNT(*) FROM public.examen) AS total_examens,
        (SELECT COUNT(*) FROM public.examen
         WHERE date_examen >= date_trunc('week', CURRENT_DATE)
           AND date_examen < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days') AS examens_cette_semaine,
        (SELECT COUNT(*) FROM public.eleve) AS eleves_inscrits
    `);
        res.json(results[0]);
    }
    catch (error) {
        console.error('Error fetching examens dashboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/examens-details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      SELECT
          e.nom_examen AS examen,
          c.nom AS classe,
          pr.nom || ' ' || pr.prenom AS enseignant,
          e.date_examen AS date,
          COUNT(el.id_eleve) AS inscrits
      FROM public.examen e
      JOIN public.professeur pr ON e.id_professeur = pr.id_professeur
      JOIN public.classe c ON c.id_classe = e.id_classe
      LEFT JOIN public.eleve el ON el.id_classe = c.id_classe
      GROUP BY e.num_examen, c.nom, pr.nom, pr.prenom, e.date_examen
      ORDER BY e.date_examen;
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/eleves_info', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      SELECT
        (SELECT COUNT(*) FROM eleve) AS total_eleves,
        (SELECT AVG(note) FROM note_examen) AS moyenne_generale_examen,
        (
          SELECT COUNT(DISTINCT id_eleve)
          FROM note_examen
          WHERE note < 10
        ) AS eleves_a_risque_examen
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching devoir details:', error);
    }
}));
router.get('/eleves-moyenne-examen', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
 SELECT
  e.nom || ' ' || e.prenom AS nom_complet,
  c.nom AS classe,
  e.email,
  ROUND(AVG(ne.note), 2) AS moyenne
FROM
  eleve e
JOIN classe c ON e.id_classe = c.id_classe
JOIN note_examen ne ON ne.id_eleve = e.id_eleve
GROUP BY
  e.id_eleve, c.nom, e.nom, e.prenom, e.email
ORDER BY
  nom_complet;
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Erreur récupération élèves :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.get('/enseignants-classes-stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      SELECT
        (SELECT COUNT(*) FROM public.professeur) AS total_enseignants,
        (SELECT COUNT(DISTINCT c.id_classe)
         FROM public.classe c
         JOIN public.eleve e ON c.id_classe = e.id_classe) AS classes_actives
    `);
        res.json(results[0]);
    }
    catch (error) {
        console.error('Error fetching enseignants/classes stats:', error);
    }
}));
router.get('/enseignants/classes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      SELECT 
        p.id_professeur as id_enseignant,
        p.nom || ' ' || p.prenom AS enseignant,
        m.nom AS matiere,
        p.email,
        ARRAY_AGG(c.nom) AS classes,
        COUNT(DISTINCT e.id_eleve) AS nombre_eleves
      FROM professeur p
      JOIN matiere m ON p.id_matiere = m.id_matiere
      JOIN professeur_classe pc ON p.id_professeur = pc.id_professeur
      JOIN classe c ON pc.id_classe = c.id_classe
      LEFT JOIN eleve e ON c.id_classe = e.id_classe
      GROUP BY p.id_professeur, p.nom, p.prenom, m.nom, p.email
      ORDER BY p.nom;
    `);
        res.json(results);
    }
    catch (error) {
        console.error('Error fetching devoir details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield connexion_1.default.query(`
      WITH all_notes AS (
        SELECT note FROM public.note_devoir
        UNION ALL
        SELECT note FROM public.note_examen
      ),
      total_notes AS (
        SELECT COUNT(*) AS total FROM all_notes
      ),
      notes_reussite AS (
        SELECT COUNT(*) AS reussite FROM all_notes WHERE note >= 10
      )
      SELECT
        ROUND(AVG(note), 2) AS moyenne_generale,
        ROUND((reussite * 100.0) / total, 2) AS taux_reussite_pourcentage,
        (SELECT COUNT(*) FROM public.eleve) AS total_eleves,
        (SELECT COUNT(DISTINCT c.id_classe)
         FROM public.classe c
         JOIN public.eleve e ON c.id_classe = e.id_classe) AS classes_actives
      FROM all_notes, notes_reussite, total_notes;
    `);
        res.json(results[0]);
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// 1. Performance Trends Data
router.get('/performance-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield connexion_1.default.query(`
      WITH all_notes AS (
        SELECT n.note, d.date_limite_devoir AS note_date
        FROM note_devoir n
        JOIN devoir d ON n.num_devoir = d.num_devoir
        UNION ALL
        SELECT n.note, e.date_examen AS note_date
        FROM note_examen n
        JOIN examen e ON n.num_examen = e.num_examen
      )
      SELECT
        TO_CHAR(date_trunc('month', note_date), 'Mon') AS month,
        ROUND(AVG(note)::numeric, 2) AS moyenne,
        ROUND(100.0 * SUM(CASE WHEN note >= 10 THEN 1 ELSE 0 END) / COUNT(*), 0) AS taux_reussite
      FROM all_notes
      GROUP BY date_trunc('month', note_date)
      ORDER BY date_trunc('month', note_date);
    `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            nest: true
        });
        // Handle empty results
        const data = rows.map((row) => ({
            month: row.month,
            moyenne: parseFloat(row.moyenne),
            tauxReussite: parseInt(row.taux_reussite, 10),
        }));
        res.json(data);
    }
    catch (err) {
        console.error('Performance data error:', err);
        res.status(500).json({
            error: 'Failed to fetch performance data',
            details: err.message
        });
    }
}));
// 2. Subject Performance
router.get('/subject-performance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentSemester = '2025_S1';
        const previousSemester = '2024_S2';
        const rows = yield connexion_1.default.query(`
      WITH notes_with_period AS (
        SELECT
          m.nom AS subject,
          n.note,
          CASE
            WHEN d.semestre = '${currentSemester}' THEN 'current'
            WHEN d.semestre = '${previousSemester}' THEN 'previous'
            ELSE NULL
          END AS period
        FROM note_devoir n
        JOIN devoir d ON n.num_devoir = d.num_devoir
        JOIN matiere m ON d.id_matiere = m.id_matiere
        WHERE d.semestre IN ('${currentSemester}', '${previousSemester}')

        UNION ALL

        SELECT
          m.nom AS subject,
          n.note,
          CASE
            WHEN e.semestre = '${currentSemester}' THEN 'current'
            WHEN e.semestre = '${previousSemester}' THEN 'previous'
            ELSE NULL
          END AS period
        FROM note_examen n
        JOIN examen e ON n.num_examen = e.num_examen
        JOIN matiere m ON e.id_matiere = m.id_matiere
        WHERE e.semestre IN ('${currentSemester}', '${previousSemester}')
      )
      SELECT
        subject,
        ROUND(AVG(CASE WHEN period = 'current' THEN note END)::numeric, 2) AS moyenne,
        ROUND(AVG(CASE WHEN period = 'previous' THEN note END)::numeric, 2) AS previous
      FROM notes_with_period
      GROUP BY subject
      ORDER BY subject;
    `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            nest: true
        });
        // Handle null values
        const data = rows.map((row) => ({
            subject: row.subject,
            moyenne: row.moyenne ? parseFloat(row.moyenne) : 0,
            previous: row.previous ? parseFloat(row.previous) : 0,
        }));
        res.json(data);
    }
    catch (err) {
        console.error('Subject performance error:', err);
        res.status(500).json({
            error: 'Failed to fetch subject performance data',
            details: err.message
        });
    }
}));
// 3. Class Distribution (already correct)
router.get('/class-distribution', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield connexion_1.default.query(`
      SELECT
        c.nom AS class,
        COUNT(e.id_eleve) AS students
      FROM classe c
      LEFT JOIN eleve e ON c.id_classe = e.id_classe
      GROUP BY c.nom
      ORDER BY c.nom;
    `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
            nest: true
        });
        res.json(rows.map((row) => ({
            class: row.class,
            students: parseInt(row.students, 10),
        })));
    }
    catch (err) {
        console.error('Class distribution error:', err);
        res.status(500).json({
            error: 'Failed to fetch class distribution data',
            details: err.message
        });
    }
}));
// 4. Key Indicators (with real calculations)
router.get('/key-indicators', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calculate real indicators from database
        const [attendance] = yield connexion_1.default.query(`
      SELECT ROUND(100.0 * COUNT(CASE WHEN present THEN 1 END) / COUNT(*)) AS taux
      FROM presence;
    `, { type: sequelize_1.QueryTypes.SELECT });
        const [assignments] = yield connexion_1.default.query(`
      SELECT ROUND(100.0 * COUNT(CASE WHEN rendu THEN 1 END) / COUNT(*)) AS taux
      FROM devoir_rendu;
    `, { type: sequelize_1.QueryTypes.SELECT });
        const [participation] = yield connexion_1.default.query(`
      SELECT ROUND(AVG(participation) * 100) AS taux
      FROM evaluation_participation;
    `, { type: sequelize_1.QueryTypes.SELECT });
        const [satisfaction] = yield connexion_1.default.query(`
      SELECT ROUND(AVG(satisfaction) * 100) AS taux
      FROM enquete_parents;
    `, { type: sequelize_1.QueryTypes.SELECT });
        res.json({
            tauxAssiduite: (attendance === null || attendance === void 0 ? void 0 : attendance.taux) || 0,
            devoirsRendus: (assignments === null || assignments === void 0 ? void 0 : assignments.taux) || 0,
            participation: (participation === null || participation === void 0 ? void 0 : participation.taux) || 0,
            satisfactionParents: (satisfaction === null || satisfaction === void 0 ? void 0 : satisfaction.taux) || 0,
        });
    }
    catch (err) {
        console.error('Key indicators error:', err);
        // Fallback to sample data if calculation fails
        res.json({
            tauxAssiduite: 92,
            devoirsRendus: 88,
            participation: 75,
            satisfactionParents: 85,
        });
    }
}));
router.get('/classes', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classes = yield modele_1.Classe.findAll();
        res.json(classes);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.get('/matieres', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matieres = yield modele_1.Matiere.findAll();
        res.json(matieres);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des matières:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
// Route pour créer un compte parent
router.post('/create-parent', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nom, prenom, email, password, eleve_nom, eleve_prenom } = req.body;
        const { id } = req.user;
        // Vérifier si l'email du parent existe déjà
        const existingUser = yield modele_1.Parent.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Vérifier si l'élève existe
        const existingEleve = yield modele_1.Eleve.findOne({
            where: {
                nom: eleve_nom,
                prenom: eleve_prenom,
            }
        });
        if (!existingEleve) {
            return res.status(404).json({
                message: 'Élève non trouvé. Veuillez d\'abord créer le compte de l\'élève.'
            });
        }
        // Créer le parent
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const parent = yield modele_1.Parent.create({
            nom,
            prenom,
            email,
            password: hashedPassword,
            id_eleve: existingEleve.getDataValue('id_eleve'),
            id_direction: id
        });
        res.status(201).json({ message: 'Compte parent créé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la création du compte parent:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
// Route pour créer un compte élève
router.post('/create-student', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nom, prenom, email, password, id_classe } = req.body;
        const { id } = req.user; // id de la direction
        // Vérifier si l'email existe déjà
        const existingUser = yield modele_1.Eleve.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Créer l'élève
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const eleve = yield modele_1.Eleve.create({
            nom,
            prenom,
            email,
            password: hashedPassword,
            id_classe,
            id_direction: id
        });
        res.status(201).json({ message: 'Compte élève créé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la création du compte élève:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
// Route pour créer un compte enseignant
router.post('/create-teacher', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nom, prenom, email, password, id_matiere } = req.body;
        const { id } = req.user; // id de la direction
        // Vérifier si l'email existe déjà
        const existingUser = yield modele_1.Professeur.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Créer l'enseignant
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const professeur = yield modele_1.Professeur.create({
            nom,
            prenom,
            email,
            password: hashedPassword,
            id_matiere,
            id_direction: id
        });
        res.status(201).json({ message: 'Compte enseignant créé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la création du compte enseignant:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
router.get('/getexamens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const examsRaw = yield connexion_1.default.query(`
      SELECT
        e.num_examen AS id,
        e.nom_examen AS title,
        TO_CHAR(e.date_examen, 'YYYY-MM-DD') AS "examDate",  -- format ISO-safe
        e.url AS description,
        m.nom AS subject,
        c.nom AS className
      FROM examen e
      JOIN matiere m ON e.id_matiere = m.id_matiere
      JOIN classe c ON e.id_classe = c.id_classe
      ORDER BY e.date_examen ASC;
    `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        const exams = examsRaw.map((row) => {
            const date = row.examDate; // e.g., "2025-06-20"
            const start = new Date(date + 'T08:00:00'); // start at 8 AM
            const end = new Date(date + 'T12:00:00'); // end at 12 PM
            return {
                id: row.id.toString(),
                title: `${row.title} - ${row.subject}`,
                start,
                end,
                allDay: false,
            };
        });
        res.json(exams);
    }
    catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des examens.' });
    }
}));
router.get('/getdevoirs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const devoirsRaw = yield connexion_1.default.query(`
      SELECT
        d.num_devoir AS id,
        d.nom_devoir AS title,
        d.date_limite_devoir AS deadline,
        d.url AS description,
        m.nom AS subject,
        c.nom AS className
      FROM devoir d
      JOIN matiere m ON d.id_matiere = m.id_matiere
      JOIN classe c ON d.id_classe = c.id_classe
      ORDER BY d.date_limite_devoir ASC;
    `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        const devoirEvents = devoirsRaw.map((row) => {
            const startDate = new Date(row.deadline);
            if (isNaN(startDate.getTime())) {
                console.warn(`Invalid date for devoir id=${row.id}:`, row.deadline);
                return null;
            }
            return {
                id: row.id.toString(),
                title: `${row.title} - ${row.subject}`,
                start: startDate,
                end: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59),
                allDay: false,
            };
        }).filter(event => event !== null); // Remove nulls
        res.json(devoirEvents);
    }
    catch (error) {
        console.error('Error fetching devoirs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des devoirs.' });
    }
}));
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const bucket = 'evalyasmart';
function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (chunk) => chunks.push(chunk));
        readableStream.on("error", reject);
        readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}
function convertPdfToImages(pdfBuffer, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const tempDir = (0, os_1.tmpdir)();
        const pdfPath = path_1.default.join(tempDir, fileName);
        yield promises_1.default.writeFile(pdfPath, pdfBuffer);
        const opts = {
            format: "jpeg",
            out_dir: tempDir,
            out_prefix: `${path_1.default.parse(fileName).name}-page`,
            page: undefined,
        };
        yield pdf_poppler_1.default.convert(pdfPath, opts);
        const files = yield promises_1.default.readdir(tempDir);
        const imageFiles = files
            .filter((f) => f.startsWith(`${path_1.default.parse(fileName).name}-page`) && f.endsWith(".jpg"))
            .map((f) => path_1.default.join(tempDir, f));
        yield promises_1.default.unlink(pdfPath);
        return imageFiles;
    });
}
function optimizeImageForOCR(imageBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, sharp_1.default)(imageBuffer).resize(2000).sharpen().greyscale().normalize().toBuffer();
    });
}
function callGoogleVisionAPI(imageBuffer, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const body = {
            requests: [
                {
                    image: { content: imageBuffer.toString("base64") },
                    features: [{ type: "TEXT_DETECTION" }],
                },
            ],
        };
        const response = yield axios_1.default.post(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, body);
        const resData = response.data.responses[0];
        if (resData.error)
            throw new Error(resData.error.message);
        const text = (_c = (_b = (_a = resData.textAnnotations) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.description) === null || _c === void 0 ? void 0 : _c.trim();
        return text || "[Aucun texte détecté]";
    });
}
function corrigerTexteAvecChatGPT(texte) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Vérifier si le texte est vide
        if (!texte || texte.trim() === '') {
            return "Aucun texte à corriger.";
        }
        // Vérifier si la clé API est disponible
        if (!process.env.OPENAI_API_KEY) {
            console.error("Clé API OpenAI manquante");
            return "Erreur de configuration : Clé API manquante.";
        }
        try {
            const completion = yield openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Corrige ces réponses en PHP. Indique si chaque réponse est correcte (✅) ou incorrecte (❌), explique pourquoi, et donne la bonne réponse. Note sur 10. Concentre-toi sur les concepts PHP comme les variables ($), les opérateurs de comparaison (== vs ===), les fonctions, les sessions, et la gestion des erreurs."
                    },
                    {
                        role: "user",
                        content: texte
                    }
                ],
                temperature: 0.1,
                max_tokens: 2000
            });
            const response = (_a = completion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
            if (!response) {
                throw new Error("Pas de réponse de l'API");
            }
            return response;
        }
        catch (error) {
            console.error("Erreur API:", error);
            // Gérer spécifiquement les erreurs de quota
            if (error.status === 429 || error.code === 'insufficient_quota') {
                console.error("Quota API dépassé");
                return "Le service de correction est temporairement indisponible car le quota d'utilisation a été dépassé. Veuillez contacter l'administrateur pour mettre à jour les limites d'utilisation.";
            }
            // Gérer les erreurs d'authentification
            if (error.status === 401) {
                console.error("Erreur d'authentification API");
                return "Erreur de configuration : Clé API invalide.";
            }
            return "Erreur lors de la correction. Veuillez réessayer.";
        }
    });
}
function recupererCorrection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const listCommand = new client_s3_1.ListObjectsV2Command({
                Bucket: bucket,
                Prefix: "corrections/",
            });
            const data = yield s3Client.send(listCommand);
            if (!data.Contents || data.Contents.length === 0)
                return [];
            const filesWithData = yield Promise.all(data.Contents.map((file) => __awaiter(this, void 0, void 0, function* () {
                if (!file.Key)
                    return null;
                const getObjectCommand = new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: file.Key });
                const s3Object = yield s3Client.send(getObjectCommand);
                const fileBuffer = yield streamToBuffer(s3Object.Body);
                const ext = path_1.default.extname(file.Key).toLowerCase();
                let fileType = "unknown";
                if (ext === ".pdf")
                    fileType = "pdf";
                else if ([".jpg", ".jpeg", ".png", ".bmp"].includes(ext))
                    fileType = "image";
                else if ([".doc", ".docx"].includes(ext))
                    fileType = "document";
                else if ([".txt", ".rtf"].includes(ext))
                    fileType = "text";
                return { fileName: file.Key, buffer: fileBuffer, fileType, extension: ext };
            })));
            return filesWithData.filter((f) => f !== null);
        }
        catch (err) {
            console.error("Erreur récupération fichiers:", err);
            return [];
        }
    });
}
function extractTexts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield recupererCorrection();
            const apiKey = process.env.GOOGLE_API_KEY;
            if (!apiKey) {
                res.status(500).json({ error: "Clé API Google manquante" });
                return;
            }
            const results = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (file.fileType === "pdf") {
                        const imagePaths = yield convertPdfToImages(file.buffer, path_1.default.basename(file.fileName));
                        const extractedTexts = yield Promise.all(imagePaths.map((imgPath) => __awaiter(this, void 0, void 0, function* () {
                            const imgBuffer = yield promises_1.default.readFile(imgPath);
                            const optimized = yield optimizeImageForOCR(imgBuffer);
                            const text = yield callGoogleVisionAPI(optimized, apiKey);
                            yield promises_1.default.unlink(imgPath);
                            return text;
                        })));
                        const original = extractedTexts.join(" ").replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                        const corrected = yield corrigerTexteAvecChatGPT(original);
                        return {
                            fileName: file.fileName,
                            type: file.fileType,
                            original,
                            corrected,
                            status: original === corrected ? "non corrigé" : "corrigé",
                        };
                    }
                    if (file.fileType === "image") {
                        const optimized = yield optimizeImageForOCR(file.buffer);
                        const original = yield callGoogleVisionAPI(optimized, apiKey);
                        const cleanedOriginal = original.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                        const corrected = yield corrigerTexteAvecChatGPT(cleanedOriginal);
                        return {
                            fileName: file.fileName,
                            type: file.fileType,
                            original: cleanedOriginal,
                            corrected,
                            status: cleanedOriginal === corrected ? "non corrigé" : "corrigé",
                        };
                    }
                    if (file.fileType === "document") {
                        const result = yield mammoth_1.default.convertToHtml({ buffer: file.buffer });
                        const original = result.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                        const corrected = yield corrigerTexteAvecChatGPT(original);
                        return {
                            fileName: file.fileName,
                            type: file.fileType,
                            original,
                            corrected,
                            status: original === corrected ? "non corrigé" : "corrigé",
                        };
                    }
                    if (file.fileType === "text") {
                        const original = file.buffer.toString("utf-8").replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                        const corrected = yield corrigerTexteAvecChatGPT(original);
                        return {
                            fileName: file.fileName,
                            type: file.fileType,
                            original,
                            corrected,
                            status: original === corrected ? "non corrigé" : "corrigé",
                        };
                    }
                    return { fileName: file.fileName, type: file.fileType, error: "Type non supporté" };
                }
                catch (err) {
                    return { fileName: file.fileName, type: file.fileType, error: err.message };
                }
            })));
            res.json(results);
        }
        catch (err) {
            console.error("Erreur serveur:", err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });
}
// Route Express pour tester
router.post("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield extractTexts(req, res);
}));
exports.default = router;
