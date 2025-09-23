### API de Turismo: User/Tours

Este é um projeto de back-end para um site completo de turismo, com diferentes perfis de usuários e tours. A API é responsável por gerenciar dados de tours e usuários, garantindo um sistema robusto e escalável.

O projeto foi desenvolvido como parte de um curso online na **Udemy**. **O front-end em HTML, CSS e JavaScript foi fornecido como material didático do curso**, e meu trabalho se concentrou exclusivamente no desenvolvimento da API e do back-end.

## Preview

<img width="1363" height="722" alt="Captura de tela 2025-09-20 014816" src="https://github.com/user-attachments/assets/7ed7386d-e77c-480a-bb1a-5cd3f12c7c7e" />

---

### Status do Projeto

**Em desenvolvimento.** As funcionalidades de back-end estão em fase de conclusão. O objetivo é finalizar o projeto e depois iniciar a criação de um **front-end completo** para consumir a API.

---

### Funcionalidades

* **Gerenciamento de Usuários:**
    * Criação de novos usuários (**`signup`**) e login (**`login`**).
    * Rotas protegidas por autenticação e autorização (somente usuários logados podem acessar certas rotas).
* **Gerenciamento de Tours:**
    * Criação, leitura, atualização e exclusão de tours (CRUD).
    * Acesso restrito para administradores ou usuários específicos.
* **APIs RESTful:**
    * Todos os endpoints foram construídos seguindo o padrão REST.

---

### Como Testar a API (via Postman)

A API está hospedada publicamente. Você pode testar todos os endpoints usando o [Postman](https://www.postman.com/downloads/).

**URL Base:** `https://api-user-tours-node-js.onrender.com/api/v1`

1. **Crie um Usuário:** Faça uma requisição `POST` para `URL BASE/users/signup` com os dados do novo usuário.
2. **Faça Login:** Com o usuário criado, faça uma requisição `POST` para `URL BASE/users/login` para receber um token de autenticação.
3. **Acesse as Rotas Protegidas:** Use o token de autenticação para acessar as rotas protegidas, como `GET URL BASE/tours`.

---
### Tecnologias Utilizadas

* **Back-end:**
    * **Node.js**
    * **Express.js**
    * **MongoDB** (via Mongoose)
    * **JavaScript**
    * **Outras Ferramentas:** Render (para hospedagem), Postman

---
