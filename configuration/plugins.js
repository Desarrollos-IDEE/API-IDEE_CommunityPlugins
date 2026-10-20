const search = document.getElementById("search");
const matchList = document.getElementById("match-list");
const matchObsolete = document.getElementById("match-list-obsolete");

const searchStates = async searchText =>{
  const res = await fetch("../data/plugins.json");
  const states = await res.json();

  //Get matches to current text input
  let matches = states.filter(state =>{

    const regex = new RegExp(removeDiacritics(`${searchText}`),'gi');
    return regex.test(removeDiacritics(state.name)) || regex.test(removeDiacritics(state.description))
   
  })

  if (searchText.length ===0){
    searchStates("a");
  }
  if (matches.length ===0){
    matches = [];
    matchList.innerHTML='';
  }

  outputHTMLBootstrap(matches);

}

const outputHTMLBootstrap = matches =>{
  if (matches.length > 0){
    let html = '';
    let htmlObsolete = '';

    matches.forEach(match => {
      const pluginName = match.name;
      const pluginDescription = match.description;
      const pluginVersion = match.version;

      const plugin = `
      <div class="col" style="padding-bottom:15px;">
        <div class="card shadow-sm h-100" style="background-color: rgba(240, 128, 128,0.15);">
          <h4 class="text-primary text-center pt-2">${match.plugin}</h4>
          <div class="card-body">
            <h5 class="card-title">${pluginName}</h5>
            <p class="card-text" style="min-height:100px;">${pluginDescription}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <a href="${match.url_es}" class="btn btn-sm btn-outline-secondary" role="button" target="_blank" data-bs-toggle="button"><img style="width:24px;" src="${IDEE_STATIC_RESOURCES}/imagenes/logos/spain-flag.svg"></a>
                <a href="${match.url_en}" class="btn btn-sm btn-outline-secondary" role="button" target="_blank" data-bs-toggle="button"><img style="width:24px;" src="${IDEE_STATIC_RESOURCES}/imagenes/logos/uk-flag.svg"></a>
                <a href="${match.url_git}" class="btn btn-sm btn-outline-secondary" role="button" target="_blank" data-bs-toggle="button"><img style="width:24px;" src="${IDEE_STATIC_RESOURCES}/imagenes/logos/logo-github.svg"></a>
              </div>
              <small class="text-muted">${pluginVersion}</small>
            </div>
          </div>
        </div>
      </div>
      `;

      if (match.obsolete){
        htmlObsolete += plugin;
      }else{
        html += plugin;
      }
    });
    matchList.innerHTML = html;
    
    // Mostrar mensaje si no hay plugins obsoletos
    if (htmlObsolete === '') {
      matchObsolete.innerHTML = '<div class="col-12 text-center text-muted py-5"><p>No existen actualmente plugins obsoletos.</p></div>';
    } else {
      matchObsolete.innerHTML = htmlObsolete;
    }
  }
}

search.addEventListener("input",()=>searchStates(search.value));


searchStates("a");