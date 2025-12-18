# Natours API 🏔️ - Sistema de Reserva de Tours

Este é um projeto de back-end robusto para uma plataforma de turismo, focado em **Arquitetura MVC**, segurança de dados e integrações complexas. Desenvolvido para consolidar os fundamentos de Node.js antes da transição para o ecossistema **Nest.js e TypeScript**.

## 🔗 Links Úteis

  * **Live Demo:** [https://api-natours-75jm.onrender.com/](https://api-natours-75jm.onrender.com/)
  * **Documentação/Testes:** O arquivo JSON da coleção do Postman está disponível na pasta `/postman` deste repositório.

## 🛠️ Tecnologias e Implementações

### Back-end & Infraestrutura

  * **Node.js & Express.js:** Motor principal da aplicação.
  * **MongoDB & Mongoose:** Modelagem de dados NoSQL com referenciamento, populações e agregadores.
  * **Stripe API:** Fluxo completo de checkout e processamento automático de reservas via **Webhooks**.
  * **Render:** Hospedagem e Deploy contínuo.

### Segurança (Camada de Produção)

  * **Autenticação JWT:** Login, Signup e recuperação de senha.
  * **Segurança de Dados:** Implementação de `bcrypt` para hash de senhas e `helmet` para headers HTTP.
  * **Proteção de API:** \* `express-rate-limit` contra ataques de força bruta.
      * `mongo-sanitize` contra NoSQL Injection.
      * `xss-clean` para sanitização de inputs do usuário.

### Funcionalidades do Projeto

  * **CRUD Completo:** Tours, Usuários, Reviews e Reservas.
  * **Filtros Avançados:** Paginação, ordenação e filtragem dinâmica de campos na API.
  * **Processamento de Imagens:** Upload e redimensionamento automático de fotos de perfil com `Sharp`.
  * **Templates Server-Side:** Renderização de e-mails e páginas informativas usando `Pug`.

## 📂 Como rodar localmente

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/paulo-edvandro/api-user-tours-node.js.git
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**

      * Crie um arquivo `config.env` na raiz do projeto.
      * Utilize o arquivo `.env.example` como guia para preencher suas chaves do MongoDB, Stripe e JWT.

4.  **Inicie o servidor:**

    ```bash
    npm start
    ```

5.  **Email e senha pré configurados:**

    * test1@gmail.com
    * Teste123*

    ### 💳 Testando Pagamentos (Stripe Sandbox)
Para testar a funcionalidade de reserva e checkout, a API está em modo de teste. Você pode utilizar o cartão fictício padrão do Stripe:
* **Número:** `4242 4242 4242 4242`
* **Validade:** Qualquer data futura (ex: `12/28`)
* **CVC:** `123`

## 🚀 Próximos Passos

Este projeto marca o fim da minha jornada com **Express.js e Mongoose**. Atualmente, estou aplicando os conceitos de Injeção de Dependência e Design Patterns aprendidos aqui em arquiteturas mais escaláveis utilizando **Nest.js e PostgreSQL**.

-----

*Desenvolvido como parte do curso "Node.js, Express, MongoDB & More" de Jonas Schmedtmann, com foco exclusivo no desenvolvimento do Back-end.*