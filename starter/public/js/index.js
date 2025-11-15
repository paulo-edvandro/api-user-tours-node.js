import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './leafletMap';

const mapElement = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout')
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  } else {
    console.log('⚠️ Formulário não encontrado.');
  }
});

if(logOutBtn) logOutBtn.addEventListener('click', logout);