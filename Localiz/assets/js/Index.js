alasql(`
    CREATE LOCALSTORAGE DATABASE IF NOT EXISTS agrosysSql;
    ATTACH LOCALSTORAGE DATABASE agrosysSql;
    USE agrosysSql;`)

// a função muda a classe dos objetos para aparecer ou não na tela
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('jsonFileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            console.log("JSON carregado:", jsonData);

            // Inserindo os dados nas tabelas corretas
            if (jsonData.Client) {
            jsonData.Client.forEach(client => {
                if(!cpfCheck([client.cpf])){
                    console.log("Cliente já existe e não foi inserido:", client);
                        return}
                alasql(`INSERT INTO Client(name,cpf,birthday,phone,cellPhone, Active) Values('${[client.name]}','${[client.cpf]}','${[client.birthday]}','${[client.phone]}','${[client.cellPhone]}',${[client.Active]})`);
                console.log("Clientes inseridos:", jsonData.Clients);
            
        })
    }
            if (jsonData.User) {
                jsonData.User.forEach(user => {
                    // Verifica se já existe um usuário com o mesmo nome no banco
                    if(verify('User',[user.name])){
                        console.log("Usuário já existe e não foi inserido:", user);
                        return
                    }
                    alasql(`INSERT INTO User (name, pass) VALUES ('${user.name}','${user.pass}' )`);
                        console.log("Usuário inserido:", user);
                    } 
                );
            }

            alert('Dados importados com sucesso!');
            
        } catch (error) {
            console.error("Erro ao processar JSON:", error);
            alert('Erro ao processar o JSON: ' + error.message);
        }
        };

        reader.readAsText(file);
    });
})

document.addEventListener("DOMContentLoaded", function () {
    // Obtém o formulário de login

    const formulario = document.getElementById("Login-Form");


    if (!formulario) {
        console.error("Erro: Formulário de login não encontrado!");
        return;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Obtém os valores dos inputs dentro do formulário de login
        let userName = formulario.querySelector("input[name='user']").value.trim();
        let password = formulario.querySelector("input[name='pass']").value.trim();

        // verifica se existe no sistema
        if (verifyPass(userName, password)) {
            location.href = 'clientes.html';
        } else {
            alert("Login ou senha incorretos!")
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Obtém o formulário cadastro
    const formulario = document.getElementById("Register-Form");

    if (!formulario) {
        console.error("Erro: Formulário de registro não encontrado!");
        return;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o recarregamento da página

        // Obtém os valores dos inputs dentro do formulário 
        let newUserName = formulario.querySelector("input[name='user']").value.trim();
        let newPassword = formulario.querySelector("input[name='pass']").value.trim();

        if (!verify('User', newUserName)) {
            alasql(`INSERT INTO User(name , pass) VALUES('${newUserName}','${newPassword}')`)
            location.href = 'clientes.html';
        } else {
            alert("Nome de usuário já utilizado!")
        }
    });
});












