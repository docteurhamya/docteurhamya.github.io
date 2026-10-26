// Configuration Tailwind CSS 2.2.19 du site du Dr. Bouchaib HAMYA.
// Elle produit assets/css/tailwind.css, qui ne contient que les classes réellement utilisées
// dans les pages (au lieu des 2,9 Mo du fichier complet servi par le CDN).
//
// À relancer après tout ajout ou changement de classe Tailwind dans les pages
// (Node.js requis, commande à lancer depuis la racine du dépôt) :
//   npx tailwindcss@2.2.19 -c tailwind.config.js -i assets/css/tailwind.src.css -o assets/css/tailwind.css --minify

module.exports = {
    purge: {
        enabled: true,
        content: ['./index.html', './ar/index.html', './404.html', './assets/js/site.js'],
    },
    darkMode: false,
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
