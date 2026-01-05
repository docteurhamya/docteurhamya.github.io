// assets/js/gallery-optimized.js
class PhotoGallery {
    constructor() {
        this.modal = document.getElementById('photo-modal');
        this.modalImage = document.getElementById('modal-image');
        this.modalCaption = document.getElementById('modal-caption');
        
        // Données des photos AVEC srcset pour le modal
        this.images = [
            {
                src: 'assets/images/cabinet-accueil.webp',
                srcset: 'assets/images/cabinet-accueil-400.webp 400w, assets/images/cabinet-accueil-800.webp 800w, assets/images/cabinet-accueil-1200.webp 1200w',
                alt: 'Salle d\'attente moderne du cabinet médical Dr. HAMYA à Inzegane, avec sièges confortables et décoration apaisante',
                title: 'Accueil - Salle d\'attente'
            },
            {
                src: 'assets/images/cabinet-bureau.webp',
                srcset: 'assets/images/cabinet-bureau-400.webp 400w, assets/images/cabinet-bureau-800.webp 800w',
                alt: 'Bureau professionnel du Dr. HAMYA avec équipement informatique, documentation médicale et espace d\'accueil patient',
                title: 'Bureau de consultation'
            },
            {
                src: 'assets/images/cabinet-echographie.webp',
                srcset: 'assets/images/cabinet-echographie-400.webp 400w, assets/images/cabinet-echographie-800.webp 800w',
                alt: 'Salle d\'échographie équipée d\'un appareil à ultrasons moderne pour diagnostics précis au cabinet du Dr. HAMYA',
                title: 'Salle d\'échographie'
            },
            {
                src: 'assets/images/cabinet-equipement.webp',
                srcset: 'assets/images/cabinet-equipement-400.webp 400w, assets/images/cabinet-equipement-800.webp 800w',
                alt: 'Équipement médical moderne et instruments stériles disponibles au cabinet du Dr. HAMYA à Inzegane',
                title: 'Équipement médical'
            },
            {
                src: 'assets/images/cabinet-premiers-soins.webp',
                srcset: 'assets/images/cabinet-premiers-soins-400.webp 400w, assets/images/cabinet-premiers-soins-800.webp 800w',
                alt: 'Zone de premiers soins équipée avec matériel stérile pour interventions médicales urgentes au cabinet Dr. HAMYA',
                title: 'Premiers Soins'
            },
            {
                src: 'assets/images/cabinet-salle-attente.webp',
                srcset: 'assets/images/cabinet-salle-attente-400.webp 400w, assets/images/cabinet-salle-attente-800.webp 800w',
                alt: 'Salle d\'attente spacieuse et lumineuse du cabinet médical Dr. HAMYA à Inzegane, avec vue sur Marjane',
                title: 'Salle d\'attente principale'
            }
        ];
        
        this.currentIndex = 0;
        this.init();
    }

    init() {
        // Ajouter les événements de clic
        this.addClickEvents();
        
        // Navigation clavier
        this.addKeyboardEvents();
        
        // Événements du modal
        this.addModalEvents();
    }

    addClickEvents() {
        document.querySelectorAll('.photo-item').forEach((item, index) => {
            // Clic souris
            item.addEventListener('click', () => this.open(index));
            
            // Touche Entrée/Espace (accessibilité)
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.open(index);
                }
            });
        });
    }

    addKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    addModalEvents() {
        // Fermer le modal
        document.getElementById('close-photo-modal')?.addEventListener('click', () => this.hide());
        
        // Navigation
        document.getElementById('prev-photo')?.addEventListener('click', () => this.prev());
        document.getElementById('next-photo')?.addEventListener('click', () => this.next());
        
        // Fermer en cliquant à l'extérieur
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }

    open(index) {
        this.currentIndex = index;
        this.updateModal();
        this.show();
    }

    updateModal() {
        const image = this.images[this.currentIndex];
        
        // Mettre à jour l'image
        this.modalImage.src = image.src;
        this.modalImage.alt = image.alt;
        
        // Utiliser srcset si disponible
        if (image.srcset) {
            this.modalImage.srcset = image.srcset;
            this.modalImage.sizes = '(max-width: 768px) 100vw, 80vw';
        } else {
            this.modalImage.removeAttribute('srcset');
            this.modalImage.removeAttribute('sizes');
        }
        
        // Mettre à jour la légende
        this.modalCaption.textContent = image.title;
    }

    show() {
        this.modal.classList.remove('photo-modal-hidden');
        this.modal.classList.add('photo-modal-visible');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus sur le bouton fermer pour l'accessibilité
        setTimeout(() => {
            document.getElementById('close-photo-modal')?.focus();
        }, 100);
    }

    hide() {
        this.modal.classList.remove('photo-modal-visible');
        this.modal.classList.add('photo-modal-hidden');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateModal();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateModal();
    }

    handleKeydown(e) {
        // Ne traiter que si le modal est ouvert
        if (!this.modal.classList.contains('photo-modal-visible')) return;
        
        switch(e.key) {
            case 'Escape':
                this.hide();
                break;
            case 'ArrowLeft':
                this.prev();
                break;
            case 'ArrowRight':
                this.next();
                break;
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si la galerie existe sur la page
    if (document.querySelector('.photo-item')) {
        window.photoGallery = new PhotoGallery();
        console.log('✅ Galerie photos initialisée');
    }
});