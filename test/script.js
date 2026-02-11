document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('gameGrid');
    const searchInput = document.getElementById('gameSearch');
    const gameOverlay = document.getElementById('gameOverlay');
    const gameIframe = document.getElementById('gameIframe');
    const closeOverlay = document.getElementById('closeOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const toggleFullscreen = document.getElementById('toggleFullscreen');
    const errorToast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');

    let gamesData = [];

    // Fetch games from games.json
    async function loadGames() {
        try {
            const response = await fetch('games.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            gamesData = await response.json();
            renderGames(gamesData);
        } catch (error) {
            console.error('Could not load games:', error);
            showError('Failed to load games.json. Make sure the file exists and is valid JSON.');
            gameGrid.innerHTML = `<p style="text-align: center; width: 100%;">Error loading library. Check console for details.</p>`;
        }
    }

    // Render cards to the grid
    function renderGames(games) {
        gameGrid.innerHTML = '';
        
        if (games.length === 0) {
            gameGrid.innerHTML = `<p style="text-align: center; width: 100%;">No games found matching your search.</p>`;
            return;
        }

        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-icon-container">
                    <img class="game-icon" src="${game.icon}" alt="${game.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Icon'">
                </div>
                <div class="game-info">
                    <span class="game-category">${game.category || 'Web Game'}</span>
                    <h3>${game.name}</h3>
                </div>
            `;
            card.addEventListener('click', () => launchGame(game));
            gameGrid.appendChild(card);
        });
    }

    // Launch game in iframe
    function launchGame(game) {
        overlayTitle.textContent = game.name;
        gameIframe.src = game.path;
        gameOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close overlay
    function exitGame() {
        gameOverlay.classList.remove('active');
        gameIframe.src = ''; // Stop game execution/sound
        document.body.style.overflow = 'auto';
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    // Fullscreen toggle logic
    function toggleOverlayFullscreen() {
        if (!document.fullscreenElement) {
            gameOverlay.requestFullscreen().catch(err => {
                showError(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Search filtering
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = gamesData.filter(game => 
            game.name.toLowerCase().includes(term) || 
            (game.category && game.category.toLowerCase().includes(term))
        );
        renderGames(filtered);
    });

    // Event listeners
    closeOverlay.addEventListener('click', exitGame);
    toggleFullscreen.addEventListener('click', toggleOverlayFullscreen);

    // Escape key to exit game
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameOverlay.classList.contains('active')) {
            exitGame();
        }
    });

    // Helper to show error toast
    function showError(msg) {
        errorMessage.textContent = msg;
        errorToast.classList.remove('hidden');
        setTimeout(() => {
            errorToast.classList.add('hidden');
        }, 5000);
    }

    // Initialize
    loadGames();
});
