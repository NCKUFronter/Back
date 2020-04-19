function loadData(data) {
    const dataHtml = generateHtml(data);
    $('#show-record').append(dataHtml);
}
function generateHtml(data) {
    let elementsHtml = '';
    for (item of data) {
        const element =
        `
        <tr record-id="${item['id']}" class="text-center">
            <th scope="row">${item['id']}</th>
            <td class="price text-break">${item['io']}</td>
            <td class="name text-break">${item['name']}</td>
            <td class="price text-break">${item['price']}</td>
            <td class="classification text-break">${item['classification']}</td>
            <td class="account text-break">${item['account']}</td>
            <td class="date text-break">${item['date']}</td>

            <td class="text-center">
                <button record-id="${item['id']}" class="btn btnEdit" type="button">
                    <img src="https://svgshare.com/i/JLZ.svg">
                </button>
            </td>
            <td class="text-center">
                <button record-id="${item['id']}" class="btn btnDelete" type="button">
                    <img src="https://svgshare.com/i/JLi.svg">
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
    const io = $("#post-io").val();
    const name = $("#post-name").val();
    const price = $("#post-price").val();
    const classification = $("#post-classification").val();
    const account = $("#account").val();
    const date = $("#date").val();
    return {
        'io': io,
        'name': name,
        'price': price,
        'classification': classification,
        'account': account,
        'date': date
    }
}
$('#post-form button[type="submit"]').click((e) => {
    // POST list to /record
    postData = getPostData()
    $.post('./record', postData, function(data, status) {
        alert(data, status);
    })
});

// Call PUT request via ajax to app.js
function getPutData(recordId) {
    const recordElement = $(`tr[record-id='${recordId}'`);
    const newName = recordElement.find('#put-name').val();
    const newPrice = recordElement.find('#put-price').val();
    const element =
        `
            <th scope="row">${recordId}</th>
            <td class="name">${newName}</td>
            <td class="price">${newPrice}</td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnEdit" type="button">
                    <img src="https://svgshare.com/i/JLZ.svg">
                </button
            </td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnDelete" type="button">
                    <img src="https://svgshare.com/i/JLi.svg">
                </button>
            </td>
        `;
    recordElement.html(element);
    recordElement.removeClass('on-edit')
    return {
        'name': newName,
        'price': newPrice,
        'id': recordId
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
    const oldName = recordElement.find('.name').text()
    const oldPrice = recordElement.find('.price').text()
    
    const formHtml = 
    `
    <th scope="row">${recordId}</th>
    <td class="name text-break text-center">
        <input record-old-name="${oldName}" type="text" aria-label="name" class="form-control" id="put-name" placeholder="Name" value=${oldAssetNum}>
    </td>
    <td class="price text-break text-center">
        <input record-old-price="${oldPrice}"  type="text" aria-label="name" class="form-control" id="put-price" placeholder="No." value=${oldTMCNum}>
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
    const oldName = recordElement.find('#put-name').attr('record-old-name');
    const oldPrice = recordElement.find('#put-price').attr('record-old-price');
    const element =
        `
            <th scope="row">${recordId}</th>
            <td class="name">${oldName}</td>
            <td class="price">${oldPrice}</td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnEdit" type="button">
                    <img src="https://svgshare.com/i/JLZ.svg">
                </button
            </td>
            <td class="text-center">
                <button record-id="${recordId}" class="btn btnDelete" type="button">
                    <img src="https://svgshare.com/i/JLi.svg">
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
    const recordId = {
        'id': $(this).attr('record-id')
    };
    $.delete('./record', recordId, function(data, status) {
        alert(data, status);
        location.reload();
    })
});
