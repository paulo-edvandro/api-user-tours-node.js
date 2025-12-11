// Arquivo: public/js/forgotPassword.js
import axios from 'axios';
import { showAlert } from './alerts';

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      // Assumindo que seu endpoint de API é este
      url: '/api/v1/users/forgotpassword',
      data: { email },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Token de redefinição enviado para o seu e-mail!');
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || err.message);
  }
};
