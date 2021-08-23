## Requisitos

Criar um arquivo chamado `.env` contendo os dados para conexão do banco de dados postgresql. Ex: `example.env`

```env
PG_USER=root
PG_PASSWORD=root
PG_DATABASE=mydb
PG_PORT=5432
PG_HOST=127.0.0.1
```

Também é necessário ter `nodejs` instalado na máquina, de preferência na versão `14.x`.

## Descrição

Esta aplicação é direcionada para o projeto final da cadeira de Fundamentos de Banco de Dados, na UFC de Quixadá.

## Instalação

```bash
# Com npm
$ npm install

# Com yarn
$ yarn install
```

## Rodar o aplicativo

```bash
# Com npm
$ npm run start:prod

# Com yarn
$ yarn start:prod
```

## Considerações

A raiz é em `localhost:3000` e o endpoint da api rest fica em `localhost:3000/api`

Os testes foram feito no sistema `Ubuntu 20.04 LTS` com a utilização de um banco `PostgreSql` local com o `Docker`.

Comando para abrir a instância do postgre no docker:

```bash
$ docker run --name pgsql -p 5432:5432 -e POSTGRES_PASSWORD=root -e POSTGRES_USER=root -e POSTGRES_DB=mypalette -d postgres
```

Ao entrar na rota `localhost:3000/docs` será mostrado todas as possíveis chamadas da api, mesmo que não com muitos detalhes pois esse não era o foco do projeto final.

As chamadas da api foram testadas usando o aplicativo `Insominia`. Deixarei um arquivo de um projeto insominia contendo todas as chamdas, nome do arquivo é `Insomnia_2021-08-22.json`.
