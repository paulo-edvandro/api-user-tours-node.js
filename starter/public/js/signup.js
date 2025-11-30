import axios from 'axios';
import { showAlert } from './alerts';
export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/signup',
      data,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Registrado com sucesso!');
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || err.message);
  }
};
