// Load data from db
function loadData(data) {
    const dataHtml = generateHtml(data);
    $('#show-record').append(dataHtml);
}
function generateHtml(data) {
    let elementsHtml = '';
    for (item of data) {
        const element =
        `
        <tr record-id="${item['recordId']}" class="text-center">
            <th scope="row">${item['recordId']}</th>
            <td class="type text-break">${item['recordType']}</td>
            <td class="money text-break">${item['money']}</td>
            <td class="category text-break">${item['category']}</td>
            <td class="account text-break">${item['account']}</td>

            <td class="text-center">
                <button record-id="${item['recordId']}" class="btn btnEdit" type="button">
                    E
                </button>
            </td>
            <td class="text-center">
                <button record-id="${item['recordId']}" class="btn btnDelete" type="button">
                    D
                </button>
            </td>
        </tr>`;
        elementsHtml += element;
    }
    return elementsHtml;
}
$.get('./record', {}, (data) => {
    loadData(data)
})

// Call POST request via ajax to app.js
function getPostData() {
    const type = $("#post-type").val();
    const money = $("#post-money").val();
    const category = $("#post-category").val();
    const account = $("#post-account").val();
    return {
        'recordType': type,
        'money': money,
        'category': category,
        'account': account
    }
}
$('#post-form button[type="submit"]').click((e) => {
    // POST list to /record
    postData = getPostData()
    console.log(postData);
    $.post('./record', postData, (data, status) => {
        console.log('success!');
        alert(data, status);
    })
});

// Call PUT request via ajax to app.js
function getPutData(recordId) {
    const recordElement = $(`tr[record-id='${recordId}'`);
    const newType = recordElement.find('#put-type').val();
    const newMoney = recordElement.find('#put-money').val();
    const newCategory = recordElement.find('#put-category').val();
    const newAccount = recordElement.find('#put-account').val();
    const element =
        `
            <th scope="row">${recordId}</th>
            <td class="type">${newType}</td>
            <td class="money">${newMoney}</td>
            <td class="category">${newCategory}</td>
            <td class="account">${newAccount}</td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnEdit" type="button">
                    E
                </button
            </td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnDelete" type="button">
                    D
                </button>
            </td>
        `;
    recordElement.html(element);
    recordElement.removeClass('on-edit')
    return {
        'id': recordId,
        'recordType': newType,
        'money': newMoney,
        'category': newCategory,
        'account': newAccount
    }
}

// Create PUT ajax
$.put = function(url, data){
    return $.ajax({
      url: url,
      type: 'PUT',
      data: data
    });
}

$("body").delegate(".btnUpdate", "click", function (e) {
    e.preventDefault()

    // Catch id and value of each update-input
    const recordId = $(this).attr('record-id');
    putData = getPutData(recordId)
    $.put('./record', putData, function(data, status) {
        alert (data, status);
    })
});

// Edit record-row
function showEditForm(recordId) {
    const recordElement = $(`tr[record-id='${recordId}'`);
    const oldType = recordElement.find('.type').text();
    const oldMoney = recordElement.find('.money').text();
    const oldCategory = recordElement.find('.category').text();
    const oldAccount = recordElement.find('.account').text();
    
    const formHtml = 
    `
    <th scope="row">${recordId}</th>
    <td class="type text-break text-center">
        <input record-old-type="${oldType}" type="text" aria-label="type" class="form-control" id="put-type" placeholder="Type" value=${oldType}>
    </td>
    <td class="money text-break text-center">
        <input record-old-money="${oldMoney}"  type="text" aria-label="money" class="form-control" id="put-money" placeholder="No." value=${oldMoney}>
    </td>
    <td class="category text-break text-center">
        <input record-old-category="${oldCategory}"  type="text" aria-label="category" class="form-control" id="put-category" placeholder="No." value=${oldCategory}>
    </td>
    <td class="account text-break text-center">
        <input record-old-account="${oldAccount}"  type="text" aria-label="account" class="form-control" id="put-account" placeholder="No." value=${oldAccount}>
    </td>
    <td class="text-center d-flex">
        <button type="button" record-id="${recordId}" class="btn btn-sm btn-success btnUpdate d-block mx-auto">O</button>
        <button type="button" record-id="${recordId}" class="btn btn-sm btn-secondary btnCancel d-block mx-auto">X</button>
    </td>
    `;
    recordElement.html(formHtml);
    recordElement.addClass('on-edit')
}
$("body").delegate(".btnEdit", "click", function (e) {
    const recordId = $(this).attr('record-id');
    if (recordId) {
        showEditForm(recordId)
    }
});

function cancelEditForm(recordId) {
    const recordElement = $(`tr[record-id='${recordId}'`);
    const oldType = recordElement.find('#put-type').attr('record-old-type');
    const oldMoney = recordElement.find('#put-money').attr('record-old-money');
    const oldCategory = recordElement.find('#put-category').attr('record-old-category');
    const oldAccount = recordElement.find('#put-account').attr('record-old-account');
    const element =
        `
            <th scope="row">${recordId}</th>
            <td class="type">${oldType}</td>
            <td class="money">${oldMoney}</td>
            <td class="category">${oldCategory}</td>
            <td class="account">${oldAccount}</td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnEdit" type="button">
                    E
                </button
            </td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnDelete" type="button">
                    D
                </button>
            </td>
        `;
    recordElement.html(element);
    recordElement.removeClass('on-edit')
}
$("body").delegate(".btnCancel", "click", function (e) {
    const recordId = $(this).attr('record-id');
    cancelEditForm(recordId)
});

// Delete row
$.delete = function(url, data, callback){
    return $.ajax({
        url: url,
        type: 'DELETE',
        data: data,
        success: callback,
    });
}
$("body").delegate(".btnDelete", "click", function (e) {
    const recordId = $(this).attr('record-id');
    $.delete(`./record/${recordId}`, function(data, status) {
        alert(data, status);
        location.reload();
    })
});

function generateExpenseGraph (total) {
}

$("body").delegate(".btnTotal", "click", function (e) {
// Create statistical graph
    $.get(`./record`, {recordType: "Expense"}, (data) => {
        var total = parseInt(0);
        console.log(data);
        var total = parseInt(0)
        for (item of data) {
            total += parseInt(item.money);
        }
        generateExpenseGraph(total)
            // $.get(`./record/:${id}`, { category: "traffic"}, (data) => {
            //     console.log(data.money);
            //     // show total expense/income of all "traffic"
            // })
    })
});
