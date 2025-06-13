var Url = window.location.href
var idtag = Url.indexOf('?clientId=')
var id = Url.substring(idtag + 10)

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("ClientNewPlaceForm");

    if (!formulario) {
        console.error("Erro: Formulário de novo endereço não encontrado!");
        return;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        let cep = formulario.querySelector("input[name='cep']").value.trim();
        let street = formulario.querySelector("input[name='street']").value.trim();
        let block = formulario.querySelector("input[name='block']").value.trim();
        let city = formulario.querySelector("input[name='city']").value.trim();
        let state = formulario.querySelector("input[name='state']").value.trim();
        let country = formulario.querySelector("input[name='country']").value.trim();

        addPlace(id, cep, street, block, city, state, country)
        changeAction('ClientInfo')
        refreshTablePlace('tableAdressClient')
    }

    )
    var res = alasql(`SELECT * FROM Client WHERE Id=${id}`)

    document.getElementById("nameCel").innerText = 'Nome completo: ' + res[0]['name'];
    document.getElementById("cpfCel").innerText = 'Cpf: ' + res[0]['cpf'];
    document.getElementById("birthdayCel").innerText = 'Data de nascimento: ' + res[0]['birthday'];;
    document.getElementById("telCel").innerText = 'N° Telefone: ' + res[0]['phone'];
    document.getElementById("celCel").innerText = 'N° Celular: ' + res[0]['cellPhone'];
    document.getElementById("clientNameHeader").innerText = res[0]['name'];
    var ros = alasql(`SELECT cep,street,block,city,state,country FROM Places WHERE clientId = ${id} AND main = TRUE`)


    document.getElementById("mainAdress").innerText = ("Rua " + ros[0]['street'] + " " + ros[0]['cep'] + " " + ros[0]['block'] + " " + ros[0]['city'] + " " + ros[0]['state'] + " " + ros[0]['country']);
    refreshTablePlace('tableAdressClient')
})


function mainAdressUpdate(idMain) {
    let client = alasql(`SELECT Id,street, cep , block , city, country, main , state FROM Places WHERE Id = ${idMain}`)
    document.getElementById("mainAdress").innerText = ("Rua " + client[0]['street'] + " " + client[0]['cep'] + " " + client[0]['block'] + " " + client[0]['city'] + " " + client[0]['state'] + " " + client[0]['country'])
}



function refreshTablePlace(tableID) {
    let client = alasql(`SELECT Id,street, cep , block , city, country, main , state FROM Places WHERE clientId = ${id} AND Active = TRUE AND main = FALSE`);
    console.log(client)
    var table = $(`#${tableID} tbody`);

    table.html("");

    $(client).each((i, obj) => {

        $(table).append(`
           <tr>
               <td>${obj['street']}</td>
               <td>${obj['block']}</td>
               <td>${obj['city']}</td>
               <td>${obj['cep']}</td>
               <td>${obj['state']}</td>
               <td>${obj['country']}</td>
               <td><a onclick="deletePlace(${obj['Id']})"><img src="assets/images/trashbin.png" title="Apagar endereço" class="deleteIcon"></a>
               <a onclick="makeItMain(${obj['Id']},${id})"><img src="assets/images/mainAdress.png" title="Tornar principal" class="deleteIcon"></a></td>
            </tr>
       `);
    });
}