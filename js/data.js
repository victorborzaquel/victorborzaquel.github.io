export const localeData = {
  br: {
    firstNamesMale: ['Miguel','Arthur','Heitor','Bernardo','Davi','Lucas','Gabriel','Pedro','Matheus','Rafael','Felipe','Gustavo','Henrique','Rodrigo','Thiago','Leonardo','Bruno','André','Carlos','Marcos','Vinicius','Eduardo','Fernando','Alexandre','Caio','Igor','Leandro','Otávio','Renato','Sérgio'],
    firstNamesFemale: ['Alice','Sophia','Valentina','Helena','Laura','Isabela','Manuela','Júlia','Heloísa','Luísa','Ana','Beatriz','Clara','Daniela','Fernanda','Gabriela','Letícia','Maria','Natália','Patrícia','Amanda','Bruna','Camila','Diana','Eduarda','Larissa','Mariana','Nicole','Rafaela','Vitória'],
    lastNames: ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Sousa','Fernandes','Vieira','Barbosa','Rocha','Dias','Nascimento','Andrade','Moreira','Neves','Medeiros','Castro','Araújo','Cardoso'],
    emailDomains: ['gmail.com','hotmail.com','outlook.com','yahoo.com.br','uol.com.br','bol.com.br'],
    ddds: ['11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38','41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'],
  },
  us: {
    firstNamesMale: ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob'],
    firstNamesFemale: ['Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia'],
    lastNames: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'],
    emailDomains: ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com'],
    states: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
  },
};

// https://docs.stripe.com/connect/testing — Bank Account Testing section
export const stripeAccounts = {
  br: [
    { agency: '0001', account: '0001234', note: 'Success' },
    { agency: '0001', account: '1111116', note: 'No account' },
    { agency: '0001', account: '1111113', note: 'Account closed' },
    { agency: '0001', account: '2222227', note: 'Insufficient funds' },
    { agency: '0001', account: '3333335', note: 'Debit not authorized' },
    { agency: '0001', account: '4444440', note: 'Invalid currency' },
  ],
  us: [
    { routing: '110000000', account: '000123456789', type: 'checking', note: 'Success' },
    { routing: '110000000', account: '000333333335', type: 'savings',  note: 'Success (savings)' },
    { routing: '110000000', account: '000111111113', type: 'checking', note: 'Account closed' },
    { routing: '110000000', account: '000111111116', type: 'checking', note: 'No account' },
    { routing: '110000000', account: '000222222227', type: 'checking', note: 'Debit not authorized' },
  ],
};
