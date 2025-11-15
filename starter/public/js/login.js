const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: { email, password },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      // location.assign('/');
      alert('sucesso , logado');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(`❌ Erro no login:\n${err.response?.data?.message || err.message}`);
  }
};

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
