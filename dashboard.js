/**
 * Lógica do Painel de Propagandas (dashboard.js) CORRIGIDO
 * * Implementa persistência básica via localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const adList = document.getElementById('adList');
    const addAdButton = document.querySelector('.card-upload button'); // Seleciona o botão de adicionar

    // 1. Carrega todas as propagandas salvas (ou um array vazio se não houver)
    function getAds() {
        const savedAds = localStorage.getItem('ads');
        return savedAds ? JSON.parse(savedAds) : [];
    }

    // 2. Salva a lista de propagandas no localStorage
    function saveAds(adsArray) {
        localStorage.setItem('ads', JSON.stringify(adsArray));
    }

    // Função auxiliar para ler um arquivo de imagem como Data URL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // 3. Cria o elemento HTML do card
    function createAdCardHTML(adData) {
        const adCard = document.createElement('div');
        adCard.className = 'card-ad';
        adCard.setAttribute('data-id', adData.id);

        // Certifique-se de que a imagem de exibição seja a 'imgSrc' principal
        const imgSrc = adData.imgSrc || 'Logo/placeholder.png';
        const urlShort = adData.url.length > 30 ? adData.url.substring(0, 30) + '...' : adData.url;

        adCard.innerHTML = `
            <img src="${imgSrc}" alt="${adData.title}">
            <div class="meta">
                <h3>${adData.title}</h3>
                <p class="ad-link">Link: <a href="${adData.url}" target="_blank">${urlShort}</a></p>
                <p class="ad-category">Categoria: ${adData.category.charAt(0).toUpperCase() + adData.category.slice(1)}</p>
                <p class="ad-description">${adData.description}</p>
            </div>
            <div class="actions">
                <button class="btn-editar">✏️ Editar</button>
                <button class="btn-excluir">🗑️ Excluir</button>
            </div>
        `;
        
        attachAdEventListeners(adCard);
        return adCard;
    }

    // 4. Adiciona os event listeners aos botões
    function attachAdEventListeners(adCard) {
        const deleteBtn = adCard.querySelector('.btn-excluir');
        const editBtn = adCard.querySelector('.btn-editar');
        const adId = adCard.getAttribute('data-id');

        deleteBtn.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja EXCLUIR este anúncio?")) {
                if (adId) {
                    let ads = getAds();
                    ads = ads.filter(ad => ad.id !== adId);
                    saveAds(ads);
                }
                adCard.remove();
                alert("Anúncio excluído!");
            }
        });

        editBtn.addEventListener('click', () => {
             alert(`Simulação: Edição do anúncio ID ${adId}. Implemente a lógica real de formulário aqui.`);
        });
    }

    // 5. Renderiza os anúncios SALVOS ao carregar a página
    function renderSavedAds() {
        const ads = getAds();
        // Remove o card de exemplo que está no HTML
        const exampleCard = adList.querySelector('.card-ad');
        if (exampleCard && !exampleCard.getAttribute('data-id')) {
            exampleCard.remove();
        }

        if (ads.length > 0) {
            ads.forEach(ad => {
                const adCard = createAdCardHTML(ad);
                adList.appendChild(adCard);
            });
        } else {
            // Adiciona um estado vazio
            adList.innerHTML = '<div class="vazio">Nenhuma propaganda cadastrada. Adicione a primeira acima!</div>';
        }
    }

    // 6. Função principal: Adiciona a propaganda
    async function addAd() {
        // ... Lógica de validação e leitura de inputs ...
        const title = document.getElementById('adTitle').value.trim();
        const url = document.getElementById('adUrl').value.trim();
        const category = document.getElementById('adCategory').value;
        const imageInput = document.getElementById('adImage');
        const profileImageInput = document.getElementById('adProfileImage'); 
        const description = document.getElementById('adText').value.trim();
        
        const imageFile = imageInput.files[0];
        const profileImageFile = profileImageInput.files[0]; 

        if (!title || !url || category === 'padrao' || !description || !imageFile) {
            alert("Por favor, preencha todos os campos obrigatórios e selecione a Imagem Principal.");
            return;
        }

        try {
            const imageUrl = await readFileAsDataURL(imageFile);
            const profileImageUrl = await readFileAsDataURL(profileImageFile);

            const logoToUse = profileImageUrl || imageUrl; 

            const newAdData = {
                id: Date.now().toString(),
                title: title,
                url: url,
                category: category,
                description: description,
                imgSrc: imageUrl,
                logoSrc: logoToUse 
            };
            
            const ads = getAds();
            ads.push(newAdData);
            saveAds(ads);

            // Remove o estado vazio se ele existir
            const emptyState = adList.querySelector('.vazio');
            if (emptyState) emptyState.remove();

            // Renderiza na interface
            const newAdCard = createAdCardHTML(newAdData);
            adList.appendChild(newAdCard);

            // Limpa formulário
            document.getElementById('adTitle').value = '';
            document.getElementById('adUrl').value = '';
            document.getElementById('adCategory').value = 'outros'; // Default
            imageInput.value = '';
            profileImageInput.value = ''; 
            document.getElementById('adText').value = '';
            
            alert(`Anúncio "${title}" adicionado e SALVO!`);
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            alert("Ocorreu um erro ao carregar as imagens. Tente novamente.");
        }
    }

    // ANTES DE RENDERIZAR TUDO:
    // 1. Remove a chamada `onclick` do HTML (boa prática)
    // 2. Anexa o EventListener ao botão 'Adicionar'
    addAdButton.addEventListener('click', addAd);

    // Renderiza a lista de anúncios salvos quando a página carrega
    renderSavedAds();
    
    // A função 'addAd' não precisa mais estar no escopo 'window'
    // A função de exemplo no seu HTML (que não faz nada) deve ser removida
});