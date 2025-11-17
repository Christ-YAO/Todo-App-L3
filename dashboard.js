// Dashboard logic
let selectedColor = 'blue';
let currentView = 'grid';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    if (currentUser && currentUser.name) {
        const userNameEl = document.getElementById('userName');
        const userInitialEl = document.getElementById('userInitial');
        const userGreetingEl = document.getElementById('userGreeting');
        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (userInitialEl) userInitialEl.textContent = currentUser.name.charAt(0).toUpperCase();
        if (userGreetingEl) userGreetingEl.textContent = `, ${currentUser.name.split(' ')[0]} !`;
    }

    // Load stats and boards
    loadStats();
    loadBoards();

    // Setup color selection for create form
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(b => {
                b.classList.remove('ring-2', 'ring-offset-2');
            });
            this.classList.add('ring-2', 'ring-offset-2');
            selectedColor = this.dataset.color;
        });
    });


    // Set default color
    const defaultColorBtn = document.querySelector('.color-option[data-color="blue"]');
    if (defaultColorBtn) {
        defaultColorBtn.classList.add('ring-2', 'ring-offset-2');
    }

    // Handle create board form
    const createBoardForm = document.getElementById('createBoardForm');
    if (createBoardForm) {
        createBoardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const boardName = document.getElementById('boardName').value;
            createBoard(boardName, selectedColor);
        });
    }

    // Handle edit board form
    const editBoardForm = document.getElementById('editBoardForm');
    if (editBoardForm) {
        editBoardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const boardId = editBoardForm.dataset.boardId;
            const boardName = document.getElementById('editBoardName').value;
            if (!boardId || !boardName) {
                console.error('Missing board ID or name');
                return;
            }
            updateBoard(boardId, boardName, selectedColor);
        });
    }

    // Setup edit color selection when modal opens
    document.querySelectorAll('.edit-color-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.edit-color-option').forEach(b => {
                b.classList.remove('ring-2', 'ring-offset-2');
            });
            this.classList.add('ring-2', 'ring-offset-2');
            selectedColor = this.dataset.color;
        });
    });
});

function loadStats() {
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const userBoards = boards.filter(b => b.userId === currentUser.id);
    const userCards = cards.filter(c => userBoards.some(b => b.id === c.boardId));
    
    const statsSection = document.getElementById('statsSection');
    if (!statsSection) return;
    
    const totalCards = userCards.length;
    const completedCards = userCards.filter(c => {
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        const column = columns.find(col => col.id === c.columnId);
        return column && (column.name.toLowerCase().includes('terminé') || column.name.toLowerCase().includes('done') || column.name.toLowerCase().includes('complété'));
    }).length;
    
    statsSection.innerHTML = `
        <div class="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tableaux</h3>
                <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
            </div>
            <p class="text-3xl font-bold text-foreground">${userBoards.length}</p>
            <p class="text-sm text-muted-foreground mt-1">tableaux actifs</p>
        </div>
        <div class="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cartes</h3>
                <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
            </div>
            <p class="text-3xl font-bold text-foreground">${totalCards}</p>
            <p class="text-sm text-muted-foreground mt-1">cartes au total</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Complétées</h3>
                <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <p class="text-3xl font-bold text-foreground">${completedCards}</p>
            <p class="text-sm text-muted-foreground mt-1">tâches terminées</p>
        </div>
    `;
}

function loadBoards() {
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter boards for current user
    const userBoards = boards.filter(b => b.userId === currentUser.id);
    
    const container = document.getElementById('boardsContainer');
    const emptyState = document.getElementById('emptyState');

    if (userBoards.length === 0) {
        if (container) container.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (container) container.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (!container) return;
    
    container.innerHTML = '';
    container.className = currentView === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4';

    userBoards.forEach(board => {
        const boardCard = createBoardCard(board);
        container.appendChild(boardCard);
    });
    
    // Update view buttons
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    if (gridBtn && listBtn) {
        if (currentView === 'grid') {
            gridBtn.className = 'p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors';
            listBtn.className = 'p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors';
        } else {
            gridBtn.className = 'p-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors';
            listBtn.className = 'p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors';
        }
    }
}

function createBoardCard(board) {
    const card = document.createElement('div');
    
    if (currentView === 'grid') {
        card.className = 'group relative bg-background border-2 border-border rounded-2xl overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1';
    } else {
        card.className = 'group bg-background border-2 border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300 flex items-center space-x-6';
    }
    
    const handleCardClick = (e) => {
        // Don't open board if clicking on menu or menu buttons
        if (e.target.closest('.board-menu') || e.target.closest('[onclick*="editBoard"]') || e.target.closest('[onclick*="deleteBoard"]')) {
            return;
        }
        openBoard(board.id);
    };
    
    card.onclick = handleCardClick;

    const colorMap = {
        blue: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
        purple: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
        green: { bg: 'bg-green-500', gradient: 'from-green-500 to-green-600' },
        yellow: { bg: 'bg-yellow-500', gradient: 'from-yellow-500 to-yellow-600' },
        red: { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
        pink: { bg: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600' }
    };

    const colors = colorMap[board.color] || colorMap.blue;
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');
    const boardCards = cards.filter(c => c.boardId === board.id);
    const cardCount = boardCards.length;

    if (currentView === 'grid') {
        card.innerHTML = `
            <div class="relative h-48 bg-gradient-to-br ${colors.gradient} overflow-hidden">
                <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <svg class="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                </div>
                <div class="absolute top-4 right-4 flex items-center space-x-2">
                    <div class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span class="text-white text-sm font-semibold">${cardCount}</span>
                    </div>
                    <div class="board-menu relative">
                        <button onclick="event.stopPropagation(); showBoardMenu('${board.id}', event)" class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer">${board.name}</h3>
                <div class="flex items-center space-x-2 text-muted-foreground">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span class="text-sm">${cardCount} carte${cardCount > 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
            </div>
            <div class="flex-1">
                <h3 class="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors cursor-pointer">${board.name}</h3>
                <div class="flex items-center space-x-4 text-muted-foreground text-sm">
                    <span>${cardCount} carte${cardCount > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Créé le ${new Date(board.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
            <div class="flex-shrink-0 flex items-center space-x-2">
                <div class="board-menu relative">
                    <button onclick="event.stopPropagation(); showBoardMenu('${board.id}', event)" class="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                    </button>
                </div>
                <svg class="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </div>
        `;
    }

    return card;
}

function setView(view) {
    currentView = view;
    loadBoards();
}

function createBoard(name, color) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');

    const newBoard = {
        id: Date.now().toString(),
        name: name,
        color: color,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        cardCount: 0
    };

    boards.push(newBoard);
    localStorage.setItem('boards', JSON.stringify(boards));

    hideCreateBoardModal();
    loadBoards();
}

function openBoard(boardId) {
    window.location.href = `kanban.html?id=${boardId}`;
}

function showCreateBoardModal() {
    document.getElementById('createBoardModal').classList.remove('hidden');
    document.getElementById('createBoardModal').classList.add('flex');
    document.getElementById('boardName').value = '';
}

function hideCreateBoardModal() {
    document.getElementById('createBoardModal').classList.add('hidden');
    document.getElementById('createBoardModal').classList.remove('flex');
}

function showCreateTeamModal() {
    alert('Fonctionnalité équipe à venir !');
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

let currentBoardMenu = null;

function showBoardMenu(boardId, event) {
    // Close previous menu if open
    if (currentBoardMenu) {
        currentBoardMenu.remove();
        currentBoardMenu = null;
    }

    const menu = document.createElement('div');
    menu.className = 'absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 py-1';
    menu.onclick = (e) => e.stopPropagation(); // Prevent card click when clicking menu
    menu.innerHTML = `
        <button onclick="event.stopPropagation(); editBoard('${boardId}'); return false;" class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Modifier</span>
        </button>
        <button onclick="event.stopPropagation(); deleteBoard('${boardId}'); return false;" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span>Supprimer</span>
        </button>
    `;

    const button = event.target.closest('button');
    button.parentElement.appendChild(menu);
    currentBoardMenu = menu;

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !button.contains(e.target)) {
                menu.remove();
                currentBoardMenu = null;
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

function editBoard(boardId) {
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    const board = boards.find(b => b.id === boardId);
    
    if (!board) {
        console.error('Board not found:', boardId);
        return;
    }

    // Close menu first
    if (currentBoardMenu) {
        currentBoardMenu.remove();
        currentBoardMenu = null;
    }

    // Fill edit form
    const editBoardNameInput = document.getElementById('editBoardName');
    const editBoardForm = document.getElementById('editBoardForm');
    
    if (!editBoardNameInput || !editBoardForm) {
        console.error('Edit form elements not found');
        return;
    }

    editBoardNameInput.value = board.name;
    editBoardForm.dataset.boardId = boardId;
    
    // Select current color
    selectedColor = board.color || 'blue';
    document.querySelectorAll('.edit-color-option').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-offset-2');
        if (btn.dataset.color === board.color) {
            btn.classList.add('ring-2', 'ring-offset-2');
        }
    });

    // Show edit modal
    showEditBoardModal();
}

function deleteBoard(boardId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tableau ? Cette action supprimera également toutes les colonnes et cartes associées.')) {
        return;
    }

    // Delete board
    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    const filteredBoards = boards.filter(b => b.id !== boardId);
    localStorage.setItem('boards', JSON.stringify(filteredBoards));

    // Delete associated columns
    const columns = JSON.parse(localStorage.getItem('columns') || '[]');
    const filteredColumns = columns.filter(c => c.boardId !== boardId);
    localStorage.setItem('columns', JSON.stringify(filteredColumns));

    // Delete associated cards
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');
    const filteredCards = cards.filter(c => c.boardId !== boardId);
    localStorage.setItem('cards', JSON.stringify(filteredCards));

    // Close menu
    if (currentBoardMenu) {
        currentBoardMenu.remove();
        currentBoardMenu = null;
    }

    loadBoards();
    loadStats();
}

function updateBoard(boardId, name, color) {
    if (!boardId || !name || !color) {
        console.error('Missing parameters:', { boardId, name, color });
        return;
    }

    const boards = JSON.parse(localStorage.getItem('boards') || '[]');
    const board = boards.find(b => b.id === boardId);
    
    if (!board) {
        console.error('Board not found:', boardId);
        return;
    }

    board.name = name;
    board.color = color;

    localStorage.setItem('boards', JSON.stringify(boards));
    hideEditBoardModal();
    loadBoards();
    loadStats();
}

function showEditBoardModal() {
    const modal = document.getElementById('editBoardModal');
    if (!modal) {
        console.error('Edit board modal not found');
        return;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideEditBoardModal() {
    document.getElementById('editBoardModal').classList.add('hidden');
    document.getElementById('editBoardModal').classList.remove('flex');
}

