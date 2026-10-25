/* ==========================================================================
   Cabinet Dr. Bouchaib HAMYA — scripts du site (partagés entre les pages FR et AR)
   Chargé avec « defer » : la page est entièrement analysée quand ce fichier s'exécute.
   ========================================================================== */
(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       Textes affichés par les scripts, selon la langue de la page (<html lang>).
       Pour la page arabe, ajouter une entrée « ar » avec les mêmes clés.
       ---------------------------------------------------------------------- */
    const TEXTS = {
        fr: {
            doctor: 'Dr. Bouchaib HAMYA',
            office: 'Cabinet médical',
            landmark: 'Inzegane (face Marjane)',
            call: 'Appeler',
            directions: 'Itinéraire',
            youAreHere: 'Vous êtes ici',
            distance: 'Distance au cabinet :',
            geoUnsupported: "La géolocalisation n'est pas supportée par votre navigateur.",
            geoError: 'Impossible de déterminer votre position.',
            mapUnavailable: 'Carte non disponible',
            openGoogleMaps: 'Ouvrir Google Maps',
            km: 'km'
        },
        ar: {
            doctor: "الدكتور بوشعيب حامية",
            office: "عيادة طبية",
            landmark: "إنزكان (قبالة مرجان)",
            call: "اتصل",
            directions: "التوجه للعيادة",
            youAreHere: "أنتم هنا",
            distance: "المسافة إلى العيادة:",
            km: "كلم",
            geoUnsupported: "متصفحكم لا يدعم خدمة تحديد الموقع.",
            geoError: "تعذّر تحديد موقعكم.",
            mapUnavailable: "الخريطة غير متاحة",
            openGoogleMaps: "فتح Google Maps"
        }
    };
    const LANG = (document.documentElement.lang || 'fr').slice(0, 2);
    const T = TEXTS[LANG] || TEXTS.fr;
    const RTL = document.documentElement.dir === 'rtl';

    /* ----------------------------------------------------------------------
       Cabinet : téléphone et coordonnées (valeurs reprises telles quelles).
       ---------------------------------------------------------------------- */
    const PHONE = '+212528872513';
    const MAP_CENTER = [30.3595828, -9.5258805];                           // marqueur et centre de la carte
    const DIRECTIONS_TARGET = { lat: 30.359826373778983, lng: -9.526295729030254 }; // destination de l'itinéraire

    /* ======================================================================
       0. Années d'expérience calculées automatiquement
          <span data-years-since="1987">39</span> : le chiffre écrit dans le HTML sert
          sans JavaScript et pour les moteurs de recherche ; il est recalculé ici chaque année.
       ====================================================================== */
    function initYears() {
        const year = new Date().getFullYear();
        document.querySelectorAll('[data-years-since]').forEach((el) => {
            const start = parseInt(el.dataset.yearsSince, 10);
            if (start && year > start) el.textContent = String(year - start);
        });
    }

    /* ======================================================================
       1. Menu mobile et défilement vers les sections
       ====================================================================== */
    function initNavigation() {
        const button = document.getElementById('mobile-menu-button');
        const menu = document.getElementById('mobile-menu');
        const header = document.querySelector('header');

        function closeMenu() {
            if (menu) menu.classList.add('hidden');
            if (button) button.setAttribute('aria-expanded', 'false');
        }

        if (button && menu) {
            button.addEventListener('click', () => {
                const isOpen = !menu.classList.toggle('hidden');
                button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const hash = link.getAttribute('href');
                const target = hash.length > 1 ? document.querySelector(hash) : null;
                if (!target) return;
                event.preventDefault();
                closeMenu();
                const offset = header ? header.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
                // Le focus suit le défilement (lecteurs d'écran, navigation au clavier)
                if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    /* ======================================================================
       2. FAQ : une seule réponse ouverte à la fois
       ====================================================================== */
    function initFaq() {
        const buttons = Array.from(document.querySelectorAll('.faq-question'));

        function setOpen(button, open) {
            const answer = button.closest('.faq-item').querySelector('.faq-answer');
            const icon = button.querySelector('.fa-chevron-down');
            answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0px';
            if (icon) icon.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const willOpen = button.getAttribute('aria-expanded') !== 'true';
                buttons.forEach((other) => {
                    if (other !== button && other.getAttribute('aria-expanded') === 'true') setOpen(other, false);
                });
                setOpen(button, willOpen);
            });
        });
    }

    /* ======================================================================
       3. Galerie photos : agrandissement, navigation, clavier
          Les photos (image, texte alternatif, légende) sont lues dans le HTML.
       ====================================================================== */
    function initGallery() {
        const modal = document.getElementById('photo-modal');
        const items = Array.from(document.querySelectorAll('.photo-item'));
        if (!modal || items.length === 0) return;

        const modalImage = document.getElementById('modal-image');
        const modalCaption = document.getElementById('modal-caption');
        const closeButton = document.getElementById('close-photo-modal');
        const prevButton = document.getElementById('prev-photo');
        const nextButton = document.getElementById('next-photo');

        const photos = items.map((item) => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.photo-caption');
            return {
                src: img.getAttribute('src'),
                srcset: img.getAttribute('srcset'),
                full: img.dataset.full || null,
                alt: img.getAttribute('alt') || '',
                title: caption ? caption.textContent.trim() : (img.getAttribute('alt') || '')
            };
        });

        let current = 0;
        let lastFocused = null;

        function isOpen() {
            return modal.classList.contains('photo-modal-visible');
        }

        function render() {
            const photo = photos[current];
            const srcset = photo.full ? (photo.srcset ? photo.srcset + ', ' : '') + photo.full + ' 1200w' : photo.srcset;
            if (srcset) {
                modalImage.srcset = srcset;
                modalImage.sizes = '(max-width: 768px) 100vw, 80vw';
            } else {
                modalImage.removeAttribute('srcset');
                modalImage.removeAttribute('sizes');
            }
            modalImage.src = photo.full || photo.src;
            modalImage.alt = photo.alt;
            modalCaption.textContent = photo.title;
        }

        function open(index) {
            current = index;
            render();
            lastFocused = document.activeElement;
            modal.classList.remove('photo-modal-hidden');
            modal.classList.add('photo-modal-visible');
            document.body.style.overflow = 'hidden';
            if (closeButton) setTimeout(() => closeButton.focus(), 100);
        }

        function close() {
            modal.classList.remove('photo-modal-visible');
            modal.classList.add('photo-modal-hidden');
            document.body.style.overflow = '';
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        }

        function step(delta) {
            current = (current + delta + photos.length) % photos.length;
            render();
        }

        items.forEach((item, index) => {
            item.addEventListener('click', () => open(index));  // boutons : Entrée et Espace natifs
        });

        if (closeButton) closeButton.addEventListener('click', close);
        if (prevButton) prevButton.addEventListener('click', () => step(-1));
        if (nextButton) nextButton.addEventListener('click', () => step(1));
        modal.addEventListener('click', (event) => {
            if (event.target === modal) close();
        });

        document.addEventListener('keydown', (event) => {
            if (!isOpen()) return;
            if (event.key === 'Tab') {
                // Le focus reste dans la photo agrandie tant qu'elle est ouverte
                const focusables = [closeButton, prevButton, nextButton].filter(Boolean);
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (!focusables.includes(document.activeElement)) {
                    event.preventDefault();
                    first.focus();
                } else if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
                return;
            }
            if (event.key === 'Escape') close();
            else if (event.key === 'ArrowLeft') step(RTL ? 1 : -1);   // en arabe, la flèche gauche avance
            else if (event.key === 'ArrowRight') step(RTL ? -1 : 1);
        });
    }

    /* ======================================================================
       4. Carte Leaflet (OpenStreetMap), chargée seulement quand elle est visible
       ====================================================================== */
    function openDirections() {
        const url = 'https://www.google.com/maps/dir/?api=1&destination=' +
            DIRECTIONS_TARGET.lat + ',' + DIRECTIONS_TARGET.lng + '&travelmode=driving';
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function distanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
    }

    // Leaflet (≈ 150 Ko) n'est téléchargé que lorsque la carte approche de l'écran
    const LEAFLET_JS = {
        src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    };

    function loadLeaflet() {
        return new Promise((resolve, reject) => {
            if (typeof window.L !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = LEAFLET_JS.src;
            script.integrity = LEAFLET_JS.integrity;
            script.crossOrigin = 'anonymous';
            script.onload = () => (typeof window.L !== 'undefined' ? resolve() : reject(new Error('Leaflet indisponible')));
            script.onerror = () => reject(new Error('Leaflet indisponible'));
            document.head.appendChild(script);
        });
    }

    function initMap() {
        const container = document.getElementById('leaflet-map-container');
        const placeholder = document.getElementById('map-placeholder');
        let map = null;
        let userMarker = null;

        function showFallback() {
            if (!placeholder) return;
            placeholder.innerHTML =
                '<div class="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">' +
                '<i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>' +
                '<p class="text-gray-700 mb-2">' + T.mapUnavailable + '</p>' +
                '<a href="https://maps.google.com/?q=30.359826,-9.526296" target="_blank" rel="noopener noreferrer"' +
                ' class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">' +
                '<i class="fab fa-google mr-2"></i>' + T.openGoogleMaps + '</a></div>';
        }

        function createMap() {
            if (map) return;

            if (placeholder) {
                placeholder.style.opacity = '0';
                setTimeout(() => { placeholder.style.display = 'none'; }, 500);
            }

            map = L.map('leaflet-map').setView(MAP_CENTER, 17);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                className: 'leaflet-tile'
            }).addTo(map);

            const pinIcon = L.divIcon({
                html: '<div class="map-pin"><div class="map-pin-shape"></div>' +
                    '<div class="map-pin-center"><i class="fas fa-plus"></i></div></div>',
                iconSize: [1, 1],
                iconAnchor: [0.5, 1],
                className: 'leaflet-marker-custom-fixed'
            });

            const popup =
                '<div class="map-popup" dir="' + (RTL ? 'rtl' : 'ltr') + '">' +
                '<h3>' + T.doctor + '</h3>' +
                '<p class="map-popup-office"><i class="fas fa-map-marker-alt"></i>' + T.office + '</p>' +
                '<p class="map-popup-landmark">' + T.landmark + '</p>' +
                '<div class="map-popup-actions">' +
                '<a href="tel:' + PHONE + '" class="map-popup-call"><i class="fas fa-phone"></i>' + T.call + '</a>' +
                '<button type="button" class="map-popup-directions" data-action="directions">' +
                '<i class="fas fa-directions"></i>' + T.directions + '</button>' +
                '</div></div>';

            L.marker(MAP_CENTER, { icon: pinIcon, title: T.doctor }).addTo(map).bindPopup(popup).openPopup();

            L.circle(MAP_CENTER, {
                color: '#1e40af',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                radius: 50
            }).addTo(map);

            setTimeout(() => map.invalidateSize(), 100);
        }

        function locateUser() {
            if (!map) return;
            if (!navigator.geolocation) {
                alert(T.geoUnsupported);
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: '<div class="map-user-dot"></div>',
                        iconSize: [20, 20],
                        className: 'leaflet-user-marker'
                    }),
                    title: T.youAreHere
                }).addTo(map);

                map.setView([lat, lng], 15);

                const line = L.polyline([[lat, lng], [DIRECTIONS_TARGET.lat, DIRECTIONS_TARGET.lng]], {
                    color: '#3b82f6',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '10, 10'
                }).addTo(map);
                setTimeout(() => map.removeLayer(line), 10000);

                const km = distanceKm(lat, lng, DIRECTIONS_TARGET.lat, DIRECTIONS_TARGET.lng);
                userMarker.bindPopup('<div class="map-popup map-popup-small" dir="' + (RTL ? 'rtl' : 'ltr') + '"><strong>' + T.youAreHere +
                    '</strong><br>' + T.distance + ' ' + km + ' ' + T.km + '</div>').openPopup();
            }, () => {
                alert(T.geoError);
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }

        // Boutons « Itinéraire », zoom et localisation (attribut data-action)
        document.addEventListener('click', (event) => {
            const control = event.target.closest('[data-action]');
            if (!control) return;
            switch (control.dataset.action) {
                case 'directions': openDirections(); break;
                case 'zoom-in': if (map) map.zoomIn(); break;
                case 'zoom-out': if (map) map.zoomOut(); break;
                case 'locate': locateUser(); break;
            }
        });

        function start() {
            loadLeaflet().then(createMap).catch(showFallback);
        }

        if (!container) return;
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    observer.disconnect();
                    start();
                }
            }, { rootMargin: '200px 0px', threshold: 0 });
            observer.observe(container);
        } else {
            start();
        }
    }

    /* ====================================================================== */
    initYears();
    initNavigation();
    initFaq();
    initGallery();
    initMap();
})();
