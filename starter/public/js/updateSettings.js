import axios from 'axios';
import { showAlert } from './alerts';
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatepassword'
        : '/api/v1/users/updateme';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      //   location.assign('/');
      showAlert('success', `${type.toUpperCase()} atualizado com sucesso!`);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || err.message);
  }
};
