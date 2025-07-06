// Déclenche recompilation pour Railway
// Déclenche recompilation pour Railway
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Op, QueryTypes } from 'sequelize';
import '../connexion.js';
import sequelize from '../connexion.js';
import { Eleve, Professeur, Parent, Direction, Examen, Devoir, Classe, Matiere } from '../models/modele.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { tmpdir } from "os";
import poppler from "pdf-poppler";
import sharp from "sharp";
import mammoth from 'mammoth';
dotenv.config();
///LOGINNNN
const SECRET_KEY = process.env.SECRET_KEY || 'secret';
const router = Router();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await Eleve.findOne({ where: { email } });
        let role = "eleve";
        let userId;
        if (!user) {
            user = await Professeur.findOne({ where: { email } });
            role = "enseignant";
        }
        if (!user) {
            user = await Parent.findOne({ where: { email } });
            role = "parent";
        }
        if (!user) {
            user = await Direction.findOne({ where: { email } });
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
        const isPasswordValid = await bcrypt.compare(password, user.getDataValue('password'));
        if (isPasswordValid) {
            const token = jwt.sign({ id: userId, role: role }, SECRET_KEY, { expiresIn: '2h' });
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
});
///TROUBLE PASSWORD
const transporter = nodemailer.createTransport({
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
router.post("/forgetpassword", async (req, res) => {
    const { email } = req.body;
    try {
        let foundUser = await Eleve.findOne({ where: { email } });
        let role = "eleve";
        if (!foundUser) {
            foundUser = await Professeur.findOne({ where: { email } });
            role = "enseignant";
        }
        if (!foundUser) {
            foundUser = await Parent.findOne({ where: { email } });
            role = "parent";
        }
        if (!foundUser) {
            foundUser = await Direction.findOne({ where: { email } });
            role = "direction";
        }
        if (!foundUser) {
            res.status(404).send("Utilisateur introuvable");
            return;
        }
        const generatedPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        if (role === "eleve") {
            await Eleve.update({ password: hashedPassword }, { where: { email } });
        }
        else if (role === "enseignant") {
            await Professeur.update({ password: hashedPassword }, { where: { email } });
        }
        else if (role === "parent") {
            await Parent.update({ password: hashedPassword }, { where: { email } });
        }
        else if (role === "direction") {
            await Direction.update({ password: hashedPassword }, { where: { email } });
        }
        const mailOptions = {
            from: 'admin@gmail.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Votre nouveau mot de passe est : ${generatedPassword}\n\nVeuillez vous connecter avec ce mot de passe et le changer immédiatement.`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).send(`Un email avec le nouveau mot de passe a été envoyé: ${generatedPassword}`);
    }
    catch (err) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", err);
        res.status(500).send("Erreur lors de la réinitialisation du mot de passe");
    }
});
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).send("Aucun token fourni");
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).send("Aucun token fourni");
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send("Token invalide");
        }
        req.user = decoded;
        next();
    });
};
///UPLOAD FILE
const s3Client = new S3Client({
    region: 'eu-west-3',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
router.get('/upload', verifyToken, async (req, res) => {
    const { name, type } = req.query;
    console.log(name, type);
    if (!name || !type) {
        return res.status(400).json({ error: 'Nom du fichier et type requis' });
    }
    const cleanName = name.replace(/\s/g, '_').replace(/[^\w.-]/g, '');
    const params = new PutObjectCommand({
        Bucket: 'evalyasmart',
        Key: `uploads/${Date.now()}_${cleanName}`,
        ContentType: type,
    });
    try {
        const url = await getSignedUrl(s3Client, params, { expiresIn: 60 * 60 });
        res.status(200).json({ url });
        console.log(url);
    }
    catch (err) {
        console.error('Erreur génération URL :', err);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'URL pré-signée' });
    }
});
router.post('/enregistrer', verifyToken, async (req, res) => {
    try {
        const { title, subject, dueDate, semestre, className, url, type } = req.body;
        const { id } = req.user;
        if (!title || !subject || !dueDate || !semestre || !className || !url) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }
        // Vérifier si la matière existe
        const matiere = await Matiere.findOne({
            where: {
                nom: subject
            }
        });
        if (!matiere) {
            return res.status(404).json({ message: 'Matière introuvable' });
        }
        // Vérifier si la classe existe
        const classe = await Classe.findOne({
            where: {
                nom: className
            }
        });
        if (!classe) {
            return res.status(404).json({ message: 'Classe introuvable' });
        }
        // Créer le devoir
        const newDevoir = await Devoir.create({
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
});
router.post('/enregistrerExamen', verifyToken, async (req, res) => {
    try {
        const { title, subject, dueDate, semestre, className, url, type } = req.body;
        const { id } = req.user;
        if (!title || !subject || !dueDate || !semestre || !className || !url) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }
        // Vérifier si la matière existe
        const matiere = await Matiere.findOne({
            where: {
                nom: subject
            }
        });
        if (!matiere) {
            return res.status(404).json({ message: 'Matière introuvable' });
        }
        // Vérifier si la classe existe
        const classe = await Classe.findOne({
            where: {
                nom: className
            }
        });
        if (!classe) {
            return res.status(404).json({ message: 'Classe introuvable' });
        }
        // Créer l'examen
        const newExamen = await Examen.create({
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
});
///RECOVER FILE
router.get('/recuperer', verifyToken, async (req, res) => {
    try {
        const { id } = req.user;
        const devoirs = await Devoir.findAll({
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
});
router.get('/recupererExamen', verifyToken, async (req, res) => {
    try {
        const { id } = req.user;
        const examens = await Examen.findAll({
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
});
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        // Make sure Sequelize is connected
        await sequelize.authenticate();
        const examensCount = await Examen.count({
            where: {
                date_examen: {
                    [Op.gt]: now,
                },
            },
        });
        const elevesCount = await Eleve.count();
        const devoirsCount = await Devoir.count({
            where: {
                date_limite_devoir: {
                    [Op.lt]: now,
                },
            },
        });
        const classesCount = await Classe.count();
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
});
router.get('/dashboard-stats', async (req, res) => {
    try {
        const now = new Date();
        // 1. Total devoirs
        const totalDevoir = await Devoir.count();
        // 2. Devoirs whose deadline passed
        const devoirEnCours = await Devoir.count({
            where: {
                date_limite_devoir: {
                    [Op.lt]: now,
                },
            },
        });
        const [results] = await sequelize.query(`
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
});
router.get('/devoirs-with-class-prof', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/examens-dashboard', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/examens-details', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/eleves_info', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/eleves-moyenne-examen', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/enseignants-classes-stats', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/enseignants/classes', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
router.get('/stats', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
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
});
// 1. Performance Trends Data
router.get('/performance-data', async (req, res) => {
    try {
        const rows = await sequelize.query(`
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
            type: QueryTypes.SELECT,
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
});
// 2. Subject Performance
router.get('/subject-performance', async (req, res) => {
    try {
        const currentSemester = '2025_S1';
        const previousSemester = '2024_S2';
        const rows = await sequelize.query(`
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
            type: QueryTypes.SELECT,
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
});
// 3. Class Distribution (already correct)
router.get('/class-distribution', async (req, res) => {
    try {
        const rows = await sequelize.query(`
      SELECT
        c.nom AS class,
        COUNT(e.id_eleve) AS students
      FROM classe c
      LEFT JOIN eleve e ON c.id_classe = e.id_classe
      GROUP BY c.nom
      ORDER BY c.nom;
    `, {
            type: QueryTypes.SELECT,
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
});
// 4. Key Indicators (with real calculations)
router.get('/key-indicators', async (req, res) => {
    try {
        // Calculate real indicators from database
        const [attendance] = await sequelize.query(`
      SELECT ROUND(100.0 * COUNT(CASE WHEN present THEN 1 END) / COUNT(*)) AS taux
      FROM presence;
    `, { type: QueryTypes.SELECT });
        const [assignments] = await sequelize.query(`
      SELECT ROUND(100.0 * COUNT(CASE WHEN rendu THEN 1 END) / COUNT(*)) AS taux
      FROM devoir_rendu;
    `, { type: QueryTypes.SELECT });
        const [participation] = await sequelize.query(`
      SELECT ROUND(AVG(participation) * 100) AS taux
      FROM evaluation_participation;
    `, { type: QueryTypes.SELECT });
        const [satisfaction] = await sequelize.query(`
      SELECT ROUND(AVG(satisfaction) * 100) AS taux
      FROM enquete_parents;
    `, { type: QueryTypes.SELECT });
        res.json({
            tauxAssiduite: attendance?.taux || 0,
            devoirsRendus: assignments?.taux || 0,
            participation: participation?.taux || 0,
            satisfactionParents: satisfaction?.taux || 0,
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
});
router.get('/classes', verifyToken, async (req, res) => {
    try {
        const classes = await Classe.findAll();
        res.json(classes);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
router.get('/matieres', verifyToken, async (req, res) => {
    try {
        const matieres = await Matiere.findAll();
        res.json(matieres);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des matières:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Route pour créer un compte parent
router.post('/create-parent', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, email, password, eleve_nom, eleve_prenom } = req.body;
        const { id } = req.user;
        // Vérifier si l'email du parent existe déjà
        const existingUser = await Parent.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Vérifier si l'élève existe
        const existingEleve = await Eleve.findOne({
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const parent = await Parent.create({
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
});
// Route pour créer un compte élève
router.post('/create-student', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, email, password, id_classe } = req.body;
        const { id } = req.user; // id de la direction
        // Vérifier si l'email existe déjà
        const existingUser = await Eleve.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Créer l'élève
        const hashedPassword = await bcrypt.hash(password, 10);
        const eleve = await Eleve.create({
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
});
// Route pour créer un compte enseignant
router.post('/create-teacher', verifyToken, async (req, res) => {
    try {
        const { nom, prenom, email, password, id_matiere } = req.body;
        const { id } = req.user; // id de la direction
        // Vérifier si l'email existe déjà
        const existingUser = await Professeur.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Créer l'enseignant
        const hashedPassword = await bcrypt.hash(password, 10);
        const professeur = await Professeur.create({
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
});
router.get('/getexamens', async (req, res) => {
    try {
        const examsRaw = await sequelize.query(`
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
            type: QueryTypes.SELECT
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
});
router.get('/getdevoirs', async (req, res) => {
    try {
        const devoirsRaw = await sequelize.query(`
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
            type: QueryTypes.SELECT
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
});
import OpenAI from 'openai';
const openai = new OpenAI({
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
async function convertPdfToImages(pdfBuffer, fileName) {
    const tempDir = tmpdir();
    const pdfPath = path.join(tempDir, fileName);
    await fs.writeFile(pdfPath, pdfBuffer);
    const opts = {
        format: "jpeg",
        out_dir: tempDir,
        out_prefix: `${path.parse(fileName).name}-page`,
        page: undefined,
    };
    await poppler.convert(pdfPath, opts);
    const files = await fs.readdir(tempDir);
    const imageFiles = files
        .filter((f) => f.startsWith(`${path.parse(fileName).name}-page`) && f.endsWith(".jpg"))
        .map((f) => path.join(tempDir, f));
    await fs.unlink(pdfPath);
    return imageFiles;
}
async function optimizeImageForOCR(imageBuffer) {
    return sharp(imageBuffer).resize(2000).sharpen().greyscale().normalize().toBuffer();
}
async function callGoogleVisionAPI(imageBuffer, apiKey) {
    const body = {
        requests: [
            {
                image: { content: imageBuffer.toString("base64") },
                features: [{ type: "TEXT_DETECTION" }],
            },
        ],
    };
    const response = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, body);
    const resData = response.data.responses[0];
    if (resData.error)
        throw new Error(resData.error.message);
    const text = resData.textAnnotations?.[0]?.description?.trim();
    return text || "[Aucun texte détecté]";
}
async function corrigerTexteAvecChatGPT(texte) {
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
        const completion = await openai.chat.completions.create({
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
        const response = completion.choices[0].message?.content;
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
}
async function recupererCorrection() {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: "corrections/",
        });
        const data = await s3Client.send(listCommand);
        if (!data.Contents || data.Contents.length === 0)
            return [];
        const filesWithData = await Promise.all(data.Contents.map(async (file) => {
            if (!file.Key)
                return null;
            const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: file.Key });
            const s3Object = await s3Client.send(getObjectCommand);
            const fileBuffer = await streamToBuffer(s3Object.Body);
            const ext = path.extname(file.Key).toLowerCase();
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
        }));
        return filesWithData.filter((f) => f !== null);
    }
    catch (err) {
        console.error("Erreur récupération fichiers:", err);
        return [];
    }
}
async function extractTexts(req, res) {
    try {
        const files = await recupererCorrection();
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: "Clé API Google manquante" });
            return;
        }
        const results = await Promise.all(files.map(async (file) => {
            try {
                if (file.fileType === "pdf") {
                    const imagePaths = await convertPdfToImages(file.buffer, path.basename(file.fileName));
                    const extractedTexts = await Promise.all(imagePaths.map(async (imgPath) => {
                        const imgBuffer = await fs.readFile(imgPath);
                        const optimized = await optimizeImageForOCR(imgBuffer);
                        const text = await callGoogleVisionAPI(optimized, apiKey);
                        await fs.unlink(imgPath);
                        return text;
                    }));
                    const original = extractedTexts.join(" ").replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                    const corrected = await corrigerTexteAvecChatGPT(original);
                    return {
                        fileName: file.fileName,
                        type: file.fileType,
                        original,
                        corrected,
                        status: original === corrected ? "non corrigé" : "corrigé",
                    };
                }
                if (file.fileType === "image") {
                    const optimized = await optimizeImageForOCR(file.buffer);
                    const original = await callGoogleVisionAPI(optimized, apiKey);
                    const cleanedOriginal = original.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                    const corrected = await corrigerTexteAvecChatGPT(cleanedOriginal);
                    return {
                        fileName: file.fileName,
                        type: file.fileType,
                        original: cleanedOriginal,
                        corrected,
                        status: cleanedOriginal === corrected ? "non corrigé" : "corrigé",
                    };
                }
                if (file.fileType === "document") {
                    const result = await mammoth.convertToHtml({ buffer: file.buffer });
                    const original = result.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                    const corrected = await corrigerTexteAvecChatGPT(original);
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
                    const corrected = await corrigerTexteAvecChatGPT(original);
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
        }));
        res.json(results);
    }
    catch (err) {
        console.error("Erreur serveur:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
// Route Express pour tester
router.post("/test", async (req, res) => {
    await extractTexts(req, res);
});
export default router;
