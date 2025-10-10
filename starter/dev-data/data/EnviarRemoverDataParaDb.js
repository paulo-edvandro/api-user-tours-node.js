// TEMOS QUE IMPORTAR TUDO DE NOVO AQUI, POIS NÃO É UM ARQUIVO CONECTADO COM O SERVER.JS (ARQUIVO PRINCIPAL QUE RODA O SERVIDOR), ENTÃO TEMOS QUE CONECTAR NOSSO BANCO DE DADOS E TUDO O QUE PRECISARMOS COMO O DOTENV PARA ACESSAR VARIAVEIS ...

const fs = require('fs');
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../../model/toursModel');
const User = require('../../model/usersModel');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB ESTÁ CONECTADO');
  });
function escolherColecao(Model, fileName) {
  //1 LER O ARQUIVO JSON CONTENDO OS DOCUMENTOS TESTE (Funcional apenas para essa pasta data, obvio)
  const arquivoJson = JSON.parse(
    fs.readFileSync(`${__dirname}/${fileName}`, 'utf-8'),
  );

  // 2 FUNÇÃO PARA IMPORTAR OS NOSSOS DOCUMENTOS USANDO O TOUR.CREATE(ARQUIVOJSON), ELE JÁ RECONHECE TODOS NO ARRAY , NÃO PRECISAMOS FAZER NENHUM LOOP COM AWAIT EM CADA UM
  const importData = async () => {
    try {
      await Model.create(arquivoJson);
      console.log('importado');
    } catch (err) {
      console.error('Erro ao importat dados JSON', err.message);
    }

    process.exit();
  };
  //OBS: USAMOS O PROCESS.EXIT() POR CONTA DE ALGUNS PROCESSOS ASSINCRONOS DO NOSSO CÓDIGO COMO O DO MONGOOSE, QUE PODE CONTINUAR E IMPEDIR QUE O NODE ENCERRE;

  //3 USAMOS O MÉTODO TOUR.DELETEMANY() PARA DELETAR TODOS OS TOURS OU DOCUMENTOS QUE ESTÃO LÁ PARA TESTE, É BOM QUE TENHA;
  const deleteData = async () => {
    try {
      await Model.deleteMany();

      console.log('deletado');
    } catch (err) {
      console.error('Erro ao deletar dados', err.message);
    }

    process.exit();
  };

  // 4 IF'S/ELSE PARA VERIFICAR QUAL PREFIXO COLOCAMOS NO TERMINAL. POIS PARA RODAR ESSE ARQUIVO TEMOS QUE DÁ O NODE ARQUIVO;
  if (process.argv[2] === '--import') {
    importData();
  } else if (process.argv[2] === '--delete') {
    deleteData();
  } else {
    console.log('use --import ou --delete');
    process.exit();
  }
  //VERIFICAMOS O PREFIXO ATRAVÉS DO PROCESS.ARGS[] QUE É UM MÉTODO MARAVILHOSO, O QUE ELE FAZ: QUANDO DIGITAMOS NODE ARQUVO O PROCESS.ARGS[0]E PROCESS.ARGS[1] TRATAM DO CAMINHO DO ARQUIVO (NODE CAMINHO) MAS O PROCESS.ARGS[2] TRATA DO PREFIXO DEPOIS DISSO QEU NÓS COLOCAMOS, SENDO O PROCESS.ARGS[2] O PRIMEIRO , PROCESS.ARGS[3] O SEGUNDO E POR ASSIM EM DIANTE; ASSIM TODA VEZ QUE DIGITARMOS NODE CAMINHO_DESSE_ARQUIVO --IMPORT ELE VAI IMPORTAR OS ARQUIVOS JSON PARA O NOSOO BANCO DE DADOS E SE FIZERMOS --DELETE , ELE VAI DELETAR DE LÁ COM O TOUR.DELETEMANY() E IMPORTAR COM O TOUR.CREATE(); COLOCANDO TUDO DE UMA VEZ;
}

//CHAMAMOS A FUNÇÃO:
escolherColecao(Tour, 'tours.json');
// node starter/dev-data/data/EnviarRemoverDataParaDb.js --
