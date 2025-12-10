/**
 * Lógica do Painel de Propagandas (dashboard.js) CORRIGIDO
 * * Implementa persistência básica via localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const adList = document.getElementById('adList');
    const addAdButton = document.querySelector('.card-upload button');
    
    // Elementos do Formulário
    const adTitleInput = document.getElementById('adTitle');
    const adUrlInput = document.getElementById('adUrl');
    const adCategorySelect = document.getElementById('adCategory');
    const adImageInput = document.getElementById('adImage');
    const adProfileImageInput = document.getElementById('adProfileImage'); 
    const adTextInput = document.getElementById('adText');
    const formTitle = document.querySelector('.card-upload h2');

    // Estado de Edição
    let isEditing = false;
    let currentEditId = null;

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
    
    // Função para limpar e reverter o formulário
    function resetForm(message = '✨ Criar Novo Anúncio') {
        adTitleInput.value = '';
        adUrlInput.value = '';
        adCategorySelect.value = 'padrao';
        adImageInput.value = '';
        adProfileImageInput.value = ''; 
        adTextInput.value = '';
        
        isEditing = false;
        currentEditId = null;
        formTitle.textContent = message;
        addAdButton.textContent = 'Adicionar Propaganda';
    }


    // 3. Cria o elemento HTML do card (Sem Alterações)
    function createAdCardHTML(adData) {
        const adCard = document.createElement('div');
        adCard.className = 'card-ad';
        adCard.setAttribute('data-id', adData.id);

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

    // 4. Anexa os Event Listeners (COM LÓGICA DE EDIÇÃO)
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
                // Verifica se deve mostrar o estado vazio
                if (adList.children.length === 0) {
                     adList.innerHTML = '<div class="vazio">Nenhuma propaganda cadastrada. Adicione a primeira acima!</div>';
                }
                resetForm(); // Limpa o formulário caso estivesse em edição
            }
        });

        editBtn.addEventListener('click', () => {
             openEditForm(adId); // Chama a nova função
        });
    }

    // 5. Renderiza os anúncios SALVOS ao carregar a página (Sem Alterações)
    function renderSavedAds() {
        const ads = getAds();
        const exampleCard = adList.querySelector('.card-ad');
        if (exampleCard && !exampleCard.getAttribute('data-id')) {
            exampleCard.remove();
        }
        
        adList.innerHTML = ''; // Limpa a lista antes de renderizar
        
        if (ads.length > 0) {
            ads.forEach(ad => {
                const adCard = createAdCardHTML(ad);
                adList.appendChild(adCard);
            });
        } else {
            adList.innerHTML = '<div class="vazio">Nenhuma propaganda cadastrada. Adicione a primeira acima!</div>';
        }
    }
    
    // 7. Ação de Abrir Formulário para Edição
    function openEditForm(adId) {
        const ads = getAds();
        const adToEdit = ads.find(ad => ad.id === adId);
        
        if (!adToEdit) {
            alert("Anúncio não encontrado para edição.");
            return;
        }

        // Preenche o formulário com os dados existentes
        adTitleInput.value = adToEdit.title;
        adUrlInput.value = adToEdit.url;
        adCategorySelect.value = adToEdit.category;
        adTextInput.value = adToEdit.description;

        // Limpa os campos de arquivo, pois as imagens existentes são Data URLs
        // O usuário precisará reenviar APENAS se quiser mudar a imagem.
        adImageInput.value = ''; 
        adProfileImageInput.value = '';

        // Atualiza o estado de edição
        isEditing = true;
        currentEditId = adId;
        formTitle.textContent = '✏️ Editando Anúncio Existente';
        addAdButton.textContent = 'Salvar Alterações';
        
        // Rola para o topo para mostrar o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 8. Ação de Salvar Edição
    async function updateAd() {
        const title = adTitleInput.value.trim();
        const url = adUrlInput.value.trim();
        const category = adCategorySelect.value;
        const description = adTextInput.value.trim();
        
        const imageFile = adImageInput.files[0];
        const profileImageFile = adProfileImageInput.files[0]; 

        if (!title || !url || category === 'padrao' || !description) {
            alert("Por favor, preencha Título, Link, Categoria e Descrição.");
            return;
        }
        
        let ads = getAds();
        let adIndex = ads.findIndex(ad => ad.id === currentEditId);
        
        if (adIndex === -1) {
             alert("Erro: Anúncio de edição não encontrado.");
             resetForm();
             return;
        }
        
        const existingAd = ads[adIndex];
        let imageUrl = existingAd.imgSrc;
        let profileImageUrl = existingAd.logoSrc;

        try {
            // Se um novo arquivo de imagem principal for enviado, lê o Data URL
            if (imageFile) {
                imageUrl = await readFileAsDataURL(imageFile);
            }
            
            // Se um novo arquivo de logo for enviado, lê o Data URL
            if (profileImageFile) {
                profileImageUrl = await readFileAsDataURL(profileImageFile);
            }

            // Fallback: se a imagem principal for removida/não existir, alertar
            if (!imageUrl) {
                 alert("A Imagem Principal é obrigatória. Por favor, selecione-a novamente.");
                 return;
            }
            
            // Cria o objeto atualizado
            const updatedAdData = {
                id: currentEditId,
                title: title,
                url: url,
                category: category,
                description: description,
                imgSrc: imageUrl,
                logoSrc: profileImageUrl || imageUrl // Atualiza o logo
            };
            
            // Substitui o anúncio antigo no array
            ads[adIndex] = updatedAdData;
            saveAds(ads);
            
            alert(`Anúncio "${title}" atualizado com sucesso!`);
            
            // Limpa o formulário e re-renderiza a lista
            resetForm();
            renderSavedAds();

        } catch (error) {
            console.error("Erro ao processar imagem na edição:", error);
            alert("Ocorreu um erro ao carregar as imagens na edição. Tente novamente.");
        }
    }
    

    // 6. Função original: Adiciona a propaganda (apenas para o modo "Adicionar")
    async function addNewAd() {
        const title = adTitleInput.value.trim();
        const url = adUrlInput.value.trim();
        const category = adCategorySelect.value;
        const imageInput = adImageInput;
        const profileImageInput = adProfileImageInput; 
        const description = adTextInput.value.trim();
        
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
            resetForm();
            
            alert(`Anúncio "${title}" adicionado e SALVO!`);
            
            // Re-renderiza para garantir a remoção do estado vazio
            renderSavedAds();
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            alert("Ocorreu um erro ao carregar as imagens. Tente novamente.");
        }
    }


    // 9. Lógica do botão principal (Adicionar/Salvar)
    addAdButton.addEventListener('click', (e) => {
        e.preventDefault(); // Boa prática
        if (isEditing) {
            updateAd(); // Chama a função de edição/salvamento
        } else {
            addNewAd(); // Chama a função de adicionar
        }
    });

    // Renderiza a lista de anúncios salvos quando a página carrega
    renderSavedAds();
});
