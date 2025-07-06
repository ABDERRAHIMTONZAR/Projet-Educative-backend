--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-07-06 16:16:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 17267)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 18721)
-- Name: classe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classe (
    id_classe integer NOT NULL,
    nom text NOT NULL,
    niveau text NOT NULL
);


ALTER TABLE public.classe OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18720)
-- Name: classe_id_classe_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.classe ALTER COLUMN id_classe ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classe_id_classe_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 18782)
-- Name: devoir; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devoir (
    num_devoir integer NOT NULL,
    nom_devoir text NOT NULL,
    date_limite_devoir date NOT NULL,
    semestre text NOT NULL,
    url text NOT NULL,
    id_matiere integer NOT NULL,
    id_professeur integer NOT NULL,
    id_classe integer NOT NULL,
    type character varying(255)
);


ALTER TABLE public.devoir OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18781)
-- Name: devoir_num_devoir_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.devoir ALTER COLUMN num_devoir ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.devoir_num_devoir_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 18700)
-- Name: direction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direction (
    id_direction integer NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.direction OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 18699)
-- Name: direction_id_direction_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.direction ALTER COLUMN id_direction ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.direction_id_direction_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 18731)
-- Name: eleve; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eleve (
    id_eleve integer NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    id_parent integer,
    id_classe integer NOT NULL,
    id_direction integer NOT NULL
);


ALTER TABLE public.eleve OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18730)
-- Name: eleve_id_eleve_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.eleve ALTER COLUMN id_eleve ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.eleve_id_eleve_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 18874)
-- Name: examen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.examen (
    num_examen integer NOT NULL,
    nom_examen text NOT NULL,
    date_examen date NOT NULL,
    semestre text NOT NULL,
    url character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'general'::character varying,
    id_matiere integer NOT NULL,
    id_professeur integer NOT NULL,
    id_classe integer NOT NULL
);


ALTER TABLE public.examen OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 18873)
-- Name: examen_num_examen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.examen_num_examen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.examen_num_examen_seq OWNER TO postgres;

--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 235
-- Name: examen_num_examen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.examen_num_examen_seq OWNED BY public.examen.num_examen;


--
-- TOC entry 227 (class 1259 OID 18754)
-- Name: matiere; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matiere (
    id_matiere integer NOT NULL,
    nom text NOT NULL
);


ALTER TABLE public.matiere OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18753)
-- Name: matiere_id_matiere_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.matiere ALTER COLUMN id_matiere ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.matiere_id_matiere_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 18827)
-- Name: note_devoir; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note_devoir (
    id_eleve integer NOT NULL,
    num_devoir integer NOT NULL,
    note numeric(5,2) NOT NULL
);


ALTER TABLE public.note_devoir OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 18842)
-- Name: note_examen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note_examen (
    id_eleve integer NOT NULL,
    num_examen integer NOT NULL,
    note numeric(5,2) NOT NULL
);


ALTER TABLE public.note_examen OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18708)
-- Name: parent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parent (
    id_parent integer NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    id_direction integer NOT NULL
);


ALTER TABLE public.parent OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18707)
-- Name: parent_id_parent_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.parent ALTER COLUMN id_parent ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.parent_id_parent_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 18764)
-- Name: professeur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professeur (
    id_professeur integer NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    id_matiere integer NOT NULL,
    id_direction integer NOT NULL
);


ALTER TABLE public.professeur OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 18858)
-- Name: professeur_classe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professeur_classe (
    id_professeur integer NOT NULL,
    id_classe integer NOT NULL
);


ALTER TABLE public.professeur_classe OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18763)
-- Name: professeur_id_professeur_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.professeur ALTER COLUMN id_professeur ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.professeur_id_professeur_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4826 (class 2604 OID 18877)
-- Name: examen num_examen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen ALTER COLUMN num_examen SET DEFAULT nextval('public.examen_num_examen_seq'::regclass);


--
-- TOC entry 5021 (class 0 OID 18721)
-- Dependencies: 223
-- Data for Name: classe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classe (id_classe, nom, niveau) FROM stdin;
1	6A	6ème
2	6B	6ème
3	5A	5ème
4	5B	5ème
5	4A	4ème
6	4B	4ème
7	3A	3ème
8	3B	3ème
9	2A	2nde
10	2B	2nde
\.


--
-- TOC entry 5029 (class 0 OID 18782)
-- Dependencies: 231
-- Data for Name: devoir; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devoir (num_devoir, nom_devoir, date_limite_devoir, semestre, url, id_matiere, id_professeur, id_classe, type) FROM stdin;
18	vcbcfbgfc	2025-06-21	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749641446625_const_Admin_require..modelemode.txt	5	1	2	text/plain
19	TITRE	2025-06-21	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749641621030__Cahier_des_charges.pdf	2	1	2	application/pdf
20	vdwfvdfv	2025-06-21	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749648208941_const_Admin_require..modelemode.txt	1	1	1	general
21	bdfx	2025-06-14	fdbgf	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749648368245_const_Admin_require..modelemode.txt	1	1	1	general
22	DEVOIR 5	2025-06-21	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749658401455_rapport_de_pfe.pdf	5	1	2	application/pdf
23	vyhvjbj	2025-06-21	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749676235142_const_Admin_require..modelemode.txt	2	1	2	text/plain
24	jhbjun	2025-06-21	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749773038403_const_Admin_require..modelemode.txt	5	1	2	text/plain
25	vxdfdfv	2025-06-20	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749775587218_const_Admin_require..modelemode.txt	5	1	2	text/plain
26	iujkml	2025-06-27	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749850260300_pfe.docx	3	1	2	application/vnd.openxmlformats-officedocument.wordprocessingml.document
27	xfvd	2025-06-19	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749865202756_pfe.docx	5	1	2	application/vnd.openxmlformats-officedocument.wordprocessingml.document
28	titre2	2025-06-19	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749995516142_IAAI_INFO_IMG.docx	5	1	2	application/vnd.openxmlformats-officedocument.wordprocessingml.document
29	Devoir4	2025-06-20	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749996584017_IAAI_INFO_IMG.docx	5	1	2	application/vnd.openxmlformats-officedocument.wordprocessingml.document
30	Devoi45	2025-06-21	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749999131587__Cahier_des_charges.pdf	5	1	2	application/pdf
31	devoir'	2025-06-20	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1750001100913__Cahier_des_charges.pdf	5	1	2	application/pdf
\.


--
-- TOC entry 5017 (class 0 OID 18700)
-- Dependencies: 219
-- Data for Name: direction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.direction (id_direction, nom, prenom, email, password) FROM stdin;
1	Durand	Jean	jean.durand1@ecole.com	$2a$06$5FxNGgru65xH3qqkL/4ClOUCl0RU9Ra7vWk9bPaAtyi9tEh8N7nDy
2	Martin	Claire	claire.martin@ecole.com	$2a$06$jvHaBvVj9wLXM26nYTTGbOQjUm6mdkNJevyahHAfWwcLC4M8LRqWS
3	Petit	Luc	luc.petit@ecole.com	$2a$06$nkMJNSog16XNrTSdmNzKJOqSFQ1osW8iiNv.L.W7Lyqje.7U7VIWW
4	Moreau	Julie	julie.moreau@ecole.com	$2a$06$UTPA4Vh1ttCr99b.5s8LKeOktoc23svzMXDy2aoHeK5O6UyXhBivS
5	Lemoine	Paul	paul.lemoine@ecole.com	$2a$06$XJgoguZsy3XwEPZEjEWrLesGp8oHDIyftG1v8u.pE6tn92QPtDn/i
6	Garnier	Emma	emma.garnier@ecole.com	$2a$06$KQzjHoyThH4lev/CJXXmiehZyNBO9u1WZ9nkWYRKSNiTKQqMvlRAa
7	Roux	Thomas	thomas.roux@ecole.com	$2a$06$.0tkCaCDbemg7QQ8fHdtmuBEI1PlNAZMpdYC3xGwMnxtv3Z4HK4Ma
8	Blanc	Alice	alice.blanc@ecole.com	$2a$06$HPl0QXHXxHz6VWtwJbIn/.G3/WSxj9hXUEbcoFAx60/ysJPlLAole
9	Henry	Antoine	antoine.henry@ecole.com	$2a$06$yzO.XiIfj7IngUflubEAxupm2LC5l1Cl/v6Iu9YhoMZuW.0JMRte.
10	Bertrand	Chloe	chloe.bertrand@ecole.com	$2a$06$d0XGVpu0wds7UkA8BMuFu.lXxvPR.TKJKsVgUfGT8zyIwqp1Bdm7a
\.


--
-- TOC entry 5023 (class 0 OID 18731)
-- Dependencies: 225
-- Data for Name: eleve; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eleve (id_eleve, nom, prenom, email, password, id_parent, id_classe, id_direction) FROM stdin;
1	Dupont	Alice	alice.dupont@eleve.com	$2a$06$lR/z3y7s8I2OBs07TuRx2OwYFFrhvvNoaVl7HD7kROB6Rgcac4NYe	1	1	1
2	Dubois	Leo	leo.dubois@eleve.com	$2a$06$hbpyb7kUqRmtsX2GUnSNJepocNzmJSsnOU.WE2QnuHRn.svN3u02K	2	2	2
3	Fontaine	Emma	emma.fontaine@eleve.com	$2a$06$BBBIOwIpXY3lICr0uKdPvej20wVtEwr0DYyQg6ysqHT3N.ctUefI6	3	3	3
4	Carre	Lucas	lucas.carre@eleve.com	$2a$06$04ZDFRH9IP7vRFFGTIccX.0.OlbxIAobxUQ6qdvdjHcxb3Jewpory	4	4	4
5	Renard	Lina	lina.renard@eleve.com	$2a$06$c4vrurTiR72I2zqkRrwfw.dFZJRBf4ldOReMu68G5Xc.vm0QkXjHe	5	5	5
6	Perrot	Nathan	nathan.perrot@eleve.com	$2a$06$hjOqyNovdlz6jE6uCTbOU.qXrTEXKlgIoF/wGnu/2dE8gUocdqHAa	6	6	6
7	Leclerc	Mila	mila.leclerc@eleve.com	$2a$06$kEuIK3frJrrYtPn7A5oPse7rY.ZitJQSwA5rQk.pxoIipiCc.cdq.	7	7	7
8	Rolland	Tom	tom.rolland@eleve.com	$2a$06$VjxuTlg66b/CD0DSGP8vnu1R10PYr0VqtMsiIZm7rzbvPp54.Rxba	8	8	8
9	Benoit	Sarah	sarah.benoit@eleve.com	$2a$06$xZHFegGyfJFDAh5ZRtB0/eGh2cAxTNH99nu6Vpd7aXKm7cySqhVYG	9	9	9
10	Lopez	Enzo	enzo.lopez@eleve.com	$2a$06$girgGXNl1d54U2ycsFasdOPn3bnKoDclDB8dUL50khv9C6ssL8THq	10	10	10
11	Martin	Sophie	sophie.martin@email.com	$2b$10$x.qoe14/s.Hix3SWli7D2eCzGX12ZlbrbgRIMbGKeCTlJ3lu/B0oq	\N	1	1
12	Tonzar	ABDERRAHIM	tonzarabderrahim@gmail.com	$2b$10$3wnxIQkRYAHWl8gFa9IhUOrk6/qNaOS86VOcG/E9wtYoPvlOo6eoS	\N	5	1
14	Tonzar	ABDERRAHIM	abdoutonzarm@gmail.com	$2b$10$M9sl0RwEhrN7EDwvOhzvnO.49md6LvSB3uZ8EJHlO7xsoKCgpnaqe	\N	7	1
15	Tonzar	ABDERRAHIM	abdoutonzarrr@gmail.com	$2b$10$hSpkH6wUICf1TR6NAb59buN68OBL/hYvuBvTtjOrseh17B3lBExLW	\N	7	1
16	Tonzar	ABDERRAHIM	trbe@gmail.com	$2b$10$qZBPx45V4X/4vKulIG678OmYflzDstzmvDog3XAdardRr2gnWIK..	\N	1	1
13	Tonzar	ABDERRAHIM	abdoutonzar@gmail.com	$2b$10$27OErqldWGQ34PEj/4rRAOCZ63lxYs.e0M2D837rdRazB.knSlhwy	\N	7	1
17	Tonzar	ABDERRAHIM	abdouerftonzar@gmail.com	$2b$10$UdfXFl2TDnaxiA8S8ezYW.lYGeLfp78K0wlZUjtMhToLNrsjZDidu	\N	5	1
\.


--
-- TOC entry 5034 (class 0 OID 18874)
-- Dependencies: 236
-- Data for Name: examen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.examen (num_examen, nom_examen, date_examen, semestre, url, type, id_matiere, id_professeur, id_classe) FROM stdin;
1	Examen PHP Avancé	2024-03-20	2024_S1	https://votre-url-s3.com/examen.pdf	pdf	3	1	2
2	dfvdfv	2025-06-15	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749774728849_const_Admin_require..modelemode.txt	text/plain	5	1	2
3	fcbgfb	2025-06-13	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749774963608_const_Admin_require..modelemode.txt	text/plain	5	1	2
4	ABDERRAHIM	2025-06-21	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749775141210_const_Admin_require..modelemode.txt	text/plain	5	1	2
5	dvfd	2025-06-14	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749775192343__Cahier_des_charges.pdf	application/pdf	5	1	2
6	Examen PHP Avancé	2024-03-20	2024_S1	https://votre-url-s3.com/examen.pdf	pdf	3	1	2
7	dfbd	2025-06-20	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749851493328_pfe.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	5	1	2
8	CSCDS	2025-06-26	12	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749865259043_INTRODUCTION.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	5	1	2
9	Examej 3	2025-06-26	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749996616545_IAAI_INFO_IMG.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	5	1	2
10	Examen 4	2025-06-22	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1749999189914__Cahier_des_charges.pdf	application/pdf	5	1	2
11	Examen 1	2025-06-26	2	https://evalyasmart.s3.eu-west-3.amazonaws.com/uploads/1750001161395__Cahier_des_charges.pdf	application/pdf	5	1	2
\.


--
-- TOC entry 5025 (class 0 OID 18754)
-- Dependencies: 227
-- Data for Name: matiere; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matiere (id_matiere, nom) FROM stdin;
1	Mathématiques
2	Français
3	Histoire
4	Géographie
5	Physique
6	Chimie
7	SVT
8	Anglais
9	Espagnol
10	Informatique
\.


--
-- TOC entry 5030 (class 0 OID 18827)
-- Dependencies: 232
-- Data for Name: note_devoir; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.note_devoir (id_eleve, num_devoir, note) FROM stdin;
\.


--
-- TOC entry 5031 (class 0 OID 18842)
-- Dependencies: 233
-- Data for Name: note_examen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.note_examen (id_eleve, num_examen, note) FROM stdin;
1	1	15.50
2	2	14.00
3	3	13.50
4	4	17.00
5	5	16.75
6	6	12.25
7	7	14.75
8	8	15.00
9	9	13.00
10	10	16.25
\.


--
-- TOC entry 5019 (class 0 OID 18708)
-- Dependencies: 221
-- Data for Name: parent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parent (id_parent, nom, prenom, email, password, id_direction) FROM stdin;
1	Leroy	Sophie	sophie.leroy@parent.com	$2a$06$8DC05vRTp3JXgtLNDMjc5ux.aogy1bfzV4EVU/2NFMHDJtkpn0/wW	1
2	Robin	David	david.robin@parent.com	$2a$06$iB0ZSgvnBxle1zf8WBL3O.4snl82UWJUX4gcKqGQkUAIJ9u0sjknm	2
3	Guerin	Laura	laura.guerin@parent.com	$2a$06$pCJnCf34ecghiCVcMAimXONxNoOcvwbBPHCORi9mrFfl3kpTuMlca	3
4	Perez	Hugo	hugo.perez@parent.com	$2a$06$y.SnxZs3ZDViTtR.gfwFuuo8s/26mhYxINNXNvhGTZVnQl8E318Ni	4
5	Marchand	Isabelle	isabelle.marchand@parent.com	$2a$06$obt4DI9HG6uj0siVWEw3dusja9q6li3PmAUNLIaisOGQr8UXy8y5m	5
6	Noel	Mathieu	mathieu.noel@parent.com	$2a$06$ewhnzl91//45uIBczm/B2eafDIzp9KshgMIovsVIh25Wq429ghQw6	6
7	Moulin	Amandine	amandine.moulin@parent.com	$2a$06$JE6bksyNJT/hBlQwNtY2wO20lJsAB68uvVd/YxRxOaCKGdepS5pj6	7
8	Charles	Lucas	lucas.charles@parent.com	$2a$06$yNxfOpkz.3vvcHwxaLloGOOO3iNmGHg1CiZmoQ3q0pqnBSn6E7k5K	8
9	Regnier	Celine	celine.regnier@parent.com	$2a$06$eJ9trrTkngfd6rIO/G8B3OMb6g/e1wT3oOTuIx5VbjHq01ZkraATm	9
10	Roy	Maxime	maxime.roy@parent.com	$2a$06$wpBPMXvkR9I4xxy6mkQe6O7Nc8kOfDwVEs26P1o/W9SRUMlIpEKZq	10
11	Dupont	Jean	jean.dupont@email.com	$2b$10$Pb8G8FHtonni7Rp5BPpkxuS1.0382gjy/.DvT8RwJdhhIS.DXCt2W	1
12	Tonzar	ABDERRAHIM	abdoutonzar@gmail.com	$2b$10$NvkN7LRWIZsQZ711X5FLye/oK5IkC2Oh6qfQKKkoCxKMMyselE9cW	1
13	Tonzar	ABDERRAHIM	abdoutonzarr@gmail.com	$2b$10$XVqdvgKHO.6WYjBMQeOCMOfBD19adS2rb8yPO.EJzQ17.uE/.FMiW	1
14	Tonzar	ABDERRAHIM	abdoutonzcdar@gmail.com	$2b$10$GjvZUqANmCK1kJW1W5gEr.QUgA21Lt6CEypN1JQlgYkrHwt.abNla	1
15	Tonzar	ABDERRAHIM	abdoutonzarrr@gmail.com	$2b$10$N2/e.BOp6ecSKSVJs5zX.u3WSDGErpS/ERDSQO8IvF1yCZX5hKkNy	1
16	Tonzar	ABDERRAHIM	hamza@gmail.com	$2b$10$h1toma8m/AIUbC4Nkf7rXevyOAfRH27BKp7ta/g8loDRNq.M1nUlW	1
17	Tonzar	ABDERRAHIM	abdoutonzarffez@gmail.com	$2b$10$M2v3vngf9U8ObskyuZKN1ONNsW8oOEkyeKj2jxrIKLYZUxkC4QAly	1
\.


--
-- TOC entry 5027 (class 0 OID 18764)
-- Dependencies: 229
-- Data for Name: professeur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professeur (id_professeur, nom, prenom, email, password, id_matiere, id_direction) FROM stdin;
1	Simon	Claire	claire.simon@prof.com	$2a$06$ReclIfk9lgPbXsDoGtXpleK4bjq7UGtJL4QWn9MO.fhO5feCYRswu	1	1
2	Roche	Julien	julien.roche@prof.com	$2a$06$Ys4xd16/movxBe6l/B/QTunlEMGOngO8xKvUrwCauoU8gXVQLR3xK	2	2
3	Maury	Sophie	sophie.maury@prof.com	$2a$06$a.ti3iqXhdrmApdqILjVg.gk3sFE9vnvaZxVa0zxYd8xYOlDFd7nq	3	3
4	Baron	Luc	luc.baron@prof.com	$2a$06$qbvatxlfDyF1qUt4AbyZ1.TwQuhesYijnU7wAroFI4X8wiFF7bOh2	4	4
5	Paul	Nina	nina.paul@prof.com	$2a$06$RRD8IaMxNLs55PnG5.nN6.E8nlJU/oSnqgLVkSLZAUDnZNMCcuaau	5	5
6	Lamy	Olivier	olivier.lamy@prof.com	$2a$06$GQAssQQdQRZCFPZANIt9PejoDzpoO5BEw5vivs0EcgIECNru115QS	6	6
7	Teixeira	Julie	julie.teixeira@prof.com	$2a$06$baczumYXhXOXo96aK3/kKu5XabxCyw2KRaOpXm6imQJkP9zvPUhoe	7	7
8	Adam	Marc	marc.adam@prof.com	$2a$06$oA43rUEIq0maNaseVxFmY.3L6y/LtmrBa4IAagmPssA9GFSYAwhsq	8	8
9	Rollin	Emma	emma.rollin@prof.com	$2a$06$6cmVifRRrM4QDbNldFC89.DAS49I2Cj.aedbz4cz5XDYJtmb6Z3DO	9	9
10	Noel	Hugo	hugo.noel@prof.com	$2a$06$DDH2JmDYBfhWX8vcEUZLdeUhjCv.UIYvBd9JgmhECNGQGCiAgIKx2	10	10
11	Dubois	Pierre	pierre.dubois@email.com	$2b$10$JqjrnLCA2ctUJyRoVGvxY.3rGu.YkyucTHq8tbV5gFxIhGKf1JNjW	1	1
12	Dubois	Pierre	abdoutonzar@gmail.com	$2b$10$nljzoVg.nJBCGrubNNJtWOGc8SQIo04FfkOCLUu1kAmRq6QXc9F06	1	1
13	Tonzar	ABDERRAHIM	mohamed@gmail.com	$2b$10$42yPCo8EEXSrYDqLQ5ITh.OuXKlLVIbvDcXZ5a8Zrd8NrNgChTpou	7	1
14	Tonzar	ABDERRAHIM	abdoutonzatr@gmail.com	$2b$10$.5.45Mfmo654Ki2pvO0xiu5XVe2u6GKYyiybHeb4S4CfLOugoq4uW	10	1
15	Tonzar	ABDERRAHIM	abdoutonzarrrr@gmail.com	$2b$10$HjqOGc8h1UkTlH8H3yMGZeiwN3gMQ/dsoOf4fY9a/Gpqn.wJTVal2	7	1
16	Tonzar	ABDERRAHIM	enseignent@gmail.com	$2b$10$1Y7PVsDcWwCjjeh3LLeSyeDVCG3GWkFe19sKAUu.nPwsPdo2uAuj2	6	1
17	Tonzar	ABDERRAHIM	abdoutorrnzarrrr@gmail.com	$2b$10$1jjL5qe75BNqdf99jeaNQunMdhaABuvL8skA6rbjgcho7rovq3Xhq	8	1
\.


--
-- TOC entry 5032 (class 0 OID 18858)
-- Dependencies: 234
-- Data for Name: professeur_classe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professeur_classe (id_professeur, id_classe) FROM stdin;
1	1
1	2
2	1
2	3
3	2
\.


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 222
-- Name: classe_id_classe_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classe_id_classe_seq', 10, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 230
-- Name: devoir_num_devoir_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devoir_num_devoir_seq', 31, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 218
-- Name: direction_id_direction_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.direction_id_direction_seq', 10, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 224
-- Name: eleve_id_eleve_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eleve_id_eleve_seq', 17, true);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 235
-- Name: examen_num_examen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.examen_num_examen_seq', 11, true);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 226
-- Name: matiere_id_matiere_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matiere_id_matiere_seq', 10, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 220
-- Name: parent_id_parent_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parent_id_parent_seq', 17, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 228
-- Name: professeur_id_professeur_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.professeur_id_professeur_seq', 17, true);


--
-- TOC entry 4833 (class 2606 OID 18729)
-- Name: classe classe_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classe
    ADD CONSTRAINT classe_nom_key UNIQUE (nom);


--
-- TOC entry 4835 (class 2606 OID 18727)
-- Name: classe classe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classe
    ADD CONSTRAINT classe_pkey PRIMARY KEY (id_classe);


--
-- TOC entry 4845 (class 2606 OID 18788)
-- Name: devoir devoir_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devoir
    ADD CONSTRAINT devoir_pkey PRIMARY KEY (num_devoir);


--
-- TOC entry 4829 (class 2606 OID 18706)
-- Name: direction direction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direction
    ADD CONSTRAINT direction_pkey PRIMARY KEY (id_direction);


--
-- TOC entry 4837 (class 2606 OID 18737)
-- Name: eleve eleve_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eleve
    ADD CONSTRAINT eleve_pkey PRIMARY KEY (id_eleve);


--
-- TOC entry 4853 (class 2606 OID 18882)
-- Name: examen examen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_pkey PRIMARY KEY (num_examen);


--
-- TOC entry 4839 (class 2606 OID 18762)
-- Name: matiere matiere_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matiere
    ADD CONSTRAINT matiere_nom_key UNIQUE (nom);


--
-- TOC entry 4841 (class 2606 OID 18760)
-- Name: matiere matiere_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matiere
    ADD CONSTRAINT matiere_pkey PRIMARY KEY (id_matiere);


--
-- TOC entry 4847 (class 2606 OID 18831)
-- Name: note_devoir note_devoir_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_devoir
    ADD CONSTRAINT note_devoir_pkey PRIMARY KEY (id_eleve, num_devoir);


--
-- TOC entry 4849 (class 2606 OID 18846)
-- Name: note_examen note_examen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_examen
    ADD CONSTRAINT note_examen_pkey PRIMARY KEY (id_eleve, num_examen);


--
-- TOC entry 4831 (class 2606 OID 18714)
-- Name: parent parent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent
    ADD CONSTRAINT parent_pkey PRIMARY KEY (id_parent);


--
-- TOC entry 4851 (class 2606 OID 18862)
-- Name: professeur_classe professeur_classe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur_classe
    ADD CONSTRAINT professeur_classe_pkey PRIMARY KEY (id_professeur, id_classe);


--
-- TOC entry 4843 (class 2606 OID 18770)
-- Name: professeur professeur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur
    ADD CONSTRAINT professeur_pkey PRIMARY KEY (id_professeur);


--
-- TOC entry 4868 (class 2606 OID 18893)
-- Name: examen examen_id_classe_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_id_classe_fkey FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe);


--
-- TOC entry 4869 (class 2606 OID 18883)
-- Name: examen examen_id_matiere_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_id_matiere_fkey FOREIGN KEY (id_matiere) REFERENCES public.matiere(id_matiere);


--
-- TOC entry 4870 (class 2606 OID 18888)
-- Name: examen examen_id_professeur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_id_professeur_fkey FOREIGN KEY (id_professeur) REFERENCES public.professeur(id_professeur);


--
-- TOC entry 4866 (class 2606 OID 18868)
-- Name: professeur_classe fk_classe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur_classe
    ADD CONSTRAINT fk_classe FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe) ON DELETE CASCADE;


--
-- TOC entry 4860 (class 2606 OID 18799)
-- Name: devoir fk_classe_devoir; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devoir
    ADD CONSTRAINT fk_classe_devoir FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe) ON DELETE CASCADE;


--
-- TOC entry 4855 (class 2606 OID 18743)
-- Name: eleve fk_classe_eleve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eleve
    ADD CONSTRAINT fk_classe_eleve FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe) ON DELETE CASCADE;


--
-- TOC entry 4863 (class 2606 OID 18837)
-- Name: note_devoir fk_devoir_nd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_devoir
    ADD CONSTRAINT fk_devoir_nd FOREIGN KEY (num_devoir) REFERENCES public.devoir(num_devoir) ON DELETE CASCADE;


--
-- TOC entry 4856 (class 2606 OID 18748)
-- Name: eleve fk_direction_eleve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eleve
    ADD CONSTRAINT fk_direction_eleve FOREIGN KEY (id_direction) REFERENCES public.direction(id_direction) ON DELETE RESTRICT;


--
-- TOC entry 4854 (class 2606 OID 18715)
-- Name: parent fk_direction_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent
    ADD CONSTRAINT fk_direction_parent FOREIGN KEY (id_direction) REFERENCES public.direction(id_direction) ON DELETE RESTRICT;


--
-- TOC entry 4858 (class 2606 OID 18776)
-- Name: professeur fk_direction_prof; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur
    ADD CONSTRAINT fk_direction_prof FOREIGN KEY (id_direction) REFERENCES public.direction(id_direction) ON DELETE RESTRICT;


--
-- TOC entry 4864 (class 2606 OID 18832)
-- Name: note_devoir fk_eleve_nd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_devoir
    ADD CONSTRAINT fk_eleve_nd FOREIGN KEY (id_eleve) REFERENCES public.eleve(id_eleve) ON DELETE CASCADE;


--
-- TOC entry 4865 (class 2606 OID 18847)
-- Name: note_examen fk_eleve_ne; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_examen
    ADD CONSTRAINT fk_eleve_ne FOREIGN KEY (id_eleve) REFERENCES public.eleve(id_eleve) ON DELETE CASCADE;


--
-- TOC entry 4861 (class 2606 OID 18789)
-- Name: devoir fk_matiere_devoir; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devoir
    ADD CONSTRAINT fk_matiere_devoir FOREIGN KEY (id_matiere) REFERENCES public.matiere(id_matiere) ON DELETE CASCADE;


--
-- TOC entry 4859 (class 2606 OID 18771)
-- Name: professeur fk_matiere_prof; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur
    ADD CONSTRAINT fk_matiere_prof FOREIGN KEY (id_matiere) REFERENCES public.matiere(id_matiere) ON DELETE CASCADE;


--
-- TOC entry 4857 (class 2606 OID 18738)
-- Name: eleve fk_parent_eleve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eleve
    ADD CONSTRAINT fk_parent_eleve FOREIGN KEY (id_parent) REFERENCES public.parent(id_parent) ON DELETE CASCADE;


--
-- TOC entry 4867 (class 2606 OID 18863)
-- Name: professeur_classe fk_professeur; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur_classe
    ADD CONSTRAINT fk_professeur FOREIGN KEY (id_professeur) REFERENCES public.professeur(id_professeur) ON DELETE CASCADE;


--
-- TOC entry 4862 (class 2606 OID 18794)
-- Name: devoir fk_professeur_devoir; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devoir
    ADD CONSTRAINT fk_professeur_devoir FOREIGN KEY (id_professeur) REFERENCES public.professeur(id_professeur) ON DELETE CASCADE;


-- Completed on 2025-07-06 16:16:20

--
-- PostgreSQL database dump complete
--

