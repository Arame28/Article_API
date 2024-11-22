// Initialiser express
const express = require("express");

//Initier le  dotenv
require('dotenv').config();

const {Pool} = require("pg");

// Initialiser express dans une constante app 
const app = express();

// Initialiser une constante qui va stocker notre port 
const port = process.env.PORT  || 3000;

// Connexion à PostgreSQL
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT // Port par défaut de PostgreSQL
    });

    //Création de la table utilisateur (à exécuter une fois)
    //initialiser une requete asynchrone sql avec pool.query
    pool.query(`CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        author JSONB
        )`)
        .then(() => console.log("La table articles a été crée ou est déjà existante."))
        .catch(err => console.log(`Une erreur s'est produite lors de la tentative de création de la table articles : ${err}.`));

        // Middleware pour parser le JSON
        app.use(express.json());

        // Définir les routes (GET, POST, PATCH, DELETE)
        // 1- Requete GET pour pouvoir récupérer tous les articles 
        app.get('/articles', async (req, res) => {
            try {
              const result = await pool.query('SELECT * FROM articles');
              res.status(200).json(result.rows);
            } catch (err) {
              console.error(err);
              res.status(500).json({ message: `Une erreur s'est produite lors de la tentative de récupération des articles` });
            }
          });

          // Requete GET pour récupérer un article uniquement par son ID
        app.get('/articles/:id', async (req, res) => {     
          const { id } = req.params;
          try {
            const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
            if (result.rows.length > 0) {
               res.status(200).json(result.rows[0]);
             } else {
               res.status(404).json({ message: 'Article non trouvé' });
             }
         } catch (err) {
           console.error(err);
           res.status(500).json({ error: 'Erreur serveur' });
         }
        });

        // Requete POST pour créer un nouvel article
app.post('/articles', async (req, res) => {
    const { title, content, author } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *',
        [title, content, author]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: `Erreur lord de la création d'un article` });
    }
  });
  
  // Requete PATCH pour mettre à jour un article
  app.patch('/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE articles SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *',
        [title, content, author, id]
      );
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ message: 'Article non trouvé' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de article' });
    }
  });
  
  // Requete DELETE pour supprimer un article
  app.delete('/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length > 0) {
        res.status(200).json({ message: 'Article supprimé avec succès' });
      } else {
        res.status(404).json({ message: 'Article non trouvé' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Lancer le serveur
  app.listen(port, () => { console.log(`Server listening on port ${port}`); });
   
  
 