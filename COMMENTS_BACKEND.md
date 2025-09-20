# Student Management API - Technical Documentation

## Decisão da Arquitetura Utilizada

### Arquitetura em Camadas (Layered Architecture)
O projeto foi desenvolvido seguindo uma arquitetura em camadas bem definida, promovendo separação de responsabilidades e facilidade de manutenção:

- **Controllers**: Responsáveis por receber requisições HTTP, validar dados de entrada e retornar respostas
- **Services**: Contêm a lógica de negócio da aplicação
- **Repositories**: Gerenciam o acesso aos dados e operações com o banco de dados
- **Middleware**: Interceptam requisições para autenticação, tratamento de erros e rate limiting
- **Types**: Definições de tipos TypeScript para garantir type safety
- **Validation**: Schemas de validação usando Zod para entrada de dados
- **Utils**: Funções utilitárias reutilizáveis

### Padrões de Projeto Implementados

1. **Repository Pattern**: Abstração da camada de acesso a dados
2. **Dependency Injection**: Inicialização do Prisma Client de forma flexível para testes
3. **Error Handling Pattern**: Sistema centralizado de tratamento de erros
4. **Middleware Pattern**: Interceptação de requisições para funcionalidades transversais

### Estrutura de Pastas
```
src/
├── controllers/     # Controladores HTTP
├── services/        # Lógica de negócio
├── repositories/    # Acesso a dados
├── middleware/      # Middlewares da aplicação
├── routes/          # Definição de rotas
├── types/           # Definições de tipos
├── validation/      # Schemas de validação
├── utils/           # Funções utilitárias
└── errors/          # Classes de erro customizadas
```

## Como rodar o projeto

### Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (versão 18 ou superior)
- **npm** (gerenciador de pacotes do Node.js)
- **Docker** e **Docker Compose**

### Passos para execução

1. **Instale as Dependências**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente e crie o seu arquivo proprio .env (.env.example)**
   ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/student_management"
    DATABASE_URL_TEST="postgresql://username:password@localhost:5432/student_management_test"

    JWT_SECRET="bwbgwgb89wbg9wbg9wbg99w"
    JWT_EXPIRES_IN="24h"

    PORT=3000
    NODE_ENV="development"

    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX_REQUESTS=5

    BCRYPT_ROUNDS=12
   ```
   Edite o arquivo `.env` com suas configurações específicas ou copie igual ao .env.exemple.

3. **Inicie o Banco de Dados com Docker Compose**
   Este comando irá criar e iniciar o contêiner do PostgreSQL em segundo plano.
   ```bash
   npm run docker:up -d
   ```

4. **Execute as Migrações do Prisma**
   As migrações irão criar a estrutura das tabelas no banco de dados.
   ```bash
   npm run prisma:migrate
   ```

5. **Popule o Banco de Dados**
   Este passo irá adicionar alguns dados de exemplo ao banco de dados para testes.
   ```bash
   npm run prisma:seed
   ```

6. **Inicie a AAPI**
   Este comando inicia o servidor da API.
   ```bash
   npm run dev
   ```
### Verificação da Instalação

Após seguir os passos acima, a API estará disponível em:
- **URL**: `http://localhost:3000/API`
- **Health Check**: `GET http://localhost:3000/api/health`


## Lista de Bibliotecas de Terceiros Utilizadas

### Dependências de Produção

- **@prisma/client (^6.16.2)**: ORM moderno para TypeScript/JavaScript
- **bcryptjs (^3.0.2)**: Biblioteca para hash de senhas
- **cors (^2.8.5)**: Middleware para Cross-Origin Resource Sharing
- **dotenv (^17.2.2)**: Carregamento de variáveis de ambiente
- **express (^5.1.0)**: Framework web para Node.js
- **express-rate-limit (^8.1.0)**: Middleware para rate limiting
- **helmet (^8.1.0)**: Middleware de segurança para Express
- **jsonwebtoken (^9.0.2)**: Implementação de JSON Web Tokens
- **zod (^4.1.9)**: Biblioteca de validação e parsing de schemas

### Dependências de Desenvolvimento

- **@types/***: Definições de tipos TypeScript
- **jest (^30.1.3)**: Framework de testes
- **supertest (^7.1.4)**: Biblioteca para testes de APIs HTTP
- **ts-jest (^29.4.2)**: Preset do Jest para TypeScript
- **typescript (^5.9.2)**: Compilador TypeScript
- **eslint**: Linter para JavaScript/TypeScript

## Explicação sobre os Endpoints e Agregações Criadas

### Endpoints de Autenticação (`/api/auth`)

#### `POST /api/auth/register`
- **Propósito**: Registro de novos usuários
- **Validação**: Email único, senha com critérios de segurança
- **Resposta**: Dados do usuário criado (sem senha)

#### `POST /api/auth/login`
- **Propósito**: Autenticação de usuários
- **Validação**: Credenciais válidas
- **Resposta**: JWT token e dados do usuário
- **Rate Limiting**: Aplicado para prevenir ataques de força bruta

#### `GET /api/auth/me`
- **Propósito**: Obter dados do usuário autenticado
- **Autenticação**: Requer JWT token válido
- **Resposta**: Perfil do usuário logado

### Endpoints de Estudantes (`/api/students`)

#### `GET /api/students`
- **Propósito**: Listagem de estudantes com filtros opcionais
- **Filtros**: Nome, email, RA, CPF, busca geral
- **Paginação**: Suporte a paginação com limit e offset
- **Acesso**: Público (não requer autenticação)

#### `GET /api/students/:id`
- **Propósito**: Obter dados de um estudante específico
- **Validação**: ID válido
- **Resposta**: Dados completos do estudante

#### `POST /api/students`
- **Propósito**: Criação de novos estudantes
- **Autenticação**: Requer JWT token válido
- **Validação**: CPF válido, email único, RA único
- **Auditoria**: Registra ação no modelo StudentUser

#### `PUT /api/students/:id`
- **Propósito**: Atualização de dados do estudante
- **Autenticação**: Requer JWT token válido
- **Validação**: Dados opcionais (nome, email)
- **Auditoria**: Registra ação no modelo StudentUser

#### `DELETE /api/students/:id`
- **Propósito**: Exclusão lógica de estudantes
- **Autenticação**: Requer JWT token válido
- **Implementação**: Soft delete (campo deletedAt)
- **Auditoria**: Registra ação no modelo StudentUser

### Endpoint de Saúde (`/api/health`)

#### `GET /api/health`
- **Propósito**: Verificação do status da API
- **Resposta**: Status de funcionamento e timestamp

## Agregações e Funcionalidades Especiais

### Sistema de Auditoria
- **Modelo StudentUser**: Registra todas as ações (CREATED, UPDATED, DELETED) realizadas por usuários em estudantes
- **Rastreabilidade**: Permite auditoria completa das operações

### Validação de CPF
- **Utilitário personalizado**: Validação algorítmica de CPF
- **Integração**: Aplicada automaticamente na criação/atualização de estudantes

### Rate Limiting
- **Proteção**: Aplicado especificamente nas rotas de autenticação
- **Configuração**: Janela de 1 minuto com máximo de 50 tentativas (simulando uma aplicação falsa, esses dados seriam diferentes em uma aplicação real e escalavel)

### Tratamento de Erros
- **Classes customizadas**: Hierarquia de erros específicos para diferentes cenários
- **Middleware centralizado**: Tratamento uniforme de erros em toda a aplicação

### Segurança
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração para requisições cross-origin
- **JWT**: Autenticação stateless
- **Bcrypt**: Hash seguro de senhas

## Banco de Dados

### Modelo de Dados
- **Students**: Estudantes com dados únicos (email, RA, CPF)
- **StudentUser**: Tabela de auditoria para rastrear ações

### Índices
- **Performance**: Índices em campos frequentemente consultados (name, email, ra, cpf)
- **Unicidade**: Constraints para garantir integridade dos dados

### Migrations
- **Prisma**: Sistema de migrations para versionamento do schema
- **Seed**: Script para popular dados iniciais

## O que você melhoraria se tivesse mais tempo

### Melhorias que poderiam ser implementadas (algumas podem ser overkill para o escopo atual):

#### Testes
- **Maior cobertura de testes**: Expandir os testes unitários para cobrir 100% do código
- **Testes de carga**: Implementar testes de performance e stress usando ferramentas como Artillery ou k6
- **Testes end-to-end**: Adicionar testes E2E com Cypress ou Playwright

#### Documentação da API
- **Swagger/OpenAPI**: Implementar documentação automática da API, embora já tenhamos um frontend desenvolvido, poderia ser útil para desenvolvedores

#### Segurança Avançada
- **Proteção XSS**: Implementar sanitização mais robusta contra ataques Cross-Site Scripting
- **CSRF Protection**: Adicionar tokens CSRF para formulários
- **Input Sanitization**: Biblioteca adicional para sanitização de inputs

#### Autenticação Externa (pode ser overkill)
- **OAuth/SSO**: Integração com provedores como Firebase Auth, AWS Cognito ou Auth0
- **Multi-factor Authentication**: Implementar 2FA via SMS ou aplicativo
- **Social Login**: Login com Google, Microsoft, etc.

#### Funcionalidades Avançadas para Roles
- **Sistema de Permissões Granulares**: Implementar permissões específicas além dos roles básicos
- **Histórico Detalhado**: Expandir o sistema de auditoria com mais detalhes e filtros
- **Dashboard com Gráficos**: Implementar analytics e relatórios visuais para diferentes perfis de usuário
- **Notificações**: Sistema de notificações em tempo real para ações importantes

#### Performance e Escalabilidade
- **Cache**: Implementar Redis para cache de consultas frequentes
- **Database Optimization**: Otimizações avançadas de queries e índices
- **API Rate Limiting Avançado**: Rate limiting por usuário/role específico
- **Logs persoanlizados com Pino**: Adicionar Logs mais performaticos junto com o um arquivo proprio de log pensando em deploy 

#### Monitoramento
- **APM**: Application Performance Monitoring com ferramentas como DataDog
- **Health Checks Avançados**: Verificações de saúde do banco de dados e serviços externos
- **Métricas**: Coleta de métricas de uso e performance

#### Notificacão 
- **Notificação via email apos algum Delete ou Update**: utilizar AWS SES para receber notificação via email após alguma alteração 

**Nota**: Muitas dessas melhorias podem ser consideradas overkill para o escopo atual do projeto, que já atende bem aos requisitos propostos com uma arquitetura sólida e funcionalidades essenciais bem implementadas.