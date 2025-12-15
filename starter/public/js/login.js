import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      // location.assign('/');

      showAlert('success', 'Logado com sucesso!');
      window.setTimeout(() => {
        location.assign('/');
      }, 800);
    }
  } catch (err) {
    console.error('Erro no logout:', err.response || err);
    showAlert('error', err.response?.data?.message || err.message);
  }
};

export const logout = async () => {
  try {
    console.log('🌀 Logout chamado'); // log de chamada

    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    console.log('Resposta do logout:', res.data); // veja o que chega

    if (res.data.status === 'success') {
      // location.reload(true);
      location.assign('/');
    }
  } catch (err) {
    console.error('Erro no logout:', err.response || err); // log completo

    showAlert('error', 'Error logging out! Try again.');
  }
};
