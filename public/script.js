// Theme Management
let isDarkMode = false;
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.getElementById('themeIcon').textContent = isDarkMode ? '☀️' : '🌙';
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Menu Management
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Screen Navigation
let currentUser = null;
let userType = 'tenant';
let properties = JSON.parse(localStorage.getItem('properties')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let visits = JSON.parse(localStorage.getItem('visits')) || [];
let currentPropertyImages = [];
let currentWhatsAppProperty = null;
let currentChat = {propertyId: null, otherUserId: null};
let currentAvatar = null;
let currentViewUserId = null;
let modalPropertyOwnerId = null;
let currentReviewStars = 0;
let modalPropertyId = null;

function showScreen(screenId, params = {}) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Show selected screen
    document.getElementById(screenId).classList.add('active');
    // Close mobile menu
    document.getElementById('navMenu').classList.remove('active');
    document.getElementById('hamburger').classList.remove('active');
    // Load data if needed
    if (screenId === 'ownerDashboard') {
        loadOwnerProperties();
    } else if (screenId === 'tenantDashboard') {
        loadTenantProperties();
    } else if (screenId === 'search') {
        loadSearchResults();
    } else if (screenId === 'messages') {
        loadConversations();
        loadVisitRequests();
    } else if (screenId === 'profile') {
        loadProfileData();
    } else if (screenId === 'userProfile') {
        currentViewUserId = params.userId;
        loadUserProfileData(params.userId);
    }
}

// User Type Selection
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    const userTypeOptions = document.querySelectorAll('.user-type-option');
    userTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            userTypeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            userType = this.getAttribute('data-type');
        });
    });

    // Profile tabs
    const profileTabs = document.querySelectorAll('.profile-tab');
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            profileTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.profile-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId + 'Tab').classList.add('active');
            if (tabId === 'publications') {
                loadProfilePublications();
            } else if (tabId === 'favorites') {
                loadProfileFavorites();
            } else if (tabId === 'visits') {
                loadProfileVisits();
            }
        });
    });

    // Messages tabs
    const messagesTabs = document.querySelectorAll('#messagesTabs .profile-tab');
    messagesTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            messagesTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('#messages .profile-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });

    // Initialize properties and users if empty
    if (properties.length === 0) {
        properties = [
            {
                id: 1,
                ownerId: 'sample-owner',
                title: 'Appartement moderne - Centre-ville',
                price: 45000,
                type: 'appartement',
                status: 'available',
                surface: 65,
                rooms: 3,
                bedrooms: 2,
                bathrooms: 1,
                address: '15 Rue Didouche Mourad',
                city: 'Alger',
                whatsapp: '+213123456789',
                description: 'Bel appartement lumineux en plein centre-ville, proche de tous commerces et transports. Cuisine équipée, parquet ancien, hauts plafonds.',
                images: [],
                reviews: [],
                amenities: ['wifi', 'parking'],
                views: 0,
                dateAdded: Date.now()
            },
            {
                id: 2,
                ownerId: 'sample-owner',
                title: 'Studio lumineux - Quartier étudiant',
                price: 25000,
                type: 'studio',
                status: 'available',
                surface: 32,
                rooms: 1,
                bedrooms: 1,
                bathrooms: 1,
                address: '22 Rue des Frères Bouadou',
                city: 'Oran',
                whatsapp: '+213987654321',
                description: 'Studio fonctionnel idéal pour étudiant, proche du campus universitaire. Mezzanine, kitchenette équipée, calme.',
                images: [],
                reviews: [],
                amenities: ['climatisation'],
                views: 0,
                dateAdded: Date.now()
            }
        ];
        localStorage.setItem('properties', JSON.stringify(properties));
    }
    if (users.length === 0) {
        users.push({
            id: 'sample-owner',
            name: 'Ahmed Bensalem',
            email: 'ahmed.bensalem@example.com',
            phone: '+213123456789',
            type: 'owner',
            avatar: null,
            bio: 'Propriétaire de plusieurs appartements à Alger et Oran.',
            preferences: {
                emailNotifications: true,
                smsNotifications: false,
                whatsappNotifications: true,
                language: 'fr'
            },
            favorites: [],
            savedSearches: []
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Setup contact form submission
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            showLoading();
            setTimeout(() => {
                alert('Votre message a été envoyé! Nous vous répondrons dans les plus brefs délais.');
                this.reset();
                hideLoading();
            }, 1000);
        }
    });

    // Setup profile form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            showLoading();
            setTimeout(() => {
                updateProfile();
                hideLoading();
            }, 1000);
        }
    });

    // Setup security form submission
    document.getElementById('securityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            showLoading();
            setTimeout(() => {
                updatePassword();
                hideLoading();
            }, 1000);
        }
    });

    // Setup preferences form submission
    document.getElementById('preferencesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        setTimeout(() => {
            updatePreferences();
            hideLoading();
        }, 1000);
    });

    // Setup visit form
    document.getElementById('visitForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitVisit();
    });

    // Chat input event listener
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Review stars selection
    document.querySelectorAll('#reviewStars i').forEach(star => {
        star.addEventListener('click', function() {
            currentReviewStars = parseInt(this.dataset.value);
            document.querySelectorAll('#reviewStars i').forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= currentReviewStars);
            });
        });
    });

    // Review form submission
    document.getElementById('reviewForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview();
    });
});

// Form Validation
function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
        const errorId = field.id + 'Error';
        const errorElem = document.getElementById(errorId);
        if (errorElem) errorElem.classList.remove('active');
        if (!field.value.trim()) {
            if (errorElem) {
                errorElem.textContent = 'Ce champ est obligatoire';
                errorElem.classList.add('active');
            }
            isValid = false;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            if (errorElem) {
                errorElem.textContent = 'Email invalide';
                errorElem.classList.add('active');
            }
            isValid = false;
        } else if (field.type === 'password' && field.value.length < 6) {
            if (errorElem) {
                errorElem.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
                errorElem.classList.add('active');
            }
            isValid = false;
        }
    });
    return isValid;
}

// Loading Management
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Registration Handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm(this)) return;
    showLoading();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Additional validation
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Les mots de passe ne correspondent pas';
        document.getElementById('confirmPasswordError').classList.add('active');
        hideLoading();
        return;
    }

    // Check if email exists
    if (users.find(u => u.email === email)) {
        document.getElementById('emailError').textContent = 'Cet email est déjà utilisé';
        document.getElementById('emailError').classList.add('active');
        hideLoading();
        return;
    }

    // Create user
    const userId = 'user-' + Date.now();
    currentUser = {
        id: userId,
        name: fullName,
        email: email,
        phone: phone,
        type: userType,
        password: password,
        avatar: null,
        bio: '',
        preferences: {
            emailNotifications: true,
            smsNotifications: false,
            whatsappNotifications: true,
            language: 'fr'
        },
        favorites: [],
        savedSearches: []
    };
    users.push(currentUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Success
    setTimeout(() => {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = 'Inscription réussie ! Redirection...';
        this.parentNode.insertBefore(successDiv, this);

        updateNavForLoggedUser();
        if (userType === 'tenant') {
            document.getElementById('tenantName').textContent = fullName;
            showScreen('tenantDashboard');
        } else {
            document.getElementById('ownerName').textContent = fullName;
            showScreen('ownerDashboard');
        }
        hideLoading();
    }, 1000);
});

// Login Handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateForm(this)) return;
    showLoading();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Connexion à Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    hideLoading();

    if (error) {
        alert("❌ Erreur de connexion : " + error.message);
        console.error(error);
    } else {
        // Sauvegarde du token (session) dans localStorage
        localStorage.setItem("supabase.auth.token", JSON.stringify(data.session));

        alert("✅ Connexion réussie !");
        // Redirection après connexion
        window.location.href = "/index.html"; 
    }
});

    // Appel API vers le backend
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            // Stocker le token JWT pour les futures requêtes
            localStorage.setItem('token', data.token);
            currentUser = data.user; // Contient id, name, email, type

            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = 'Connexion réussie ! Redirection...';
            this.parentNode.insertBefore(successDiv, this);

            updateNavForLoggedUser();
            if (currentUser.type === 'tenant') {
                document.getElementById('tenantName').textContent = currentUser.name;
                showScreen('tenantDashboard');
            } else {
                document.getElementById('ownerName').textContent = currentUser.name;
                showScreen('ownerDashboard');
            }
            hideLoading();
        } else {
            document.getElementById('loginPasswordError').textContent = data.msg || 'Email ou mot de passe incorrect';
            document.getElementById('loginPasswordError').classList.add('active');
            hideLoading();
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('loginPasswordError').textContent = 'Erreur serveur';
        document.getElementById('loginPasswordError').classList.add('active');
        hideLoading();
    });
});

// Update Navigation for Logged Users
function updateNavForLoggedUser() {
    const authNavItems = document.getElementById('authNavItems');
    if (currentUser) {
        authNavItems.innerHTML = `
            <a href="#" onclick="showDashboard()">Tableau de bord</a>
            <a href="#" onclick="showScreen('messages')">Messages</a>
            <a href="#" onclick="showScreen('profile')">Profil</a>
            <a href="#" onclick="logout()">Déconnexion</a>
        `;
    } else {
        authNavItems.innerHTML = `
            <a href="#" onclick="showScreen('login')">Connexion</a>
            <a href="#" onclick="showScreen('register')">Inscription</a>
        `;
    }
}

// Show Dashboard
function showDashboard() {
    if (currentUser) {
        showScreen(currentUser.type + 'Dashboard');
    }
}

// Logout Handler
function logout() {
    showLoading();
    setTimeout(() => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateNavForLoggedUser();
        showScreen('welcome');
        // Clear forms
        document.getElementById('registerForm').reset();
        document.getElementById('loginForm').reset();
        // Reset user type selection
        document.querySelectorAll('.user-type-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector('.user-type-option[data-type="tenant"]').classList.add('active');
        userType = 'tenant';
        hideLoading();
    }, 1000);
}

// Load Profile Data (Own Profile)
function loadProfileData() {
    if (!currentUser) return;

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileType').textContent = currentUser.type === 'tenant' ? 'Locataire' : 'Propriétaire';
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;

    document.getElementById('profileFullName').value = currentUser.name;
    document.getElementById('profilePhoneNumber').value = currentUser.phone;
    document.getElementById('profileEmailAddress').value = currentUser.email;
    document.getElementById('profileBio').value = currentUser.bio || '';

    // Load avatar if exists
    if (currentUser.avatar) {
        document.getElementById('avatarPreview').src = currentUser.avatar;
        document.getElementById('profileAvatar').src = currentUser.avatar;
    }

    // Load preferences
    if (currentUser.preferences) {
        document.getElementById('emailNotifications').checked = currentUser.preferences.emailNotifications;
        document.getElementById('smsNotifications').checked = currentUser.preferences.smsNotifications;
        document.getElementById('whatsappNotifications').checked = currentUser.preferences.whatsappNotifications;
        document.getElementById('language').value = currentUser.preferences.language;
    }

    // Conditionally add tabs based on user type
    const tabsContainer = document.getElementById('profileTabs');
    tabsContainer.innerHTML = `
        <div class="profile-tab active" data-tab="edit">Modifier le profil</div>
        <div class="profile-tab" data-tab="security">Sécurité</div>
        <div class="profile-tab" data-tab="preferences">Préférences</div>
    `;
    if (currentUser.type === 'owner') {
        tabsContainer.innerHTML += `
            <div class="profile-tab" data-tab="publications">Mes publications</div>
        `;
    } else if (currentUser.type === 'tenant') {
        tabsContainer.innerHTML += `
            <div class="profile-tab" data-tab="favorites">Mes favoris</div>
            <div class="profile-tab" data-tab="visits">Mes visites</div>
        `;
    }

    // Re-attach event listeners to new tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.profile-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId + 'Tab').classList.add('active');
            if (tabId === 'publications') {
                loadProfilePublications();
            } else if (tabId === 'favorites') {
                loadProfileFavorites();
            } else if (tabId === 'visits') {
                loadProfileVisits();
            }
        });
    });
}

// Load User Profile Data (Public)
function loadUserProfileData(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('userProfileName').textContent = user.name;
    document.getElementById('userProfileType').textContent = user.type === 'tenant' ? 'Locataire' : 'Propriétaire';
    document.getElementById('userProfileEmail').textContent = user.email;
    document.getElementById('userProfilePhone').textContent = user.phone;
    document.getElementById('userProfileBio').textContent = user.bio || 'Aucune bio disponible.';

    // Load avatar
    document.getElementById('userProfileAvatar').src = user.avatar || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%233b82f6'/><text x='60' y='70' font-family='Arial' font-size='40' fill='white' text-anchor='middle'>${user.name.charAt(0).toUpperCase()}</text></svg>`;

    // Load publications if owner
    const publicationsContainer = document.getElementById('userProfilePublications');
    publicationsContainer.innerHTML = '';
    if (user.type === 'owner') {
        const userProperties = properties.filter(prop => prop.ownerId === userId);
        userProperties.forEach(property => {
            const propertyCard = createPropertyCard(property, false);
            publicationsContainer.appendChild(propertyCard);
        });
    } else {
        publicationsContainer.innerHTML = '<p class="text-center">Ce utilisateur n\'a pas de publications.</p>';
    }
}

// Load Profile Publications (Own)
function loadProfilePublications() {
    if (!currentUser || currentUser.type !== 'owner') return;

    const publicationsContainer = document.getElementById('profilePublications');
    publicationsContainer.innerHTML = '';

    const userProperties = properties.filter(prop => prop.ownerId === currentUser.id);
    userProperties.forEach(property => {
        const propertyCard = createPropertyCard(property, true);
        publicationsContainer.appendChild(propertyCard);
    });
}

// Load Profile Favorites (Tenant)
function loadProfileFavorites() {
    if (!currentUser || currentUser.type !== 'tenant') return;

    const favoritesContainer = document.getElementById('profileFavorites');
    favoritesContainer.innerHTML = '';

    const favoriteProperties = properties.filter(prop => currentUser.favorites.includes(prop.id));
    if (favoriteProperties.length === 0) {
        favoritesContainer.innerHTML = '<p class="text-center">Aucun favori pour le moment.</p>';
        return;
    }

    favoriteProperties.forEach(property => {
        const propertyCard = createPropertyCard(property, false);
        favoritesContainer.appendChild(propertyCard);
    });
}

// Load Profile Visits (Tenant)
function loadProfileVisits() {
    if (!currentUser || currentUser.type !== 'tenant') return;

    const visitsContainer = document.getElementById('profileVisits');
    visitsContainer.innerHTML = '';

    const userVisits = visits.filter(v => v.userId === currentUser.id);
    if (userVisits.length === 0) {
        visitsContainer.innerHTML = '<p class="text-center">Aucune visite programmée.</p>';
        return;
    }

    userVisits.forEach(visit => {
        const property = properties.find(p => p.id === visit.propertyId);
        if (!property) return;

        const visitCard = document.createElement('div');
        visitCard.className = 'visit-card';
        visitCard.innerHTML = `
            <div class="visit-header">
                <h4>${property.title}</h4>
                <span class="visit-status status-${visit.status || 'pending'}">${getStatusText(visit.status)}</span>
            </div>
            <p><strong>Date:</strong> ${new Date(visit.date).toLocaleDateString('fr-FR')} à ${visit.time}</p>
            <p><strong>Adresse:</strong> ${property.address}, ${property.city}</p>
            ${visit.message ? `<p><strong>Message:</strong> ${visit.message}</p>` : ''}
            ${visit.ownerResponse ? `<p><strong>Réponse du propriétaire:</strong> ${visit.ownerResponse}</p>` : ''}
        `;
        visitsContainer.appendChild(visitCard);
    });
}

// Handle Avatar Upload
function handleAvatarUpload(files) {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image valide (JPG, PNG ou GIF).');
        return;
    }

    if (file.size > 1000000) {
        alert('L\'image ne doit pas dépasser 1MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        currentAvatar = e.target.result;
        document.getElementById('avatarPreview').src = currentAvatar;
    };
    reader.readAsDataURL(file);
}

// Update Profile
function updateProfile() {
    if (!currentUser) return;

    const fullName = document.getElementById('profileFullName').value.trim();
    const phone = document.getElementById('profilePhoneNumber').value.trim();
    const email = document.getElementById('profileEmailAddress').value.trim();
    const bio = document.getElementById('profileBio').value.trim();

    // Check if email is already used by another user
    const emailExists = users.find(u => u.email === email && u.id !== currentUser.id);
    if (emailExists) {
        document.getElementById('profileEmailAddressError').textContent = 'Cet email est déjà utilisé';
        document.getElementById('profileEmailAddressError').classList.add('active');
        return;
    }

    // Update user data
    currentUser.name = fullName;
    currentUser.phone = phone;
    currentUser.email = email;
    currentUser.bio = bio;

    if (currentAvatar) {
        currentUser.avatar = currentAvatar;
        document.getElementById('profileAvatar').src = currentAvatar;
    }

    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Update dashboard names
    if (currentUser.type === 'tenant') {
        document.getElementById('tenantName').textContent = fullName;
    } else {
        document.getElementById('ownerName').textContent = fullName;
    }

    alert('Profil mis à jour avec succès!');
    loadProfileData();
}

// Update Password
function updatePassword() {
    if (!currentUser) return;

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (currentPassword !== currentUser.password) {
        document.getElementById('currentPasswordError').textContent = 'Le mot de passe actuel est incorrect';
        document.getElementById('currentPasswordError').classList.add('active');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        document.getElementById('confirmNewPasswordError').textContent = 'Les mots de passe ne correspondent pas';
        document.getElementById('confirmNewPasswordError').classList.add('active');
        return;
    }

    // Update password
    currentUser.password = newPassword;

    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    document.getElementById('securityForm').reset();
    alert('Mot de passe mis à jour avec succès!');
}

// Update Preferences
function updatePreferences() {
    if (!currentUser) return;

    const emailNotifications = document.getElementById('emailNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;
    const whatsappNotifications = document.getElementById('whatsappNotifications').checked;
    const language = document.getElementById('language').value;

    currentUser.preferences = {
        emailNotifications,
        smsNotifications,
        whatsappNotifications,
        language
    };

    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].preferences = currentUser.preferences;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    alert('Préférences mises à jour avec succès!');
}

// Load Owner Properties
function loadOwnerProperties() {
    showLoading();
    setTimeout(() => {
        const ownerPropertiesContainer = document.getElementById('ownerProperties');
        const ownerPropertiesCount = document.getElementById('ownerPropertiesCount');
        const ownerViewsCount = document.getElementById('ownerViewsCount');
        const ownerMessagesCount = document.getElementById('ownerMessagesCount');
        const ownerVisitsCount = document.getElementById('ownerVisitsCount');
        if (!currentUser) {
            hideLoading();
            return;
        }

        const userProperties = properties.filter(prop => prop.ownerId === currentUser.id);
        ownerPropertiesCount.textContent = userProperties.length;

        // Calculate stats
        const totalViews = userProperties.reduce((sum, p) => sum + (p.views || 0), 0);
        ownerViewsCount.textContent = totalViews;

        const ownerConversations = conversations.filter(c => userProperties.some(p => p.id === c.propertyId));
        ownerMessagesCount.textContent = ownerConversations.length;

        const ownerVisitRequests = visits.filter(v => userProperties.some(p => p.id === v.propertyId));
        ownerVisitsCount.textContent = ownerVisitRequests.length;

        ownerPropertiesContainer.innerHTML = '';

        if (userProperties.length === 0) {
            ownerPropertiesContainer.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                    <p>Vous n'avez pas encore de propriétés.</p>
                    <button class="btn btn-primary mt-2" onclick="showAddPropertyForm()">Ajouter votre première propriété</button>
                </div>
            `;
            hideLoading();
            return;
        }

        userProperties.forEach(property => {
            const propertyCard = createPropertyCard(property, true);
            ownerPropertiesContainer.appendChild(propertyCard);
        });
        hideLoading();
    }, 500); // Simulate load
}

// Load Tenant Properties
function loadTenantProperties() {
    showLoading();
    setTimeout(() => {
        const tenantPropertiesContainer = document.getElementById('tenantProperties');
        const tenantFavoritesCount = document.getElementById('tenantFavoritesCount');
        const tenantVisitsCount = document.getElementById('tenantVisitsCount');
        const tenantMessagesCount = document.getElementById('tenantMessagesCount');
        tenantPropertiesContainer.innerHTML = '';

        // Show available properties
        const availableProperties = properties.filter(prop => prop.status === 'available');
        if (availableProperties.length === 0) {
            tenantPropertiesContainer.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                    <p>Aucune propriété disponible pour le moment.</p>
                </div>
            `;
            hideLoading();
            return;
        }

        availableProperties.forEach(property => {
            const propertyCard = createPropertyCard(property, false);
            tenantPropertiesContainer.appendChild(propertyCard);
        });

        // Update stats
        tenantFavoritesCount.textContent = currentUser.favorites ? currentUser.favorites.length : 0;

        const userVisits = visits.filter(v => v.userId === currentUser.id);
        tenantVisitsCount.textContent = userVisits.length;

        const userConversations = conversations.filter(c => c.user1Id === currentUser.id || c.user2Id === currentUser.id);
        tenantMessagesCount.textContent = userConversations.length;
        hideLoading();
    }, 500);
}

// Load Search Results
function loadSearchResults() {
    showLoading();
    setTimeout(() => {
        const searchResultsContainer = document.getElementById('searchResults');
        const resultsCount = document.getElementById('resultsCount');
        searchResultsContainer.innerHTML = '';

        // Show available properties
        const availableProperties = properties.filter(prop => prop.status === 'available');
        if (availableProperties.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                    <p>Aucune propriété disponible pour le moment.</p>
                </div>
            `;
            resultsCount.textContent = '0 résultat';
            hideLoading();
            return;
        }

        availableProperties.forEach(property => {
            const propertyCard = createPropertyCard(property, false);
            searchResultsContainer.appendChild(propertyCard);
        });
        
        resultsCount.textContent = `${availableProperties.length} résultat${availableProperties.length > 1 ? 's' : ''}`;
        hideLoading();
    }, 500);
}

// Perform Search with Filters and Sorting
function performSearch() {
    showLoading();
    setTimeout(() => {
        const searchResultsContainer = document.getElementById('searchResults');
        const resultsCount = document.getElementById('resultsCount');
        const city = document.getElementById('searchCity').value.toLowerCase();
        const type = document.getElementById('searchType').value;
        const minPrice = document.getElementById('searchMinPrice').value;
        const maxPrice = document.getElementById('searchMaxPrice').value;
        const minSurface = document.getElementById('searchMinSurface').value;
        const bedrooms = document.getElementById('searchBedrooms').value;
        const amenities = Array.from(document.querySelectorAll('input[name="searchAmenity"]:checked')).map(cb => cb.value);
        const sortBy = document.getElementById('sortBy').value;

        searchResultsContainer.innerHTML = '';

        // Filter properties
        let filteredProperties = properties.filter(property => {
            const hasAmenities = amenities.every(a => property.amenities.includes(a));
            return property.status === 'available' &&
                   (city === '' || property.city.toLowerCase().includes(city)) &&
                   (type === '' || property.type === type) &&
                   (minPrice === '' || property.price >= parseInt(minPrice)) &&
                   (maxPrice === '' || property.price <= parseInt(maxPrice)) &&
                   (minSurface === '' || property.surface >= parseInt(minSurface)) &&
                   (bedrooms === '' ||
                    (bedrooms === '3' ? property.bedrooms >= 3 : property.bedrooms === parseInt(bedrooms))) &&
                   hasAmenities;
        });

        // Sort
        if (sortBy === 'price-asc') {
            filteredProperties.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            filteredProperties.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'date-desc') {
            filteredProperties.sort((a, b) => b.dateAdded - a.dateAdded);
        } else if (sortBy === 'popularity-desc') {
            filteredProperties.sort((a, b) => {
                const avgA = a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + r.stars, 0) / a.reviews.length : 0;
                const avgB = b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + r.stars, 0) / b.reviews.length : 0;
                return avgB - avgA;
            });
        }

        if (filteredProperties.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                    <p>Aucun résultat ne correspond à vos critères de recherche.</p>
                </div>
            `;
            resultsCount.textContent = '0 résultat';
            hideLoading();
            return;
        }

        filteredProperties.forEach(property => {
            const propertyCard = createPropertyCard(property, false);
            searchResultsContainer.appendChild(propertyCard);
        });
        
        resultsCount.textContent = `${filteredProperties.length} résultat${filteredProperties.length > 1 ? 's' : ''}`;
        hideLoading();
    }, 500);
}

// Save Search Criteria
function saveSearchCriteria() {
    if (!currentUser || currentUser.type !== 'tenant') return;

    const criteria = {
        id: Date.now(),
        city: document.getElementById('searchCity').value,
        type: document.getElementById('searchType').value,
        minPrice: document.getElementById('searchMinPrice').value,
        maxPrice: document.getElementById('searchMaxPrice').value,
        minSurface: document.getElementById('searchMinSurface').value,
        bedrooms: document.getElementById('searchBedrooms').value,
        amenities: Array.from(document.querySelectorAll('input[name="searchAmenity"]:checked')).map(cb => cb.value)
    };

    currentUser.savedSearches.push(criteria);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));

    alert('Recherche sauvegardée ! Vous recevrez des alertes pour les nouvelles propriétés correspondantes.');
}

// Create Property Card
function createPropertyCard(property, isOwner = false) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.id = property.id;

    const statusClass = property.status === 'available' ? 'status-available' : 'status-rented';
    const statusText = property.status === 'available' ? 'Disponible' : 'Loué';

    // Generate placeholder if no image
    const imagePlaceholder = property.type === 'maison' ? '🏠' :
                             property.type === 'studio' ? '🔨' : '🏢';

    // Calculate average rating
    const reviews = property.reviews || [];
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1) : 0;
    const starsHtml = '<i class="fas fa-star"></i>'.repeat(Math.floor(avgRating)) + (avgRating % 1 > 0 ? '<i class="fas fa-star-half-alt"></i>' : '') + '<i class="far fa-star"></i>'.repeat(5 - Math.ceil(avgRating));

    const isFavorited = currentUser && currentUser.type === 'tenant' && currentUser.favorites.includes(property.id);

    // Create amenities HTML
    let amenitiesHtml = '';
    if (property.amenities && property.amenities.length > 0) {
        amenitiesHtml = '<div class="property-amenities">';
        property.amenities.forEach(amenity => {
            let icon = '';
            let label = '';
            switch(amenity) {
                case 'wifi': icon = '📶'; label = 'Wi-Fi'; break;
                case 'parking': icon = '🚗'; label = 'Parking'; break;
                case 'piscine': icon = '🏊'; label = 'Piscine'; break;
                case 'gym': icon = '💪'; label = 'Salle de sport'; break;
                case 'climatisation': icon = '❄️'; label = 'Climatisation'; break;
            }
            amenitiesHtml += `<span class="amenity-tag">${icon} ${label}</span>`;
        });
        amenitiesHtml += '</div>';
    }

    card.innerHTML = `
        <div class="property-image">
            ${property.images && property.images.length > 0 ?
                `<img src="${property.images[0]}" alt="${property.title}">` :
                imagePlaceholder}
            <span class="property-status ${statusClass}">${statusText}</span>
        </div>
        <div class="property-content">
            <h4 class="property-title">${property.title}</h4>
            <div class="property-rating">
                <span class="stars">${starsHtml}</span>
                <span>(${reviews.length} avis)</span>
            </div>
            <div class="property-price">${property.price.toLocaleString('fr-DZ')} DZD/mois</div>
            <div class="property-details">
                <span>📐 ${property.surface}m²</span>
                <span>🛏️ ${property.bedrooms} ch</span>
                <span>🚿 ${property.bathrooms} sdb</span>
            </div>
            ${amenitiesHtml}
            <p class="property-description">${property.description.substring(0, 100)}...</p>
            ${!isOwner ? `<p class="property-whatsapp"><i class="fab fa-whatsapp"></i> ${property.whatsapp}</p>` : ''}
            <div class="form-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${isOwner ? `
                    <button class="btn btn-primary" onclick="viewProperty(${property.id})">Voir</button>
                    <button class="btn btn-secondary" onclick="editProperty(${property.id})">Modifier</button>
                    <button class="btn" onclick="deleteProperty(${property.id})" style="background: var(--error-color); color: white;">Supprimer</button>
                ` : `
                    <button class="btn btn-primary" onclick="viewProperty(${property.id})">Voir détails</button>
                    <button class="btn btn-whatsapp" onclick="contactOwner(${property.id})">
                        <i class="fab fa-whatsapp"></i> Contacter
                    </button>
                    <button class="btn btn-secondary" onclick="startConversation(${property.id})">Message</button>
                    ${currentUser && currentUser.type === 'tenant' ? `<button class="btn btn-favorite ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(${property.id})">${isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}</button>` : ''}
                `}
            </div>
        </div>
    `;

    return card;
}

// Toggle Favorite
function toggleFavorite(propertyId) {
    if (!currentUser || currentUser.type !== 'tenant') return;

    showLoading();
    setTimeout(() => {
        const index = currentUser.favorites.indexOf(propertyId);
        if (index > -1) {
            currentUser.favorites.splice(index, 1);
        } else {
            currentUser.favorites.push(propertyId);
        }

        // Update user
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        // Reload current screen
        if (document.getElementById('tenantDashboard').classList.contains('active')) {
            loadTenantProperties();
        } else if (document.getElementById('search').classList.contains('active')) {
            performSearch();
        } else if (document.getElementById('profile').classList.contains('active')) {
            loadProfileFavorites();
        }
        hideLoading();
    }, 500);
}

// Show Add Property Form
function showAddPropertyForm() {
    document.getElementById('propertyFormTitle').textContent = 'Ajouter une propriété';
    document.getElementById('propertyId').value = '';
    document.getElementById('propertyForm').reset();
    document.getElementById('imagePreviewContainer').innerHTML = '';
    currentPropertyImages = [];
    // Reset amenities
    document.querySelectorAll('input[name="amenity"]').forEach(cb => cb.checked = false);
    showScreen('propertyFormScreen');
}

// Edit Property
function editProperty(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    document.getElementById('propertyFormTitle').textContent = 'Modifier la propriété';
    document.getElementById('propertyId').value = property.id;
    document.getElementById('propertyTitle').value = property.title;
    document.getElementById('propertyPrice').value = property.price;
    document.getElementById('propertyType').value = property.type;
    document.getElementById('propertyStatus').value = property.status;
    document.getElementById('propertySurface').value = property.surface;
    document.getElementById('propertyRooms').value = property.rooms;
    document.getElementById('propertyBedrooms').value = property.bedrooms;
    document.getElementById('propertyBathrooms').value = property.bathrooms;
    document.getElementById('propertyAddress').value = property.address;
    document.getElementById('propertyCity').value = property.city;
    document.getElementById('propertyWhatsApp').value = property.whatsapp;
    document.getElementById('propertyDescription').value = property.description;

    // Load amenities
    document.querySelectorAll('input[name="amenity"]').forEach(cb => {
        cb.checked = property.amenities.includes(cb.value);
    });

    // Load images
    document.getElementById('imagePreviewContainer').innerHTML = '';
    currentPropertyImages = property.images || [];
    if (currentPropertyImages.length > 0) {
        currentPropertyImages.forEach((image, index) => {
            addImagePreview(image, index);
        });
    }

    showScreen('propertyFormScreen');
}

// Handle Image Upload
function handleImageUpload(files) {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue;

        const reader = new FileReader();
        reader.onload = function(e) {
            currentPropertyImages.push(e.target.result);
            addImagePreview(e.target.result, currentPropertyImages.length - 1);
        };
        reader.readAsDataURL(file);
    }
}

// Add Image Preview
function addImagePreview(imageSrc, index) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
        <img src="${imageSrc}" alt="Preview ${index + 1}">
        <div class="remove-image" onclick="removeImage(${index})">
            <i class="fas fa-times"></i>
        </div>
    `;
    previewContainer.appendChild(preview);
}

// Remove Image
function removeImage(index) {
    currentPropertyImages.splice(index, 1);
    document.getElementById('imagePreviewContainer').innerHTML = '';
    currentPropertyImages.forEach((image, i) => {
        addImagePreview(image, i);
    });
}

// Cancel Property Edit
function cancelPropertyEdit() {
    showScreen('ownerDashboard');
}

// Property Form Submission
document.getElementById('propertyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm(this)) return;
    showLoading();
    const propertyId = document.getElementById('propertyId').value;
    const title = document.getElementById('propertyTitle').value;
    const price = parseInt(document.getElementById('propertyPrice').value);
    const type = document.getElementById('propertyType').value;
    const status = document.getElementById('propertyStatus').value;
    const surface = parseInt(document.getElementById('propertySurface').value);
    const rooms = parseInt(document.getElementById('propertyRooms').value);
    const bedrooms = parseInt(document.getElementById('propertyBedrooms').value);
    const bathrooms = parseInt(document.getElementById('propertyBathrooms').value);
    const address = document.getElementById('propertyAddress').value;
    const city = document.getElementById('propertyCity').value;
    const whatsapp = document.getElementById('propertyWhatsApp').value;
    const description = document.getElementById('propertyDescription').value;
    const amenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(cb => cb.value);

    setTimeout(() => {
        if (propertyId) {
            // Update
            const index = properties.findIndex(p => p.id === parseInt(propertyId));
            if (index !== -1) {
                properties[index] = {
                    ...properties[index],
                    title,
                    price,
                    type,
                    status,
                    surface,
                    rooms,
                    bedrooms,
                    bathrooms,
                    address,
                    city,
                    whatsapp,
                    description,
                    images: currentPropertyImages,
                    amenities
                };
            }
        } else {
            // Add new
            const newProperty = {
                id: Date.now(),
                ownerId: currentUser.id,
                title,
                price,
                type,
                status,
                surface,
                rooms,
                bedrooms,
                bathrooms,
                address,
                city,
                whatsapp,
                description,
                images: currentPropertyImages,
                reviews: [],
                amenities,
                views: 0,
                dateAdded: Date.now()
            };
            properties.push(newProperty);
        }

        localStorage.setItem('properties', JSON.stringify(properties));
        alert(propertyId ? 'Propriété modifiée avec succès!' : 'Propriété ajoutée avec succès!');
        showScreen('ownerDashboard');
        hideLoading();
    }, 1000);
});

// Delete Property
function deleteProperty(propertyId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Cela supprimera aussi les messages associés.')) return;

    showLoading();
    setTimeout(() => {
        properties = properties.filter(p => p.id !== propertyId);
        // Clean conversations related to this property
        conversations = conversations.filter(c => c.propertyId !== propertyId);
        // Clean visits related to this property
        visits = visits.filter(v => v.propertyId !== propertyId);

        localStorage.setItem('properties', JSON.stringify(properties));
        localStorage.setItem('conversations', JSON.stringify(conversations));
        localStorage.setItem('visits', JSON.stringify(visits));

        loadOwnerProperties();
        hideLoading();
    }, 1000);
}

// View Property Details
function viewProperty(propertyId) {
    showLoading();
    setTimeout(() => {
        const property = properties.find(p => p.id === propertyId);
        if (!property) {
            hideLoading();
            return;
        }

        // Increment views
        property.views = (property.views || 0) + 1;
        localStorage.setItem('properties', JSON.stringify(properties));

        modalPropertyOwnerId = property.ownerId;
        modalPropertyId = propertyId;

        document.getElementById('modalPropertyTitle').textContent = property.title;
        document.getElementById('modalPropertyPrice').textContent = `${property.price.toLocaleString('fr-DZ')} DZD/mois`;
        document.getElementById('modalPropertyAddress').textContent = property.address;
        document.getElementById('modalPropertyCity').textContent = property.city;
        document.getElementById('modalPropertyType').textContent = property.type.charAt(0).toUpperCase() + property.type.slice(1);
        document.getElementById('modalPropertyStatus').textContent = property.status === 'available' ? 'Disponible' : 'Loué';
        document.getElementById('modalPropertyWhatsApp').textContent = property.whatsapp;
        document.getElementById('modalPropertyDescription').textContent = property.description;

        const detailsHtml = `
            <span>📐 ${property.surface}m²</span>
            <span>🏠 ${property.rooms} pièces</span>
            <span>🛏️ ${property.bedrooms} ch</span>
            <span>🚿 ${property.bathrooms} sdb</span>
        `;
        document.getElementById('modalPropertyDetails').innerHTML = detailsHtml;

        const thumbnailsContainer = document.getElementById('modalThumbnails');
        thumbnailsContainer.innerHTML = '';

        if (property.images && property.images.length > 0) {
            document.getElementById('modalMainImage').src = property.images[0];
            property.images.forEach((image, index) =>{
                const thumb = document.createElement('div');
                thumb.className = 'modal-thumbnail' + (index === 0 ? ' active' : '');
                thumb.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}">`;
                thumb.onclick = () => {
                    document.getElementById('modalMainImage').src = image;
                    document.querySelectorAll('.modal-thumbnail').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                };
                thumbnailsContainer.appendChild(thumb);
            });
        } else {
            document.getElementById('modalMainImage').src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23' + (isDarkMode ? '374151' : 'f3f4f6') + '"/><text x="200" y="150" font-family="Arial" font-size="20" fill="%23' + (isDarkMode ? '9ca3af' : '6b7280') + '" text-anchor="middle">Image non disponible</text></svg>';
        }

        // Load reviews
        loadModalReviews(propertyId);

        document.getElementById('propertyModal').classList.add('active');
        hideLoading();
    }, 500);
}

// Load Modal Reviews
function loadModalReviews(propertyId) {
    const reviewsList = document.getElementById('modalReviewsList');
    reviewsList.innerHTML = '';

    const property = properties.find(p => p.id === propertyId);
    if (!property || !property.reviews || property.reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center">Aucun avis pour le moment.</p>';
        return;
    }

    property.reviews.forEach(review => {
        const reviewer = users.find(u => u.id === review.userId);
        const reviewerName = reviewer ? reviewer.name : 'Anonyme';

        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-stars">${'<i class="fas fa-star"></i>'.repeat(review.stars)}</div>
            <div class="review-comment">${review.comment}</div>
            <p class="text-right" style="font-size: 0.8rem; color: var(--text-secondary);">${reviewerName} - ${new Date(review.date).toLocaleDateString('fr-FR')}</p>
        `;
        reviewsList.appendChild(reviewCard);
    });
}

// Submit Review
function submitReview() {
    if (!currentUser) {
        alert('Veuillez vous connecter pour laisser un avis.');
        return;
    }

    if (currentReviewStars === 0) {
        alert("Veuillez sélectionner un nombre d'étoiles.");
        return;
    }

    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) {
        alert('Veuillez entrer un commentaire.');
        return;
    }

    showLoading();
    setTimeout(() => {
        const propertyIndex = properties.findIndex(p => p.id === modalPropertyId);
        if (propertyIndex !== -1) {
            properties[propertyIndex].reviews.push({
                userId: currentUser.id,
                stars: currentReviewStars,
                comment: comment,
                date: Date.now()
            });
            localStorage.setItem('properties', JSON.stringify(properties));
        }

        // Reset form
        document.getElementById('reviewComment').value = '';
        currentReviewStars = 0;
        document.querySelectorAll('#reviewStars i').forEach(s => s.classList.remove('active'));

        // Reload reviews
        loadModalReviews(modalPropertyId);
        hideLoading();
        alert('Avis envoyé avec succès!');
    }, 1000);
}

// Close Modal
function closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
    modalPropertyId = null;
}

// Schedule Visit
function scheduleVisit() {
    document.getElementById('visitModal').classList.add('active');
}

function closeVisitModal() {
    document.getElementById('visitModal').classList.remove('active');
}

function submitVisit() {
    const date = document.getElementById('visitDate').value;
    const time = document.getElementById('visitTime').value;
    const message = document.getElementById('visitMessage').value.trim();

    if (!date || !time) {
        alert('Veuillez sélectionner une date et une heure.');
        return;
    }

    const visitRequest = {
        id: 'visit-' + Date.now(),
        propertyId: modalPropertyId,
        userId: currentUser.id,
        date: date,
        time: time,
        message: message,
        status: 'pending',
        createdAt: Date.now()
    };

    visits.push(visitRequest);
    localStorage.setItem('visits', JSON.stringify(visits));

    alert('Demande de visite envoyée! Le propriétaire vous contactera bientôt.');
    closeVisitModal();
}

// View Owner Profile
function viewOwnerProfile(ownerId) {
    showScreen('userProfile', {userId: ownerId});
}

// Contact Owner via WhatsApp
function contactOwner(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    const owner = users.find(u => u.id === property.ownerId);
    if (!owner) return;

    currentWhatsAppProperty = {
        property: property,
        owner: owner
    };

    document.getElementById('whatsappPropertyTitle').textContent = property.title;
    document.getElementById('whatsappPropertyPrice').textContent = `${property.price.toLocaleString('fr-DZ')} DZD/mois`;
    document.getElementById('whatsappModal').classList.add('active');
}

// Open WhatsApp
function openWhatsApp() {
    if (!currentWhatsAppProperty) return;

    const { property, owner } = currentWhatsAppProperty;
    const message = `Bonjour, je suis intéressé(e) par votre propriété "${property.title}" à ${property.city} pour ${property.price.toLocaleString('fr-DZ')} DZD/mois. Pouvez-vous me donner plus d'informations ?`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = property.whatsapp || owner.phone;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    closeWhatsAppModal();
}

// Close WhatsApp Modal
function closeWhatsAppModal() {
    document.getElementById('whatsappModal').classList.remove('active');
    currentWhatsAppProperty = null;
}

// Start Conversation
function startConversation(propertyId) {
    if (!currentUser) {
        alert('Veuillez vous connecter pour envoyer un message.');
        showScreen('login');
        return;
    }

    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    const owner = users.find(u => u.id === property.ownerId);
    if (!owner) return;

    // Check if conversation already exists
    let conversation = conversations.find(c =>
        c.propertyId === propertyId &&
        ((c.user1Id === currentUser.id && c.user2Id === owner.id) ||
         (c.user1Id === owner.id && c.user2Id === currentUser.id))
    );

    // If not, create a new conversation
    if (!conversation) {
        conversation = {
            id: 'conv-' + Date.now(),
            propertyId: propertyId,
            user1Id: currentUser.id,
            user2Id: owner.id,
            messages: [],
            lastUpdated: Date.now()
        };
        conversations.push(conversation);
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }

    // Open chat
    openChat(propertyId, owner.id);
}

// Open Chat
function openChat(propertyId, otherUserId) {
    currentChat = {propertyId, otherUserId};

    const property = properties.find(p => p.id === propertyId);
    const otherUser = users.find(u => u.id === otherUserId);

    if (property && otherUser) {
        document.getElementById('chatWithUser').textContent = `Conversation avec ${otherUser.name}`;
        document.getElementById('chatPropertyTitle').textContent = property.title;
    }

    loadChatMessages();
    document.getElementById('chatModal').classList.add('active');
}

// Load Chat Messages
function loadChatMessages() {
    showLoading();
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';

        // Find conversation
        const conversation = conversations.find(c =>
            c.propertyId === currentChat.propertyId &&
            ((c.user1Id === currentUser.id && c.user2Id === currentChat.otherUserId) ||
             (c.user1Id === currentChat.otherUserId && c.user2Id === currentUser.id))
        );

        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            messagesContainer.innerHTML = '<p class="text-center">Aucun message pour le moment. Commencez la conversation!</p>';
            hideLoading();
            return;
        }

        // Display messages
        conversation.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = msg.senderId === currentUser.id ? 'message message-sent' : 'message message-received';

            const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            messageDiv.innerHTML = `
                <div>${msg.content}</div>
                <div class="message-time">${time}</div>
            `;

            messagesContainer.appendChild(messageDiv);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        hideLoading();
    }, 500);
}

// Send Chat Message
function sendChatMessage() {
    if (!currentUser) return;

    const input = document.getElementById('chatInput');
    const content = input.value.trim();

    if (!content) return;

    showLoading();
    setTimeout(() => {
        // Find conversation
        let conversation = conversations.find(c =>
            c.propertyId === currentChat.propertyId &&
            ((c.user1Id === currentUser.id && c.user2Id === currentChat.otherUserId) ||
             (c.user1Id === currentChat.otherUserId && c.user2Id === currentUser.id))
        );

        // If conversation doesn't exist, create it
        if (!conversation) {
            conversation = {
                id: 'conv-' + Date.now(),
                propertyId: currentChat.propertyId,
                user1Id: currentUser.id,
                user2Id: currentChat.otherUserId,
                messages: [],
                lastUpdated: Date.now()
            };
            conversations.push(conversation);
        }

        // Add message
        const message = {
            id: 'msg-' + Date.now(),
            senderId: currentUser.id,
            content: content,
            timestamp: Date.now()
        };

        conversation.messages.push(message);
        conversation.lastUpdated = Date.now();

        // Save to localStorage
        localStorage.setItem('conversations', JSON.stringify(conversations));

        // Clear input and reload messages
        input.value = '';
        loadChatMessages();

        // Update conversations list if on messages screen
        if (document.getElementById('messages').classList.contains('active')) {
            loadConversations();
        }
        hideLoading();
    }, 500);
}

// Close Chat Modal
function closeChatModal() {
    document.getElementById('chatModal').classList.remove('active');
    document.getElementById('chatInput').value = '';
    currentChat = {propertyId: null, otherUserId: null};
}

// Load Conversations
function loadConversations() {
    showLoading();
    setTimeout(() => {
        const list = document.getElementById('conversationsList');
        list.innerHTML = '';

        if (!currentUser) {
            hideLoading();
            return;
        }

        // Get user's conversations
        const userConversations = conversations.filter(c =>
            c.user1Id === currentUser.id || c.user2Id === currentUser.id
        );

        // Sort by last updated (newest first)
        userConversations.sort((a, b) => b.lastUpdated - a.lastUpdated);

        if (userConversations.length === 0) {
        list.innerHTML = '<p class="text-center">Aucune conversation.</p>';
        hideLoading();
        return;
    }

    // Display conversations
    userConversations.forEach(conv => {
        const otherUserId = conv.user1Id === currentUser.id ? conv.user2Id : conv.user1Id;
        const otherUser = users.find(u => u.id === otherUserId);
        const property = properties.find(p => p.id === conv.propertyId);

        if (!otherUser || !property) return;

        const lastMessage = conv.messages && conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
            : null;

        const time = lastMessage
            ? new Date(lastMessage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : '';

        const conversationDiv = document.createElement('div');
        conversationDiv.className = 'conversation-card';
        conversationDiv.onclick = () => openChat(conv.propertyId, otherUserId);

        conversationDiv.innerHTML = `
            <div class="conversation-avatar">${otherUser.name.charAt(0).toUpperCase()}</div>
            <div class="conversation-info">
                <div class="conversation-name">${otherUser.name}</div>
                <div class="conversation-lastmsg">${property.title}</div>
                ${lastMessage ? `<div class="conversation-lastmsg">${lastMessage.content}</div>` : ''}
            </div>
            <div class="conversation-time">${time}</div>
        `;

        list.appendChild(conversationDiv);
    });
    hideLoading();
}, 500);
}

// Load Visit Requests
function loadVisitRequests() {
    showLoading();
    setTimeout(() => {
        const list = document.getElementById('visitsList');
        list.innerHTML = '';

        if (!currentUser) {
            hideLoading();
            return;
        }

        // Get visit requests based on user type
        let visitRequests = [];
        if (currentUser.type === 'owner') {
            // Get owner's properties
            const ownerProperties = properties.filter(p => p.ownerId === currentUser.id);
            const ownerPropertyIds = ownerProperties.map(p => p.id);

            // Get visit requests for owner's properties
            visitRequests = visits.filter(v => ownerPropertyIds.includes(v.propertyId));
        } else if (currentUser.type === 'tenant') {
            // Get tenant's visit requests
            visitRequests = visits.filter(v => v.userId === currentUser.id);
        }

        // Sort by creation date (newest first)
        visitRequests.sort((a, b) => b.createdAt - a.createdAt);

        if (visitRequests.length === 0) {
            list.innerHTML = '<p class="text-center">Aucune demande de visite.</p>';
            hideLoading();
            return;
        }

// Display visit requests
visitRequests.forEach(visit => {
    const property = properties.find(p => p.id === visit.propertyId);
    const user = users.find(u => u.id === visit.userId);

    if (!property) return;

    const visitCard = document.createElement('div');
    visitCard.className = 'visit-card';

    if (currentUser.type === 'owner') {
        // Owner view - show user info and action buttons
        visitCard.innerHTML = `
            <div class="visit-header">
                <h4>${property.title}</h4>
                <span class="visit-status status-${visit.status || 'pending'}">${getStatusText(visit.status)}</span>
            </div>
            <p><strong>Demandeur:</strong> ${user ? user.name : 'Utilisateur inconnu'}</p>
            <p><strong>Date demandée:</strong> ${new Date(visit.date).toLocaleDateString('fr-FR')} à ${visit.time}</p>
            <p><strong>Adresse:</strong> ${property.address}, ${property.city}</p>
            ${visit.message ? `<p><strong>Message:</strong> ${visit.message}</p>` : ''}
            ${visit.status === 'pending' ? `
                <div class="visit-actions">
                    <button class="btn btn-primary" onclick="respondToVisit('${visit.id}', 'accepted')">Accepter</button>
                    <button class="btn" style="background: var(--error-color); color: white;" onclick="respondToVisit('${visit.id}', 'rejected')">Refuser</button>
                </div>
            ` : ''}
            ${visit.ownerResponse ? `<p><strong>Votre réponse:</strong> ${visit.ownerResponse}</p>` : ''}
        `;
    } else {
        // Tenant view - show property info and status
        visitCard.innerHTML = `
            <div class="visit-header">
                <h4>${property.title}</h4>
                <span class="visit-status status-${visit.status || 'pending'}">${getStatusText(visit.status)}</span>
            </div>
            <p><strong>Date demandée:</strong> ${new Date(visit.date).toLocaleDateString('fr-FR')} à ${visit.time}</p>
            <p><strong>Adresse:</strong> ${property.address}, ${property.city}</p>
            ${visit.message ? `<p><strong>Votre message:</strong> ${visit.message}</p>` : ''}
            ${visit.ownerResponse ? `<p><strong>Réponse du propriétaire:</strong> ${visit.ownerResponse}</p>` : ''}
        `;
    }
    list.appendChild(visitCard);
});
hideLoading();
}, 500);
}

// Respond to Visit Request
function respondToVisit(visitId, response) {
    const visitIndex = visits.findIndex(v => v.id === visitId);
    if (visitIndex === -1) return;

    const responseText = prompt(response === 'accepted' ? 
        'Entrez un message de confirmation pour le locataire:' : 
        'Entrez un message pour expliquer votre refus:');

    if (responseText === null) return; // User cancelled

    visits[visitIndex].status = response;
    visits[visitIndex].ownerResponse = responseText;
    visits[visitIndex].respondedAt = Date.now();

    localStorage.setItem('visits', JSON.stringify(visits));
    alert(`Demande de visite ${response === 'accepted' ? 'acceptée' : 'refusée'}!`);
    loadVisitRequests();
}

// Get Status Text
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'En attente';
        case 'accepted': return 'Acceptée';
        case 'rejected': return 'Refusée';
        default: return 'En attente';
    }
}

// Initialize the application
function initApp() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }

    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
        properties = JSON.parse(savedProperties);
    }

    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
        conversations = JSON.parse(savedConversations);
    }

    const savedVisits = localStorage.getItem('visits');
    if (savedVisits) {
        visits = JSON.parse(savedVisits);
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavForLoggedUser();
        showDashboard();
    } else {
        showScreen('welcome');
    }
}

window.onload = initApp;
