document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("Form-newClient");

    if (!formulario) {
        console.error("Erro: Formulário de novo cliente não encontrado!");
        return;
    }

    // Função para validar a primeira parte do formulário
    function validateClientPart() {
        let cliName = formulario.querySelector("input[name='name']").value.trim();
        let cliCpf = formulario.querySelector("input[name='cpf']").value.trim();
        let cliDate = formulario.querySelector("input[name='birthDay']").value.trim();
        let cliTel = formulario.querySelector("input[name='phone']").value.trim();
        let cliCel = formulario.querySelector("input[name='cellphone']").value.trim();

        if (!cliName || !cliCpf || !cliDate) {
            alert("Por favor, preencha todos os campos obrigatórios na primeira parte.");
            return false;
        }

        return true;
    }

    // Função para validar a segunda parte do formulário
    function validateAddressPart() {
        let cep = formulario.querySelector("input[name='cep']").value.trim();
        let street = formulario.querySelector("input[name='street']").value.trim();
        let block = formulario.querySelector("input[name='block']").value.trim();
        let city = formulario.querySelector("input[name='city']").value.trim();
        let state = formulario.querySelector("input[name='state']").value.trim();

        if (!cep || !street || !block || !city || !state) {
            alert("Por favor, preencha todos os campos obrigatórios na segunda parte.");
            return false;
        }

        return true;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Se a primeira parte não estiver validada, não permita a mudança para a segunda parte
        if (!validateClientPart()) {
            changeAction('newClient')
            return;
        }

        // Depois de validar a primeira parte, checar a segunda
        if (!validateAddressPart()) {
            changeAction('newClientPlace')
            return;
        }

        // Obtém os valores dos inputs dentro do formulário
        let cliName = formulario.querySelector("input[name='name']").value.trim();
        let cliCpf = formulario.querySelector("input[name='cpf']").value.trim();
        let cliDate = formulario.querySelector("input[name='birthDay']").value.trim();
        let cliTel = formulario.querySelector("input[name='phone']").value.trim();
        let cliCel = formulario.querySelector("input[name='cellphone']").value.trim();

        let cep = formulario.querySelector("input[name='cep']").value.trim();
        let street = formulario.querySelector("input[name='street']").value.trim();
        let block = formulario.querySelector("input[name='block']").value.trim();
        let city = formulario.querySelector("input[name='city']").value.trim();
        let state = formulario.querySelector("input[name='state']").value.trim();
        let country = formulario.querySelector("input[name='country']").value.trim();

        addClient(cliName, cliCpf, cliDate, cliTel = "-", cliCel = "-");
        const res = alasql(`SELECT Id FROM Client WHERE cpf = '${cliCpf}'`);

        if (!res.length > 0) {
            changeAction('newClient');
        } else {
            var resIdClient = res[0]['Id'];
            addPlace(resIdClient, cep, street, block, city, state, country);
            const ros = alasql(`SELECT Id FROM Places WHERE clientId = ${resIdClient}`);
            if (ros.length > 0) {
                var rosIdPlace = ros[ros.length - 1]['Id'];
                makeItMain(rosIdPlace, resIdClient);
                changeAction('listView');
                document.getElementById("Form-newClient").reset();
            }
        }
    });

    refreshTable("clientTable");
});

alasql(`
    CREATE LOCALSTORAGE DATABASE IF NOT EXISTS agrosysSql;
    ATTACH LOCALSTORAGE DATABASE agrosysSql;
    USE agrosysSql;`)

//Clientes carrega na 2° tela
// numeros de telefone e celular, são varchar, pois nao executam nenhuma operação numérica


alasql(`
    CREATE TABLE Client (
        Id INTEGER IDENTITY PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        cpf VARCHAR(11) NOT NULL,
        birthday DATE NOT NULL,
        phone VARCHAR(12),
        cellPhone VARCHAR(12),
        Active BOOLEAN NOT NULL,
        UNIQUE KEY(cpf))
`);



//endereços
alasql(`
        CREATE TABLE Places(
        Id INTEGER IDENTITY PRIMARY KEY,
        clientId INT NOT NULL REFERENCES Client(Id),
        cep varchar(8) NOT NULL,
        street varchar(50) NOT NULL,
        block varchar(50) NOT NULL,
        city varchar(20) NOT NULL,
        state varchar(2) NOT NULL,
        country varchar(20) NOT NULL,
        main boolean NOT NULL,
        Active boolean NOT NULL
    );
`);
function cpfCheck(cpfToCheck) {

    ver = alasql(`SELECT cpf FROM Client`)
    for (i = 0; i < ver.length; ++i) {
        if (ver[i]['cpf'] == cpfToCheck) {
            console.log('Cpf invalido ou já cadastrado')
            return false
        }
    }
    return true
}

function addClient(name, cpf, birthD, phone, cellphone = null) {
    if (cpfCheck(cpf)) {
        alasql(`
            INSERT INTO Client (name, cpf, birthday, phone, cellPhone, Active) 
            VALUES('${name}','${cpf}','${birthD}','${phone}','${cellphone}',TRUE)`)
    } else {
        alert(`Não foi possivel realizar o cadastro de ${name}`)
    }
    refreshTable("clientTable")
}



function addPlace(clientId, cep, street, block, city, state, country) {
    if (!clientId) {
        console.error("Erro: clientId é inválido:", clientId);
        return;
    }

    try {
        alasql(`
            INSERT INTO Places (clientId, cep, street, block, city, state, country, main, Active)
            VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)
        `, [clientId, cep, street, block, city, state, country]);

        console.log("Endereço adicionado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar endereço:", error);
    }
}


function deletePlace(id) {
    let confirmPlace = confirm("Quer mesmo deletar este item?");
    if (confirmPlace == false) {
        return false;
    }
    alasql.promise([`UPDATE Places SET Active = FALSE WHERE Id=${id}`])
        .then(function (retorno) {
            refreshTablePlace('tableAdressClient')
        })
        .catch(function (erro) {
            console.log(erro)
        })
}



function makeItMain(idPlace, idClient) {
    // Verifica se já existe um endereço principal para o cliente
    let cliInfo = alasql(`SELECT Id FROM Places WHERE main = TRUE AND clientId = ${idClient}`);

    if (cliInfo.length === 0) {
        // Se não houver endereço principal, defina o novo endereço como principal
        alasql(`UPDATE Places SET main = TRUE WHERE Id = ${idPlace}`);
        console.log("Novo endereço principal adicionado com sucesso!");

    } else {
        // Se já houver um endereço principal, pergunta se o usuário quer trocar
        var confirmPlace = confirm("Você quer que este seja o novo endereço principal?");
        if (confirmPlace) {
            // Atualiza o endereço principal para o novo
            var off = alasql(`UPDATE Places SET main = FALSE WHERE clientId = ${idClient}`);
            var on = alasql(`UPDATE Places SET main = TRUE WHERE Id = ${idPlace}`);
            mainAdressUpdate(idPlace)
            alert('Novo endereço principal adicionado com sucesso!');
            refreshTablePlace("tableAdressClient")

        } else {
            console.log("O endereço principal não foi alterado.");
        }
    }
}




function refreshTable(tableID) {
    let client = alasql(`SELECT * FROM Client WHERE Active = TRUE`);

    var table = $(`#${tableID} tbody`);

    table.html("");

    $(client).each((i, obj) => {
        var count = alasql(`SELECT COUNT (*) FROM Places WHERE clientId = ${obj['Id']}`)
        $(table).append(`
                <tr>
                    <td>${obj['name']}</td>
                    <td>${obj['cpf']}</td>
                    <td>${obj['birthday']}</td>
                    <td>${obj['phone']}</td>
                    <td>${obj['cellPhone']}</td>
                    <td> ${count.length}</td>
                    <td>
                        <a href="enderecos.html?clientId=${obj['Id']}"><img style="width: 20px" src="assets/images/edit.png"></a>
                    </td>
                </tr>
            `);
    });
}


