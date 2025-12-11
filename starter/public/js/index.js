import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { displayMap } from './leafletMap';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { resendEmail } from './resendEmail';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';

const bookBtn = document.getElementById('book-tour');
const mapElement = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const signupForm = document.querySelector('.form--signup');
const resendEmailForm = document.querySelector('.form--resend-email');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const resetPasswordForm = document.querySelector('.form--reset-password');

if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}
const userPasswordForm = document.querySelector('.form-user-password');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form--login');

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

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-salvar-updateme').textContent =
      'Carregando...';

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    await updateSettings(form, 'data');
    document.querySelector('.btn-salvar-updateme').textContent = 'Pronto!';
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Carregando...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.querySelector('.btn--save-password').textContent = 'Pronto!';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById(
      'signup-password-confirm',
    ).value;
    const name = document.getElementById('signup-name')?.value || '';
    const role = document.getElementById('signup-role')?.value || undefined;

    const photo = document.getElementById('signup-photo')?.files[0];

    // FormData para suportar imagem
    const form = new FormData();
    form.append('username', username);
    form.append('email', email);
    form.append('password', password);
    form.append('passwordConfirm', passwordConfirm);

    if (name) form.append('name', name);
    if (role) form.append('role', role);
    if (photo) form.append('photo', photo);

    await signup(form);
  });
}

if (resendEmailForm) {
  resendEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('resend-email').value;

    document.querySelector('.btn--resend-email').textContent = 'Enviando...';

    await resendEmail(email); // função que vamos criar

    document.querySelector('.btn--resend-email').textContent = 'Enviado!';
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    document.querySelector('.btn--forgot-password').textContent = 'Enviando...';

    await forgotPassword(email);

    document.querySelector('.btn--forgot-password').textContent =
      'Enviar link de redefinição';
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = document.getElementById('token').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    document.querySelector('.btn--reset-password').textContent =
      'Redefinindo...';

    await resetPassword(password, passwordConfirm, token);

    document.querySelector('.btn--reset-password').textContent =
      'Redefinir Senha';
  });
}
