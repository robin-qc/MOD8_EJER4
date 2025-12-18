// ============================================
// SISTEMA DE REGISTRO PROFESIONAL
// ============================================

// Elementos principales
const form = document.getElementById('registrationForm');
const themeToggle = document.getElementById('themeToggle');
const historyToggle = document.getElementById('historyToggle');
const historyCount = document.querySelector('.history-count');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const age = document.getElementById('age');
const terms = document.getElementById('terms');
const submitBtn = document.getElementById('submitBtn');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');

// Modales
const termsModal = document.getElementById('termsModal');
const successModal = document.getElementById('successModal');
const historyModal = document.getElementById('historyModal');
const successDetails = document.getElementById('successDetails');
const historyList = document.getElementById('historyList');
const totalRegistrations = document.getElementById('totalRegistrations');
const todayRegistrations = document.getElementById('todayRegistrations');
const averageAge = document.getElementById('averageAge');

// Botones de modales
const closeModalBtns = document.querySelectorAll('.close-modal');
const closeSuccessBtn = document.querySelector('.close-success');
const newRegisterBtn = document.getElementById('newRegisterBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const acceptTermsBtn = document.getElementById('acceptTerms');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Filtros y búsqueda
const historySearch = document.getElementById('historySearch');
const filterToday = document.getElementById('filterToday');
const filterAll = document.getElementById('filterAll');

// Estado global
let formState = {
    isValid: false,
    fields: {
        username: { valid: false, value: '' },
        email: { valid: false, value: '' },
        password: { valid: false, value: '' },
        confirmPassword: { valid: false, value: '' },
        age: { valid: false, value: '' },
        terms: { valid: false }
    }
};

// Historial de registros (almacenado en localStorage)
let registrations = JSON.parse(localStorage.getItem('userRegistrations')) || [];

// ============================================
// SISTEMA DE TEMA
// ============================================

function initThemeSystem() {
    const savedTheme = localStorage.getItem('form-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('form-theme', newTheme);
    
    themeToggle.style.transform = 'scale(1.1) rotate(180deg)';
    setTimeout(() => themeToggle.style.transform = 'scale(1) rotate(0deg)', 300);
}

// ============================================
// VALIDACIÓN DE FORMULARIO
// ============================================

function validateField(field) {
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    let isValid = true;
    let message = '';
    
    switch(field.id) {
        case 'username':
            if (!value) {
                message = 'El nombre de usuario es obligatorio';
                isValid = false;
            } else if (value.length < 3) {
                message = 'Mínimo 3 caracteres';
                isValid = false;
            } else if (!/^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                message = 'Solo letras, números, espacios y guiones bajos';
                isValid = false;
            } else if (value.length > 30) {
                message = 'Máximo 30 caracteres';
                isValid = false;
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                message = 'El correo electrónico es obligatorio';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                message = 'Formato de email inválido';
                isValid = false;
            } else if (value.length > 100) {
                message = 'Máximo 100 caracteres';
                isValid = false;
            }
            break;
            
        case 'password':
            if (!value) {
                message = 'La contraseña es obligatoria';
                isValid = false;
            } else if (value.length < 8) {
                message = 'Mínimo 8 caracteres';
                isValid = false;
            } else if (!/[A-Z]/.test(value)) {
                message = 'Debe contener al menos una mayúscula';
                isValid = false;
            } else if (!/[0-9]/.test(value)) {
                message = 'Debe contener al menos un número';
                isValid = false;
            } else if (/\s/.test(value)) {
                message = 'No debe contener espacios';
                isValid = false;
            } else if (value.length > 50) {
                message = 'Máximo 50 caracteres';
                isValid = false;
            }
            updatePasswordRequirements(value);
            break;
            
        case 'confirmPassword':
            if (!value) {
                message = 'Confirma tu contraseña';
                isValid = false;
            } else if (value !== password.value) {
                message = 'Las contraseñas no coinciden';
                isValid = false;
            }
            break;
            
        case 'age':
            const ageValue = parseInt(value);
            if (!value) {
                message = 'La edad es obligatoria';
                isValid = false;
            } else if (isNaN(ageValue)) {
                message = 'Debe ser un número válido';
                isValid = false;
            } else if (ageValue < 18) {
                message = 'Debes ser mayor de 18 años';
                isValid = false;
            } else if (ageValue > 120) {
                message = 'Ingresa una edad realista (máx 120)';
                isValid = false;
            } else if (!Number.isInteger(ageValue)) {
                message = 'Solo números enteros (ej: 19, 25, 30)';
                isValid = false;
            }
            break;
    }
    
    updateFieldUI(field, formGroup, errorMessage, isValid, message);
    formState.fields[field.name] = { valid: isValid, value: isValid ? value : '' };
    
    return isValid;
}

function updatePasswordRequirements(pwd) {
    const requirements = {
        'req-length': pwd.length >= 8,
        'req-uppercase': /[A-Z]/.test(pwd),
        'req-number': /[0-9]/.test(pwd),
        'req-nospace': !/\s/.test(pwd)
    };
    
    Object.entries(requirements).forEach(([id, met]) => {
        document.getElementById(id).classList.toggle('met', met);
    });
}

function updateFieldUI(field, formGroup, errorMessage, isValid, message) {
    if (isValid) {
        formGroup.classList.remove('error');
        formGroup.classList.add('valid');
        field.classList.remove('invalid');
        field.classList.add('valid');
        errorMessage.textContent = '';
    } else {
        formGroup.classList.remove('valid');
        formGroup.classList.add('error');
        field.classList.remove('valid');
        field.classList.add('invalid');
        errorMessage.textContent = message;
    }
}

function validateTerms() {
    const formGroup = terms.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    const isValid = terms.checked;
    
    if (isValid) {
        formGroup.classList.remove('error');
        errorMessage.textContent = '';
    } else {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Debes aceptar los términos y condiciones';
    }
    
    formState.fields.terms.valid = isValid;
    return isValid;
}

function updateProgress() {
    const fields = Object.values(formState.fields);
    const completed = fields.filter(f => f.valid).length;
    const total = fields.length;
    const percentage = Math.min(100, (completed / total) * 100);
    
    progressText.textContent = `${completed}/${total} campos completados`;
    progressFill.style.width = `${percentage}%`;
    
    if (percentage < 50) {
        progressFill.style.background = 'linear-gradient(135deg, #ff4757 0%, #ff9800 100%)';
    } else if (percentage < 100) {
        progressFill.style.background = 'linear-gradient(135deg, #ff9800 0%, #ffeb3b 100%)';
    } else {
        progressFill.style.background = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
    }
}

function checkFormValidity() {
    const allValid = Object.values(formState.fields).every(f => f.valid);
    submitBtn.disabled = !allValid;
    formState.isValid = allValid;
    updateProgress();
    return allValid;
}

// ============================================
// MANEJO DE CONTRASEÑAS
// ============================================

function setupPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            this.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
            
            this.style.transform = 'scale(1.2)';
            setTimeout(() => this.style.transform = 'scale(1)', 200);
        });
    });
}

// ============================================
// SISTEMA DE MODALES
// ============================================

function setupModals() {
    // Modal de Términos
    document.querySelector('.terms-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal(termsModal);
    });
    
    acceptTermsBtn.addEventListener('click', () => {
        terms.checked = true;
        validateTerms();
        checkFormValidity();
        closeModal(termsModal);
    });
    
    // Modal de Éxito
    closeSuccessBtn.addEventListener('click', () => closeModal(successModal));
    newRegisterBtn.addEventListener('click', () => {
        closeModal(successModal);
        resetForm();
    });
    viewHistoryBtn.addEventListener('click', () => {
        closeModal(successModal);
        openHistoryModal();
    });
    
    // Modal de Historial
    historyToggle.addEventListener('click', openHistoryModal);
    
    // Cerrar modales
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Cerrar al hacer clic fuera
    [termsModal, successModal, historyModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [termsModal, successModal, historyModal].forEach(modal => {
                if (modal.classList.contains('show')) closeModal(modal);
            });
        }
    });
}

function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function openHistoryModal() {
    updateHistoryStats();
    renderHistoryList();
    openModal(historyModal);
}

// ============================================
// HISTORIAL DE REGISTROS
// ============================================

function saveRegistration(userData) {
    const registration = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        age: userData.age,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    registrations.unshift(registration);
    localStorage.setItem('userRegistrations', JSON.stringify(registrations));
    updateHistoryCount();
}

function updateHistoryCount() {
    historyCount.textContent = registrations.length;
}

function updateHistoryStats() {
    totalRegistrations.textContent = registrations.length;
    
    const today = new Date().toDateString();
    const todayCount = registrations.filter(reg => {
        return new Date(reg.timestamp).toDateString() === today;
    }).length;
    todayRegistrations.textContent = todayCount;
    
    if (registrations.length > 0) {
        const avg = Math.round(
            registrations.reduce((sum, reg) => sum + parseInt(reg.age), 0) / registrations.length
        );
        averageAge.textContent = avg;
    } else {
        averageAge.textContent = '0';
    }
}

function renderHistoryList(filter = 'all', search = '') {
    let filtered = registrations;
    
    // Aplicar filtro
    if (filter === 'today') {
        const today = new Date().toDateString();
        filtered = filtered.filter(reg => 
            new Date(reg.timestamp).toDateString() === today
        );
    }
    
    // Aplicar búsqueda
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(reg =>
            reg.username.toLowerCase().includes(searchLower) ||
            reg.email.toLowerCase().includes(searchLower)
        );
    }
    
    // Renderizar lista
    if (filtered.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-user-clock"></i>
                <p>No hay registros ${search ? 'que coincidan con la búsqueda' : 'aún'}</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = filtered.map(reg => `
        <div class="history-item">
            <span data-label="Usuario"><i class="fas fa-user"></i> ${reg.username}</span>
            <span data-label="Email"><i class="fas fa-envelope"></i> ${reg.email}</span>
            <span data-label="Edad"><i class="fas fa-birthday-cake"></i> ${reg.age} años</span>
            <span data-label="Fecha"><i class="far fa-calendar"></i> ${reg.date}</span>
            <span data-label="Acciones">
                <button class="action-btn view-user" data-id="${reg.id}" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete" data-id="${reg.id}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        </div>
    `).join('');
    
    // Agregar eventos a los botones
    document.querySelectorAll('.view-user').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            viewRegistrationDetails(id);
        });
    });
    
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            deleteRegistration(id);
        });
    });
}

function viewRegistrationDetails(id) {
    const reg = registrations.find(r => r.id === id);
    if (!reg) return;
    
    successDetails.innerHTML = `
        <p><i class="fas fa-user"></i> <strong>Usuario:</strong> ${reg.username}</p>
        <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${reg.email}</p>
        <p><i class="fas fa-birthday-cake"></i> <strong>Edad:</strong> ${reg.age} años</p>
        <p><i class="far fa-calendar-check"></i> <strong>Fecha de registro:</strong> ${reg.date}</p>
        <p><i class="fas fa-id-card"></i> <strong>ID de registro:</strong> ${reg.id}</p>
    `;
    
    closeModal(historyModal);
    openModal(successModal);
}

function deleteRegistration(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
    
    registrations = registrations.filter(reg => reg.id !== id);
    localStorage.setItem('userRegistrations', JSON.stringify(registrations));
    updateHistoryCount();
    renderHistoryList();
    updateHistoryStats();
}

function exportToCSV() {
    if (registrations.length === 0) {
        alert('No hay registros para exportar');
        return;
    }
    
    const headers = ['Usuario', 'Email', 'Edad', 'Fecha de Registro'];
    const csvContent = [
        headers.join(','),
        ...registrations.map(reg => [
            `"${reg.username}"`,
            `"${reg.email}"`,
            reg.age,
            `"${reg.date}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearHistory() {
    if (registrations.length === 0) {
        alert('No hay registros para limpiar');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar TODO el historial? Esta acción no se puede deshacer.')) {
        registrations = [];
        localStorage.removeItem('userRegistrations');
        updateHistoryCount();
        renderHistoryList();
        updateHistoryStats();
        alert('Historial limpiado exitosamente');
    }
}

// ============================================
// ENVÍO DEL FORMULARIO
// ============================================

async function submitForm() {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        // Simular petición al servidor
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Guardar registro
        const userData = {
            username: formState.fields.username.value,
            email: formState.fields.email.value,
            age: formState.fields.age.value
        };
        
        saveRegistration(userData);
        
        // Mostrar detalles en modal de éxito
        successDetails.innerHTML = `
            <p><i class="fas fa-user"></i> <strong>Usuario:</strong> ${userData.username}</p>
            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${userData.email}</p>
            <p><i class="fas fa-birthday-cake"></i> <strong>Edad:</strong> ${userData.age} años</p>
            <p><i class="far fa-calendar-check"></i> <strong>Fecha de registro:</strong> ${new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
            <p><i class="fas fa-id-card"></i> <strong>ID de registro:</strong> ${Date.now()}</p>
            <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); color: var(--success-color);">
                <i class="fas fa-paper-plane"></i> Hemos enviado un correo de confirmación a ${userData.email}
            </p>
        `;
        
        // Mostrar modal de éxito
        openModal(successModal);
        
        console.log('✅ Registro exitoso:', userData);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Hubo un error al procesar el registro. Por favor, intenta nuevamente.');
    } finally {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

function resetForm() {
    form.reset();
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('valid', 'error');
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('.requirement').forEach(req => {
        req.classList.remove('met');
    });
    submitBtn.disabled = true;
    progressText.textContent = '0/6 campos completados';
    progressFill.style.width = '0%';
    
    formState = {
        isValid: false,
        fields: {
            username: { valid: false, value: '' },
            email: { valid: false, value: '' },
            password: { valid: false, value: '' },
            confirmPassword: { valid: false, value: '' },
            age: { valid: false, value: '' },
            terms: { valid: false }
        }
    };
    
    username.focus();
}

// ============================================
// CONFIGURACIÓN DE EVENTOS
// ============================================

function setupValidationEvents() {
    const fields = [username, email, password, confirmPassword, age];
    
    fields.forEach(field => {
        field.addEventListener('input', () => {
            validateField(field);
            if (field.id === 'password' && confirmPassword.value) {
                validateField(confirmPassword);
            }
            checkFormValidity();
        });
        
        field.addEventListener('blur', () => validateField(field));
    });
    
    terms.addEventListener('change', () => {
        validateTerms();
        checkFormValidity();
    });
    
    // Prevenir decimales en edad
    age.addEventListener('keydown', (e) => {
        if (e.key === '.' || e.key === ',' || e.key === '-') {
            e.preventDefault();
            showAgeWarning('Solo números enteros positivos (ej: 19, 25, 30)');
        }
    });
    
    age.addEventListener('input', () => {
        if (age.value.includes('.') || age.value.includes(',') || age.value.includes('-')) {
            age.value = age.value.replace(/[.,-]/g, '');
            showAgeWarning('Solo números enteros positivos');
        }
    });
}

function showAgeWarning(message) {
    const ageGroup = age.closest('.form-group');
    const errorMessage = ageGroup.querySelector('.error-message');
    
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    ageGroup.classList.add('error');
    
    setTimeout(() => {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        ageGroup.classList.remove('error');
    }, 2000);
}

function setupFormSubmit() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const validations = [
            validateField(username),
            validateField(email),
            validateField(password),
            validateField(confirmPassword),
            validateField(age),
            validateTerms()
        ];
        
        if (validations.every(v => v)) {
            await submitForm();
        } else {
            const firstError = document.querySelector('.form-group.error input, .form-group.error input[type="checkbox"]');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

function setupHistoryControls() {
    // Búsqueda
    historySearch.addEventListener('input', () => {
        renderHistoryList(filterAll.classList.contains('active') ? 'all' : 'today', historySearch.value);
    });
    
    // Filtros
    filterToday.addEventListener('click', () => {
        filterToday.classList.add('active');
        filterAll.classList.remove('active');
        renderHistoryList('today', historySearch.value);
    });
    
    filterAll.addEventListener('click', () => {
        filterAll.classList.add('active');
        filterToday.classList.remove('active');
        renderHistoryList('all', historySearch.value);
    });
    
    // Exportar y limpiar
    exportHistoryBtn.addEventListener('click', exportToCSV);
    clearHistoryBtn.addEventListener('click', clearHistory);
}

// ============================================
// INICIALIZACIÓN
// ============================================

function initializeApp() {
    initThemeSystem();
    setupValidationEvents();
    setupPasswordToggle();
    setupModals();
    setupFormSubmit();
    setupHistoryControls();
    updateProgress();
    updateHistoryCount();
    
    // Configurar accesibilidad
    submitBtn.setAttribute('aria-label', 'Registrarse - Completa todos los campos');
    
    // Establecer filtro por defecto
    filterAll.classList.add('active');
    
    console.log('🚀 Sistema de registro profesional inicializado');
    console.log(`📊 Registros en historial: ${registrations.length}`);
    console.log('✅ Todas las funcionalidades activadas');
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', initializeApp);

// API para consola (solo desarrollo)
if (typeof window !== 'undefined') {
    window.registrationSystem = {
        getRegistrations: () => registrations,
        clearHistory: () => {
            registrations = [];
            localStorage.removeItem('userRegistrations');
            updateHistoryCount();
            renderHistoryList();
            updateHistoryStats();
        },
        getFormState: () => formState
    };
}