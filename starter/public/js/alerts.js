//type deve ser success ou error
//ESTE ARQUIVO SERVE PARA ADICIONAR ELEMENTOS HTML (ALERTA) DINAMICAMENTE NO INICIO DO BODY COM INSERTADJACENTHTML E COM UMA MSG PERSONALIZADA;
//TAMBEM CRIAMOS FUNÇÃO PARA ESCONDER ALERTAS PARA QUE UM ALERTA NÃO FIQUE JUNTO DE OUTRO, MAS SEJA APAGADO ANTES; TBM DEFINIMOS A DURAÇÃO PADRÃO DE 5 SEGUNDOS PRA UM ALERTA
export const hideAlert = ()=>{

const el = document.querySelector(".alert");
if(el) el.parentElement.removeChild(el);

}
export const showAlert = (type, msg) => { 

hideAlert();

const markup = `<div class="alert alert--${type}">${msg}</div>`;
document.querySelector(`body`).insertAdjacentHTML('afterbegin', markup);
window.setTimeout(hideAlert, 5000);


}