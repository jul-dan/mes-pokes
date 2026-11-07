# Premiers pas : reconnaissance des lettres et des nombres

## Les dix paires
A–1, O–2, I–3, E–4, U–5, M–6, L–7, P–8, R–9, S–10. Voyelles puis consonnes fréquentes. Les autres lettres restent pour une future suite.

## Correction du retour sur A et 1
La version initiale ne réinitialisait pas systématiquement la sauvegarde. Elle demandait au minimum huit tentatives **par symbole**, mais ne garantissait qu'une question de chaque par séance. Le message « Tu as tout fini » désignait seulement la séance, pas l'étape : il donnait donc une fausse impression de parcours terminé. De plus, la transition n'était exécutée qu'après une animation asynchrone de fin de combat ; quitter à ce moment laissait l'étape maîtrisée sans la faire avancer au prochain lancement.

Désormais une séance comprend trois défis sur la lettre, trois sur le nombre, et deux jeux de variété. Il faut au moins trois tentatives par élément et 80 % de bonnes réponses du premier coup sur les cinq dernières. Une première séance sans erreur suffit. Les erreurs restent bienveillantes et conduisent à une consolidation, pas à un passage forcé. L'état du niveau suivant est enregistré immédiatement après la dernière réponse validante, **avant** toute animation. Au chargement, une étape déjà maîtrisée est également réconciliée. Un rechargement au milieu de la fête ne ramène plus à A–1. Les anciennes séances sont invalidées par `recognitionVersion: 2`, sans supprimer les cartes ni les points.

## Une leçon courte, sans tracé
1. Présentation vocale par le compagnon ; trois mots illustrés pour la lettre, objets apparaissant un par un avec comptage pour le nombre.
2. Grande et petite lettre, ou représentation du nombre sur les doigts.
3. Mini-quiz de reconnaissance.

Le tracé a été supprimé des leçons et du menu des exercices. Le chemin et les leçons restent accessibles ; le parent peut revoir, passer, choisir une étape ou recommencer uniquement le chemin.

## Des défis variés
- Trouver la lettre parmi des formes, puis des lettres présentées ; variations de couleur, taille, police et casse déjà montrée.
- Éclater toutes les bulles de la lettre (un ou deux éléments à trouver).
- Répondre oui/non avec les pouces.
- Chercher la lettre dans de petits jardins illustrés.
- Écouter et reconnaître parmi les symboles appris, à partir de l'étape 2.
- Choisir le groupe ayant la quantité demandée : pour 1, un objet face à plusieurs, sans afficher de chiffre inconnu.
- Associer le nombre écrit à une quantité.
- Dire si une image présente la bonne quantité.
- Attraper toutes les étoiles portant le nombre cible.

Deux à quatre grands choix, positions aléatoires, pas de même format consécutif. Les jeux de formes, couleurs, positions, taille, suites, syllabes et rimes demeurent ; leur difficulté visuelle est plafonnée par l'étape. Les exercices requérant des symboles inconnus ne sont plus générés.

## Cartes et sauvegardes
Quatre éditions pour chaque créature : commune, rare plein cadre, ultra rare holographique, or pailleté. Les décors originaux sont dans `jeu/img/bg/`, en WebP 600×800 qualité 78. Attaques et dégâts sont uniquement décoratifs.

Hors remplacement doré, chaque carte a 78 % de chances d'être commune, 19,5 % rare, 2,5 % ultra rare. L'or conserve la logique antérieure : 12 % par paquet, garantie au septième après six paquets sans or, soit environ 20,3 % des paquets à long terme. L'or remplace l'un des trois emplacements ; les pourcentages des éditions ordinaires ne s'appliquent donc qu'aux emplacements non dorés.

`S.cards` reste l'inventaire agrégé compatible avec l'ancien jeu. `S.cardEditions` stocke les éditions possédées. À la migration, les anciennes cartes deviennent communes sauf les anciennes légendaires (`rar: o`), conservées comme ultra rares. `S.gold` et la garantie dorée ne changent pas. Le code de transfert contient aussi les éditions. La collection montre les quatre catégories ; l'agrandissement réagit au doigt et à l'inclinaison lorsque disponible, sinon un balayage automatique anime la brillance. Sur les appareils demandant une autorisation de capteur, un bouton permet de la demander volontairement. Les paillettes sont limitées à 24 dans une carte animée, six immobiles en miniature ; la collection ne fait pas tourner les animations de foil, et le système de confettis est plafonné à 160 particules.

## Vérification
Serveur de `jeu/` au port 8765 ; Chrome `/usr/bin/google-chrome` ; Playwright installé sous `/workspace/pokes-test`.

`node tests/reconnaissance-cartes.cjs` (ou `node tests/parcours.cjs`) : deux tailles 390×844 et 360×640 ; vraie séance réussie sans préremplissage de maîtrise, rechargement immédiat avant l'animation et leçon O–2 ; formats jouables aux étapes 1 et 3 ; quatre cartes et révélations ; migration d'une ancienne sauvegarde ; code de transfert ; garantie d'or ; distribution des raretés. La synthèse vocale est simulée dans ces tests accélérés : pas de vérification auditive. `node tests/parcours-guides.cjs` empêche le retour du tracé.

Les scripts et feuilles de style portent `?v=8` : une ancienne PWA au cache-first ne peut pas charger le vieux parcours pendant la mise à jour. `node tests/pwa-upgrade.cjs` teste un cache v5 volontairement périmé, le passage au cache v8, ses huit paysages et le rechargement hors ligne.
