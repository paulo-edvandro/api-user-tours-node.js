import axios from 'axios';
import { showAlert } from './alerts';
export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Registrado com sucesso!');

      window.setTimeout(() => {
        location.assign(`/check-email?email=${res.data.email}`);
      }, 800);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || err.message);
  }
};


