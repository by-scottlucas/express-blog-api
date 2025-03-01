# Express Blog API

Este projeto consiste em uma API desenvolvida em **Node.js** com o framework **Express** e banco de dados **MongoDB**. A API permite a criação e gerenciamento de um blog, com funcionalidades para CRUD de **usuários**, **posts** e **comentários**, além de autenticação via **JWT**.

## Funcionalidades

### Autenticação

- **Registro de Usuário**: Permite que novos usuários se registrem.
- **Login**: Realiza o login de usuários e gera um token JWT.

### Usuários

- **Listar Usuários**: Exibe todos os usuários cadastrados.
- **Criar Usuário**: Cria um novo usuário.
- **Obter Usuário**: Recupera as informações de um usuário pelo ID.
- **Atualizar Usuário**: Permite editar as informações de um usuário.
- **Deletar Usuário**: Exclui um usuário do sistema.

### Posts

- **Listar Posts**: Exibe todos os posts.
- **Criar Post**: Cria um novo post.
- **Obter Post**: Recupera as informações de um post específico.
- **Atualizar Post**: Permite editar as informações de um post.
- **Deletar Post**: Exclui um post.

### Comentários

- **Listar Comentários**: Exibe todos os comentários de um post.
- **Criar Comentário**: Permite que um usuário crie um comentário em um post.
- **Deletar Comentário**: Permite excluir um comentário.

### Autenticação de Rotas

- **Middleware de Autenticação**: Verifica se o usuário está autenticado antes de permitir o acesso a rotas protegidas.

## Estrutura do Projeto

- **src/controllers**: Contém a lógica dos controladores, como operações de CRUD e autenticação.
- **src/models**: Define os modelos de dados, incluindo usuários, posts e comentários.
- **src/services**: Contém a lógica de negócios da API.
- **src/routes**: Define as rotas da API e seus respectivos manipuladores.
- **src/middlewares**: Inclui o middleware de autenticação JWT.
- **src/tests**: Contém os testes unitários para os models, services, controllers e routes.
- **app.js**: Arquivo principal que configura o servidor e inicializa a API.

## Como Rodar o Projeto

### 1. Pré-requisitos

Certifique-se de que o **Node.js** e o **npm** (ou **yarn**) estão instalados no seu ambiente.

### 2. Instalação das Dependências

Na raiz do projeto, execute o seguinte comando para instalar as dependências:

```bash
npm install
```

### 3. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis de ambiente:

```env
MONGO_USER=YOUR_USERNAME
MONGO_PASSWORD=YOUR_PASSWORD
MONGO_HOST=YOUR_HOST
MONGO_PORT=27017
MONGO_DB=YOUR_DATABASE

JWT_SECRET=YOUR_JWT_SECRET
SESSION_SECRET=YOUR_SESSION_SECRET
```

### 4. Execução da API

Após configurar as variáveis de ambiente, execute o seguinte comando para iniciar a API:

```bash
npm start
```

A API estará disponível em **[http://localhost:3000](http://localhost:3000/)**.

## Endpoints

### Usuários

- **POST** `/api/v1/users` - Criar usuário
- **GET** `/api/v1/users` - Listar usuários
- **GET** `/api/v1/users/:id` - Obter usuário pelo ID
- **PUT** `/api/v1/users/:id` - Atualizar usuário
- **DELETE** `/api/v1/users/:id` - Deletar usuário

### Posts

- **GET** `/api/v1/posts` - Listar posts
- **POST** `/api/v1/posts` - Criar post
- **GET** `/api/v1/posts/:id` - Obter post pelo ID
- **PUT** `/api/v1/posts/:id` - Atualizar post
- **DELETE** `/api/v1/posts/:id` - Deletar post

### Comentários

- **GET** `/api/v1/comments/:postId` - Listar comentários de um post
- **POST** `/api/v1/comments` - Criar comentário
- **DELETE** `/api/v1/comments/:id` - Deletar comentário

### Autenticação

- **POST** `/api/v1/auth/register` - Registrar usuário
- **POST** `/api/v1/auth/login` - Login de usuário

### Middleware de Autenticação

Rotas protegidas exigem que o usuário esteja autenticado. O token JWT deve ser enviado no cabeçalho da requisição com o prefixo `Bearer`:

```http
Authorization: Bearer <token>
```

## Tecnologias Utilizadas

- **Node.js**
- **Express**: Framework para construção da API.
- **MongoDB**: Banco de dados NoSQL utilizado para armazenar os dados.
- **JWT**: Para autenticação de usuários.
- **Mongoose**: Biblioteca para modelar e interagir com o MongoDB.
- **dotenv**: Para carregar variáveis de ambiente.

## Testes

Os testes de unidades para os **models**, **services**, **controllers** e **routes** estão localizados na pasta **src/tests**. Para rodar os testes, execute:

```bash
npm test
```

## Autor

Este projeto foi desenvolvido por **Lucas Santos Silva**, Desenvolvedor Full Stack, graduado pela **Escola Técnica do Estado de São Paulo (ETEC)** nos cursos de **Informática (Suporte)** e **Informática para Internet**.

## Licença

Este projeto está licenciado sob a [**Licença MIT**](./LICENSE).