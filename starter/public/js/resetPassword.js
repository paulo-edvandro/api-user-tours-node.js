import axios from 'axios';
import { showAlert } from './alerts';

export const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetpassword/${token}`,
      data: { password, passwordConfirm },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Senha redefinida com sucesso! Redirecionando para o login...',
      );
      // Redireciona para o login após a redefinição
      window.setTimeout(() => {
        location.assign('/login');
      }, 800);
    }
  } catch (err) {
    showAlert(
      'error',
      err.response?.data?.message || 'Ocorreu um erro ao redefinir a senha.',
    );
  }
};

