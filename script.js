document.addEventListener('DOMContentLoaded', () => {
    /**
     * Gerencia a abertura e fechamento de componentes overlay (Menu e Filtros)
     */
    const setupToggle = (triggerId, closeId, targetId) => {
        const trigger = document.getElementById(triggerId);
        const close = document.getElementById(closeId);
        const target = document.getElementById(targetId);

        if (trigger && target) {
            trigger.addEventListener('click', () => {
                target.classList.add('open');
                target.setAttribute('aria-hidden', 'false');
            });
        }
        if (close && target) {
            close.addEventListener('click', () => {
                target.classList.remove('open');
                target.setAttribute('aria-hidden', 'true');
            });
        }
    };

    setupToggle('menuToggle', 'menuClose', 'sideMenu');
    setupToggle('filtroToggle', 'filtroClose', 'filterPanel');

    initPortalMenu();
    initPainelMenu();
    initPainelFilters();
});

const PORTAL_MENU_ACTIVE = new Set(['index.html', 'dados-estatisticas.html']);

function isPortalMenuLinkActive(href) {
    if (!href || href === '#') {
        return false;
    }

    const file = href.split('/').pop() || '';
    return PORTAL_MENU_ACTIVE.has(file);
}

function initPortalMenu() {
    const portalMenu = document.querySelector('.side-menu:not(.side-menu--painel)');
    if (!portalMenu) {
        return;
    }

    portalMenu.querySelectorAll('.menu-item, .menu-logout').forEach((link) => {
        if (isPortalMenuLinkActive(link.getAttribute('href'))) {
            return;
        }

        disableMenuLink(link);
    });
}

const PAINEL_MENU_ACTIVE = new Set(['dados-estatisticas.html']);

function isPainelMenuLinkActive(href) {
    if (!href || href === '#') {
        return false;
    }

    const file = href.split('/').pop() || '';
    return PAINEL_MENU_ACTIVE.has(file);
}

function initPainelMenu() {
    const painelMenu = document.querySelector('.side-menu--painel');
    if (!painelMenu) {
        return;
    }

    painelMenu.querySelectorAll('.menu-item').forEach((link) => {
        if (isPainelMenuLinkActive(link.getAttribute('href'))) {
            return;
        }

        disableMenuLink(link);
    });
}

function disableMenuLink(link) {
    link.classList.add('menu-item--disabled');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');

    link.addEventListener('click', (event) => {
        event.preventDefault();
    });
}

const PAINEL_ROUTES = {
    'grande-area': 'painel_grandeArea.html',
    'instituicao': 'painel_instituicao.html',
    'regiao': 'painel_regiao.html',
    'sexo-idade': 'painel_genero.html',
};

const DEFAULT_DIMENSAO = 'grande-area';

const DIMENSOES_ATIVAS = new Set([
    'grande-area',
    'instituicao',
    'regiao',
    'sexo-idade',
]);

const DIMENSOES_BLOQUEADAS = new Set([
    'area',
    'pais',
    'estado',
    'cidade',
    'enquadramento',
    'setor',
]);

function disableFilterOption(input) {
    if (!input) return;

    input.disabled = true;
    input.checked = false;

    const option = input.closest('.filter-option');
    option?.classList.add('filter-option--disabled');
    updateFilterOptionVisual(option, false);
}

function updateFilterOptionVisual(option, checked) {
    if (!option) return;

    option.classList.toggle('filter-option--selected', checked);

    const radio = option.querySelector('.radio-custom');
    const checkbox = option.querySelector('.checkbox-custom');

    if (radio) {
        radio.classList.toggle('radio-custom--checked', checked);
    }
    if (checkbox) {
        checkbox.classList.toggle('checkbox-custom--checked', checked);
    }
}

function getCurrentPainelDimensao() {
    const page = document.body.dataset.painelPage;
    if (page && PAINEL_ROUTES[page]) {
        return page;
    }

    const file = window.location.pathname.split('/').pop() || '';
    if (file.includes('instituicao')) {
        return 'instituicao';
    }
    if (file.includes('genero')) {
        return 'sexo-idade';
    }
    if (file.includes('regiao')) {
        return 'regiao';
    }

    return DEFAULT_DIMENSAO;
}

function getSelectedDimensao() {
    const checked = document.querySelector('input[name="dimensao"]:checked');
    return checked ? checked.value : null;
}

function setDimensaoSelection(value) {
    document.querySelectorAll('input[name="dimensao"]').forEach((input) => {
        if (DIMENSOES_BLOQUEADAS.has(input.value)) {
            input.checked = false;
            updateFilterOptionVisual(input.closest('.filter-option'), false);
            return;
        }

        const isChecked = Boolean(value) && input.value === value;
        input.checked = isChecked;
        updateFilterOptionVisual(input.closest('.filter-option'), isChecked);
    });
}

function resolveTargetPage(dimensao) {
    if (DIMENSOES_ATIVAS.has(dimensao) && PAINEL_ROUTES[dimensao]) {
        return PAINEL_ROUTES[dimensao];
    }

    return PAINEL_ROUTES[DEFAULT_DIMENSAO];
}

function closeFilterPanel(filterPanel) {
    if (!filterPanel) return;
    filterPanel.classList.remove('open');
    filterPanel.setAttribute('aria-hidden', 'true');
}

function initPainelFilters() {
    const filterPanel = document.getElementById('filterPanel');
    if (!filterPanel) return;

    const formacaoInput = document.querySelector('input[name="lattes"][value="formacao"]');
    const atuacaoInput = document.querySelector('input[name="lattes"][value="atuacao"]');
    const dimensaoInputs = document.querySelectorAll('input[name="dimensao"]');
    const graficoInputs = document.querySelectorAll('input[name="grafico"]');
    const applyBtn = document.querySelector('.button--apply');
    const clearBtn = document.querySelector('.button--clear');

    setDimensaoSelection(getCurrentPainelDimensao());

    if (formacaoInput) {
        formacaoInput.checked = true;
        updateFilterOptionVisual(formacaoInput.closest('.filter-option'), true);
    }

    if (atuacaoInput) {
        disableFilterOption(atuacaoInput);
    }

    if (formacaoInput) {
        formacaoInput.addEventListener('change', () => {
            formacaoInput.checked = true;
            updateFilterOptionVisual(formacaoInput.closest('.filter-option'), true);
            if (atuacaoInput) {
                atuacaoInput.checked = false;
                updateFilterOptionVisual(atuacaoInput.closest('.filter-option'), false);
            }
        });
    }

    graficoInputs.forEach((input) => {
        disableFilterOption(input);
    });

    dimensaoInputs.forEach((input) => {
        const option = input.closest('.filter-option');

        if (DIMENSOES_BLOQUEADAS.has(input.value)) {
            disableFilterOption(input);
            return;
        }

        input.addEventListener('change', () => {
            if (input.checked) {
                dimensaoInputs.forEach((other) => {
                    if (other === input || other.disabled) return;
                    other.checked = false;
                    updateFilterOptionVisual(other.closest('.filter-option'), false);
                });
            }

            updateFilterOptionVisual(option, input.checked);
        });
    });

    if (clearBtn) {
        clearBtn.classList.add('button--inactive');
        clearBtn.setAttribute('aria-disabled', 'true');
        clearBtn.addEventListener('click', (event) => {
            event.preventDefault();
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            let dimensao = getSelectedDimensao();

            if (!dimensao) {
                dimensao = DEFAULT_DIMENSAO;
                setDimensaoSelection(DEFAULT_DIMENSAO);
            }

            const targetPage = resolveTargetPage(dimensao);
            const currentPage = window.location.pathname.split('/').pop() || '';

            closeFilterPanel(filterPanel);

            if (currentPage !== targetPage) {
                window.location.href = targetPage;
            }
        });
    }
}
