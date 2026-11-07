# Premiers pas : lettres et nombres

Ce premier parcours comporte **10 paires** : **A–1, O–2, I–3, E–4, U–5, M–6, L–7, P–8, R–9, S–10**. Les voyelles sont présentées d'abord, suivies de consonnes fréquentes, avec des mots français illustrés. Il s'agit d'une familiarisation, pas d'un programme de lecture complet. T, N et les autres lettres ne sont pas encore introduites : elles nécessiteront une suite au parcours plutôt qu'une réintroduction de nouveaux nombres au-delà de 10.

## Une leçon avant de jouer
Chaque paire commence par la lettre, puis le nombre :
1. Le compagnon présente le grand symbole et l'explique à voix haute (fr-FR). La lettre est accompagnée de trois images touchables ; les objets du nombre apparaissent un par un, avec comptage parlé.
2. Grande et petite lettre ; ou représentation sur les doigts des deux mains.
3. Tracé au doigt sur un guide en plusieurs traits. Il suffit de couvrir 60 % du chemin, avec une marge de 24 unités sur un carré de 200 unités. Lever le doigt est autorisé et « Recommencer » efface le tracé.
4. Mini-quiz bienveillant, sans pénalité : il faut trouver la bonne réponse avant de continuer.

Les leçons peuvent être revues depuis le chemin (y compris les anciennes étapes). Le parent peut les passer, choisir une étape ou recommencer uniquement le chemin.

## Entraînement et maîtrise
Chaque séance conserve combats amicaux, XP, évolutions, paquet et cartes dorées. Elle contient au minimum une reconnaissance de lettre et de nombre (même si le parent désactive ces cases), plus les exercices de variété activés. Les exercices symboliques tirent leurs réponses et distracteurs uniquement parmi les éléments présentés. Le tout premier symbole a une forme comme distracteur. Les exercices visuels/oraux restent disponibles, y compris de petites quantités sans écriture chiffrée. La variante « identique » reste imagée ; « ranger » n'utilise que des nombres déjà introduits ou des tailles.

70 % des questions symboliques visent l'élément courant, 30 % révisent. Seules les tentatives sur l'élément courant comptent pour sa maîtrise. Après **au moins huit tentatives pour chacun**, il faut **80 % de bonnes réponses du premier coup dans la fenêtre des dix dernières tentatives**. Les erreurs suivies d'une correction ne sont pas comptées comme réussies du premier coup. À la fin de la séance : fête, badge de la paire, puis nouvelle leçon sur action de l'enfant. À la paire 10, le chemin est terminé et les révisions restent disponibles.

## Sauvegarde et tests
La propriété `path` est ajoutée sans modifier cartes, or, compagnon, XP, paquets ni clé de sauvegarde. Une ancienne sauvegarde démarre en A–1 et ne reprend pas une ancienne séance non filtrée. Le code de transfert embarque aussi ce parcours. Un saut parental considère les étapes précédentes comme acquises.

Tests : `npm install --prefix /workspace/pokes-test playwright`, puis `node tests/parcours.cjs` avec Chrome à `/usr/bin/google-chrome` et un serveur de `jeu/` au port 8765. Les tests automatisés simulent les événements de synthèse vocale (pas de validation auditive), tracent réellement au pointeur, valident les deux leçons, les filtres à toutes les étapes, une ancienne sauvegarde, le transfert, les réglages parentaux et l'avancement. Captures dans `shots/lecon-*.png` et `shots/parcours-*.png`.
