$(document).on("click", "#dbExportUser", function (e) {
    e.preventDefault();

    $.when(geraJsonDB('User')).then(function (data) {
        let serializedData = JSON.stringify(data, null, 2); // JSON formatado

        let blob = new Blob([serializedData], { type: "application/json" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "User_Database.json"; // Nome do arquivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }).catch(function (error) {
        console.error("Erro ao gerar JSON para User:", error);
    });
});

$(document).on("click", "#dbExportClient", function (e) {
    e.preventDefault();

    $.when(geraJsonDB('Client')).then(function (data) {
        let serializedData = JSON.stringify(data, null, 2); // JSON formatado

        let blob = new Blob([serializedData], { type: "application/json" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "Client_Database.json"; // Nome do arquivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }).catch(function (error) {
        console.error("Erro ao gerar JSON para Client:", error);
    });
});

$(document).on("click", "#dbExportPlaces", function (e) {
    e.preventDefault();

    $.when(geraJsonDB('Places')).then(function (data) {
        let serializedData = JSON.stringify(data, null, 2); // JSON formatado

        let blob = new Blob([serializedData], { type: "application/json" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = "Places_Database.json"; // Nome do arquivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }).catch(function (error) {
        console.error("Erro ao gerar JSON para Places:", error);
    });
});




// inicializar tabelas
alasql(`
    CREATE LOCALSTORAGE DATABASE IF NOT EXISTS agrosysSql;
    ATTACH LOCALSTORAGE DATABASE agrosysSql;
    USE agrosysSql;`)

// Users - carrega na primeira tela
alasql(`CREATE TABLE User (
    Id serial,
    name varchar(20) not null, 
    pass varchar(20) not null, 
    PRIMARY KEY (Id), 
    UNIQUE KEY(name))
    `);




// usuario padrão
alasql("INSERT INTO User (name, pass) VALUES('Adm','12345678')");

//Alternar elementos em uma tela -. ao invés de pop-ups, escondemos e mostramos os itens de um html/css
function changeAction(action) {
    $(".action").removeClass("on")
    $(`[data-action='${action}']`).addClass("on");
    console.log(action + ' Is on');
}


// verifica se um item está em um banco de dados especifico-> True= está no banco False= nao está
function verify(dbTarget, itemToCheck, targetData = '*') {
    var res = alasql(`SELECT ${targetData} FROM ${dbTarget}`);
    for (var i = 0; i < res.length; i++) {
        console.log(i)
        for (var j in res[i]) {
            if (res[i][j] == itemToCheck) {
                console.log(`${itemToCheck} is on the DataBase`);
                return true
            }
        }
    }
    console.log(`${itemToCheck} not found`);
    return false
}

// verifica a senha
function verifyPass(userToCheck, passToCheck, dbTarget = "User") {
    var res = alasql(`SELECT name , pass FROM ${dbTarget} `);

    console.log(res);
    for (var i = 0; i < res.length; i++) {
        if (res[i]['name'] == userToCheck && res[i]['pass'] == passToCheck) {
            console.log("Login authorized");
            return true
        }
    }
    console.log("Login not authorized");
    return false
}

function geraJsonDB(table) {
    return new Promise((resolve, reject) => {
        try {
            // Obtém os dados de cada tabela (User, Client, Places)
            let data = alasql(`SELECT * FROM ${table}`);
            resolve({[table] : data}); // Retorna os dados como JSON
        } catch (error) {
            reject(error);
        }
    });
}

function readJson(inputElement) {
    return new Promise((resolve, reject) => {
        const file = inputElement.files[0]; // Pega o primeiro arquivo
        if (!file) {
            reject("Nenhum arquivo selecionado.");
            return;
        }

        const reader = new FileReader();
        
        // Função de sucesso
        reader.onload = function (e) {
            try {
                // Parse do conteúdo JSON
                const jsonData = JSON.parse(e.target.result);
                
                // Verifica se as tabelas existem no JSON
                if (jsonData.User && jsonData.Client && jsonData.Places) {
                    resolve(jsonData); // Retorna os dados completos
                } else {
                    reject("O arquivo JSON não contém as tabelas necessárias.");
                }
            } catch (error) {
                reject("Erro ao processar o arquivo JSON: " + error);
            }
        };

        // Função de erro
        reader.onerror = function () {
            reject("Erro ao ler o arquivo.");
        };

        // Lê o arquivo como texto
        reader.readAsText(file);
    });
}






