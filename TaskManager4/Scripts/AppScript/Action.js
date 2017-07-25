$(document).ready(function () {
    
    if (sessionStorage.getItem("accessToken") != null) {
        $.ajax(
            {
                method: 'GET',
                contentType: 'application/json',
                url: '/api/values/',
                headers: {
                    'Authorization': 'Bearer '
                    + sessionStorage.getItem("accessToken")
                },
                success: function (data) {
                    sessionStorage.setItem("count", data);
                    $(".list_task").html("");
                },
                error: function (errorMessage) {
                    alertify.error(errorMessage.responseText);
                }
            });
    }
    else {
        $("#pagin").hide();
    }
    // Save the new user details
    $('#btnRegister').click(function () {
        //alert("23");
        $.ajax({
            url: '/api/account/register',
            method: 'POST',
            data: {
                email: $('#txtEmail').val(),
                password: $('#txtPassword').val(),
                confirmPassword: $('#txtConfirmPassword').val()
            },
            success: function () {
                sessionStorage.removeItem('accessToken');
                alertify.success('Success registration');
                $(function () {
                    $('#registrationModal').modal('toggle');
                });
                $('#buttonLogin').click();
                $(".list_task").html("");
            },
            error: function (errorMessage) {
                alertify.error(errorMessage.responseText);
            }
        });
    });

    //remove task
    $("body").on('click', 'a.btnDelete', function () {
        var id = $(this).attr('data_id');

        $.ajax({
            url: '/api/values/' + id,
            method: 'Delete',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer '
                + sessionStorage.getItem("accessToken")
            },
            success: function () {
                $("#task" + id).remove();
                alertify.success('Task Deleted');
            },
            error: function (errorMessage) {
                alertify.error(errorMessage.responseText);
            }
        });
    });

    // add task.
    $("#addTask").click(function () {
        $('#titleName').val("");
        $('#description').val("");
        $("#saveButton").attr("action", "add"); 
    });

    // edit task.
    $("body").on('click', 'a.editTask', function () {
        var id = $(this).attr('data_id');
        $("#saveButton").attr("idUser", id);
        var title = $("#title" + id).text();
        var description = $("#description" + id).text();
        $('#titleName').val(title);
        $('#description').val(description );
        $("#saveButton").attr("action", "edit");
    });




    //save changes
    $("#saveButton").click(function () {
        var task = {
            Title: $('#titleName').val(),
            Context: $('#description').val()
        };

        //add save
        if ($("#saveButton").attr("action") == "add")
        { 
            $.ajax({
                url: '/api/values/',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer '
                    + sessionStorage.getItem("accessToken")
                },
                data: JSON.stringify(task),
                success: function (response) {
                    var itemTask = newTaskTemplate(response, task.Title, task.Context);
                    $(".list_task").prepend(itemTask);
                    $("#editModal").modal("hide");
                    //$(".list_task .itemTask:last-child").remove();
                    alertify.success("Task Added");
                },
                error: function (errorMessage) {
                    alertify.error(errorMessage.responseText);
                }
            });
        }
        // edit save
        if ($("#saveButton").attr("action") == "edit") {
            var id = $("#saveButton").attr("idUser");
                $.ajax({
                    url: '/api/values/' + id,
                    method: 'PUT',
                    contentType: 'application/json',
                    headers: {
                        'Authorization': 'Bearer '
                        + sessionStorage.getItem("accessToken")
                    },
                    data: JSON.stringify(task),
                    success: function () {
                        $("#title" + id).text(task.Title);
                        $("#description" + id).text(task.Context);
                        var d = new Date();
                        $("#date" + id).text(GetFormatDate(d.getTime()));
                        $("#editModal").modal("hide");
                        alertify.success('Edit Successful');
                    },
                    error: function (errorMessage) {
                        alertify.error(errorMessage.responseText);
                    }
                });
        }
     
    });

    //get all tasks
    $("#getAllTasks").click(function () {
        location.reload();
    });

    //login
    $('#btnLogin').click(function () {
        $.ajax({
            // Post username, password & the grant type to /token
            url: '/token',
            method: 'POST',
            contentType: 'application/json',
            data: {
                username: $('#txtUsername').val(),
                password: $('#txtPasswordLogin').val(),
                grant_type: 'password'
            },
            success: function (response) {
                sessionStorage.setItem("accessToken", response.access_token);
                sessionStorage.setItem("UserName", response.userName);
                alertify.success("You registered");
                if (sessionStorage.getItem("accessToken") != null) {
                    SetState(); 
                }
                location.reload();
                $("#loginModal").modal("hide");
            },
            error: function (errorMessage) {
                alertify.error(errorMessage.responseText);
            }
        });
    });

    //Search
    $("#searchFild").keyup(function (event) {
        if (event.keyCode == 13) {
            var fieldSearch = $("#searchFild").val();
            var optionTaskSearch = $("#searchByTask").prop("checked");
            var optionDescriptionSearch = $("#searchByDescription").prop("checked");

            if (optionTaskSearch || optionDescriptionSearch) {
                $.ajax(
                    {
                        type: 'GET',
                        dataType: 'json',
                        contentType: 'application/json;charset=utf-8',
                        url: '/api/values/' + optionTaskSearch + '/' + optionDescriptionSearch + '/' + fieldSearch,
                        headers: {
                            'Authorization': 'Bearer '
                            + sessionStorage.getItem("accessToken")
                        },
                        success: function (data) {
                            var jsonData = JSON.parse(data);
                            $(".list_task").html("");
                            jsonData.forEach(function (item, i, arr) {
                                var objStr = String(item.LastModification);
                                var formatDate = objStr.substr(6, objStr.length - 8);
                                var itemTask = newTaskTemplateWithDate(item.IdTask, item.Title, item.Context, GetFormatDate(+formatDate));
                                $("#pagin").hide();
                                $(".list_task").prepend(itemTask);
                            });
                        },
                        error: function (errorMessage) {
                            alertify.error(errorMessage.responseText);
                        }
                    });
            }
            else {
                alertify.error("Choose search options");
            }
        }
    });

    // pagination
    $('#pagin').twbsPagination({
        totalPages: (typeof Math.ceil(sessionStorage.getItem("count") / 10) == "undefined" || Math.ceil(sessionStorage.getItem("count") / 10) == 0) ? 1 : Math.ceil(sessionStorage.getItem("count")),
        visiblePages: 6,
        next: 'Next',
        prev: 'Prev',
        onPageClick: function (event, page) {
            var data = sessionStorage.getItem("count");
            var lenghtPage = 10;
            if (sessionStorage.getItem("accessToken") != null) {
                $.ajax(
                    {
                        type: 'GET',
                        dataType: 'json',
                        contentType: 'application/json;charset=utf-8',
                        url: '/api/values/' + page + "/" + lenghtPage,
                        headers: {
                            'Authorization': 'Bearer '
                            + sessionStorage.getItem("accessToken")
                        },
                        success: function (data) {
                            var jsonData = JSON.parse(data);
                            $(".list_task").html("");
                            jsonData.forEach(function (item, i, arr) {
                                var objStr = String(item.LastModification);
                                var formatDate = objStr.substr(6, objStr.length - 8);
                                var itemTask = newTaskTemplateWithDate(item.IdTask, item.Title, item.Context, GetFormatDate(+formatDate));
                                $(".list_task").prepend(itemTask);
                            });
                        },
                        error: function (errorMessage) {
                            alertify.error(errorMessage.responseText);
                        }
                    });
            }
        }
    });

});


function newTaskTemplate(id, title, description) {
    var d = new Date();
    var dateNow = GetFormatDate(d.getTime());
    var template = `<div id="task${id}" class="itemTask">
                    <div class="title_task">
                        <span><b id="title${id}">${title}</b></span>
                        <div style="float: right; ">
                            <a class="btnDelete" data_id="${id}" style="text-decoration: none;">
                                <span class="glyphicon glyphicon-trash" title="Delete" style="font-size: 26px; margin-right: 8px;"></span>
                            </a> 
                            <a class="editTask" data_id="${id}" data-toggle="modal" data-target="#editModal" style="text-decoration: none;">
                                <span class="glyphicon glyphicon-edit" title="Edit" data-target="#editModal" style="font-size: 26px;"></span>
                            </a>
                        </div>
                    </div>
                    <div class="top_line"></div>
                    <div id="description${id}" class="description_task">${description}</div>
                    <div class="date_modification">
                        <span id="date${id}">${dateNow}</span>
                    </div>
                </div>`;
    return template;
};

function newTaskTemplateWithDate(id, title, description, date) {
    var template = `<div id="task${id}" class="itemTask">
                    <div class="title_task">
                        <span><b id="title${id}">${title}</b></span>
                        <div style="float: right; ">
                            <a class="btnDelete" data_id="${id}" style="text-decoration: none;">
                                <span class="glyphicon glyphicon-trash" title="Delete" style="font-size: 26px; margin-right: 8px;"></span>
                            </a> 
                            <a class="editTask" data_id="${id}" data-toggle="modal" data-target="#editModal" style="text-decoration: none;">
                                <span class="glyphicon glyphicon-edit" title="Edit" data-target="#editModal" style="font-size: 26px;"></span>
                            </a>
                        </div>
                    </div>
                    <div class="top_line"></div>
                    <div id="description${id}" class="description_task">${description}</div>
                    <div class="date_modification">
                        <span id="date${id}">${date}</span>
                    </div>
                </div>`;
    return template;
};

function GetNowDate() {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "-"
        + (currentdate.getMonth() + 1) + "-"
        + currentdate.getFullYear() + " "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes();

    return datetime;
}

function GetFormatDate(miliseconds) {
    var date = new Date(miliseconds);
    var yy = date.getFullYear();
    var mm = date.getMonth() + 1;
    mm = (date.getMonth() + 1) < 10 ? '0' + mm : mm;
    var dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var mint = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var datetime = dd + "-" + mm + "-" + yy + " " + hh + ":" + mint;

    return datetime;
}

function SetState() {
    $.ajax(
        {
            method: 'GET',
            contentType: 'application/json;charset=utf-8',
            url: '/api/values/',
            headers: {
                'Authorization': 'Bearer '
                + sessionStorage.getItem("accessToken")
            },
            success: function (data) {
                sessionStorage.setItem("count", data);
                $(".list_task").html("");
            },
            error: function (errorMessage) {
                alertify.error(errorMessage.responseText);
            }
        });
};

