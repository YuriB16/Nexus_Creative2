/**
 * Lógica de Carregamento e Exibição do Feed de Propagandas (principal.js)
 * Versão Completa e Atualizada com todas as categorias.
 */

document.addEventListener('DOMContentLoaded', () => {
    const feed = document.getElementById('feed');
    const categoriasList = document.querySelectorAll(".categorias li");
    
    // ===========================================
    // 1. DADOS MOCK (Exemplo e Fallback)
    // As chaves 'category' correspondem aos data-cat no HTML
    // ===========================================
    const mockAds = [
        { id: 'm1', title: "Coca-Cola", logoSrc: "Logo/Cocacola.png", imgSrc: "Logo/Cocacolaimg.png", description: "Refresque-se com o sabor inconfundível!", category: "alimentacao", url: "#" },
        { id: 'm2', title: "AirMax Pro", logoSrc: "Logo/Nike.png", imgSrc: "Logo/Nikeimg.png", description: "Estilo e tecnologia para seus pés.", category: "moda", url: "#" },
        { id: 'm3', title: "Galaxy S25 Ultra", logoSrc: "Logo/Samsung.png", imgSrc: "Logo/SamsungBanner.png", description: "Galaxy S25 Ultra — o futuro em suas mãos.", category: "tecnologia", url: "#" },
        { id: 'm4', title: "Red Bull", logoSrc: "Logo/redbull.png", imgSrc: "Logo/redbullBanner.png", description: "Red Bull te dá asas e energia extra!", category: "bebidas", url: "#" },
        { id: 'm5', title: "BMW i8 Sport", logoSrc: "Logo/BMW.png", imgSrc: "Logo/BMWBanner.png", description: "Potência híbrida e design futurista.", category: "automotivo", url: "#" }
    ];

    // ===========================================
    // 2. FUNÇÕES DE RENDERIZAÇÃO E CARREGAMENTO
    // ===========================================

  // principal.js - Função createAdCard CORRIGIDA
function createAdCard(adData) {
    // Em vez de criar um <article>, criamos um <a> que será o cartão clicável
    const linkArticle = document.createElement('a');
    linkArticle.href = adData.url; // Define o link de destino
    linkArticle.target = "_blank"; // Abre em uma nova aba
    linkArticle.className = 'card-propaganda-link'; // Nova classe para estilização do link
    
    // Adicionamos a classe original de estilo ao link para manter a aparência
    linkArticle.classList.add('card-propaganda'); 
    
    // Usa a chave de categoria (ex: "automotivo") para o filtro
    linkArticle.setAttribute('data-categoria', adData.category); 

    linkArticle.innerHTML = `
        <div class="card-conteudo">
            <div class="card-header">
                <img src="${adData.logoSrc || adData.imgSrc}" alt="Logo ${adData.title}">
                <h3>${adData.title}</h3>
            </div>
            <img class="card-img" src="${adData.imgSrc}" alt="Propaganda ${adData.title}">
            <p class="descricao">${adData.description}</p>
        </div>
        `;
    
    // Criamos o menu de ações separadamente, fora do link principal
    const menuActions = document.createElement('menu');
    menuActions.className = 'acoes';
    menuActions.innerHTML = `
        <button class="btn-curtir">❤️ Curtir</button>
        <button class="btn-comentar">💬 Comentar</button>
        `;
    
    // O cartão final será um contêiner que agrupa o link e o menu de ações
    const finalCardContainer = document.createElement('div');
    finalCardContainer.className = 'card-propaganda-wrapper'; // Novo wrapper
    finalCardContainer.appendChild(linkArticle);
    finalCardContainer.appendChild(menuActions);

    // Retornamos o container para o 'loadAndRenderAds'
    return finalCardContainer;
}
    // principal.js - Função loadAndRenderAds CORRIGIDA
function loadAndRenderAds() {
    const savedAdsJSON = localStorage.getItem('ads');
    let adsToDisplay = [];

    if (savedAdsJSON) {
        try {
            const customAds = JSON.parse(savedAdsJSON);
            adsToDisplay.push(...customAds); 
        } catch (e) {
            console.error("Erro ao fazer parse dos dados de ads no localStorage:", e);
        }
    } 
    
    adsToDisplay.push(...mockAds);

    feed.innerHTML = ''; 

    // 3. Renderiza todos os anúncios (salvos + mock)
    adsToDisplay.forEach(ad => {
        const card = createAdCard(ad);
        feed.appendChild(card);
    });

    // Reanexa os event listeners (Curtir/Comentar)
    attachActionListeners();
    
    // Guarda a lista de cards (usando a nova classe do link para o filtro)
    window.allAdCards = document.querySelectorAll(".card-propaganda-link"); 
    
    // Garante que o filtro padrão 'Todas' funcione no carregamento
    filterAds('todas'); 
}
    // ===========================================
    // 3. LÓGICA DE FILTRO
    // ===========================================
    
   // principal.js - Função filterAds CORRIGIDA
function filterAds(categoriaSelecionada) {
    let algumVisivel = false;
    // Seleciona os links (que têm data-categoria) ou, fallback, o wrapper pai
    const cards = window.allAdCards || document.querySelectorAll(".card-propaganda-link");

    cards.forEach(linkCard => {
        const categoriaCard = linkCard.getAttribute("data-categoria");
        // O display deve ser aplicado no PARENT (o wrapper) para ocultar o link + menu de ações
        const wrapper = linkCard.closest('.card-propaganda-wrapper'); 

        if (categoriaSelecionada === "todas" || categoriaCard === categoriaSelecionada) {
            wrapper.style.display = "block";
            wrapper.style.animation = "fadeUp .45s ease-out";
            algumVisivel = true;
        } else {
            wrapper.style.display = "none";
        }
    });

    const mensagemExistente = document.querySelector(".sem-resultados");
    if (mensagemExistente) mensagemExistente.remove();

    if (!algumVisivel) {
        const msg = document.createElement("div");
        msg.classList.add("sem-resultados");
        msg.textContent = `Nenhuma propaganda encontrada na categoria "${categoriaSelecionada.charAt(0).toUpperCase() + categoriaSelecionada.slice(1)}".`;
        feed.appendChild(msg);
    }
}

    // Listener de Categoria
    categoriasList.forEach(cat => {
        cat.addEventListener("click", () => {
            categoriasList.forEach(c => c.classList.remove("ativo"));
            cat.classList.add("ativo");
            const categoriaSelecionada = cat.getAttribute("data-cat");
            filterAds(categoriaSelecionada);
        });
    });
    
    // ===========================================
    // 4. ATTACH LISTENERS (Curtir/Comentar)
    // ===========================================
// ... (código anterior) ...

    // ===========================================
    // 4. ATTACH LISTENERS (Curtir/Comentar)
    // ===========================================

    // Função para anexar os ouvintes de evento
    function attachActionListeners() {
        // Seleciona todos os botões "Curtir" e remove/adiciona o listener para evitar duplicidade
        document.querySelectorAll(".acoes .btn-curtir").forEach(btn => {
            // Remove o listener existente (segurança contra duplicação ao recarregar)
            btn.removeEventListener('click', handleLikeClick); 
            // Adiciona o novo listener
            btn.addEventListener("click", handleLikeClick);
        });

        // Seleciona todos os botões "Comentar"
        document.querySelectorAll(".acoes .btn-comentar").forEach(btn => {
            btn.removeEventListener('click', handleCommentClick);
            btn.addEventListener("click", handleCommentClick);
        });
    }

    // Lógica do Botão Curtir
    function handleLikeClick(event) {
        const btn = event.currentTarget;
        const curtidoTexto = "❤️ Curtido";
        const curtirTexto = "❤️ Curtir";
        
        // Verifica se o botão tem a classe 'curtido'
        if (!btn.classList.contains("curtido")) {
            // Se não estiver curtido, curtir
            btn.classList.add("curtido");
            btn.innerHTML = curtidoTexto;
            // Opcional: Aqui você faria uma chamada a um servidor para registrar o curtir
            console.log("Propaganda Curtida!");
        } else {
            // Se já estiver curtido, descurtir
            btn.classList.remove("curtido");
            btn.innerHTML = curtirTexto;
            // Opcional: Aqui você faria uma chamada a um servidor para remover o curtir
            console.log("Propaganda Descurtida!");
        }
    }

    // Lógica do Botão Comentar
    function handleCommentClick() {
        // Usa a função prompt() para simular a caixa de diálogo de comentário
        const comentario = prompt("Digite seu comentário:"); 
        
        if (comentario && comentario.trim() !== "") {
            // Se o usuário digitou algo
            alert(`Comentário enviado: "${comentario.trim()}" (Simulação)\n\nEm um ambiente real, este comentário seria enviado ao servidor.`);
            // Opcional: Aqui você faria uma chamada a um servidor para salvar o comentário
            console.log(`Novo comentário: ${comentario.trim()}`);
        } else if (comentario !== null) {
            // Se o usuário clicou em OK mas deixou o campo vazio
            alert("Comentário não pode ser vazio.");
        }
        // Se o usuário clicou em Cancelar (comentario === null), nada acontece.
    }

    // Função de Inicialização (garantir que carrega os anúncios e anexa os listeners)
    loadAndRenderAds(); 
});
