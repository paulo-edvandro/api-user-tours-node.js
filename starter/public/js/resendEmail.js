import axios from 'axios';
import { showAlert } from './alerts';

export const resendEmail = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/resend-email-confirmation',
      data: { email },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Email reenviado com sucesso!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
