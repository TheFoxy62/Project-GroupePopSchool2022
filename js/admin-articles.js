// Configuration variables
var BASEURL = "https://127.0.0.1:8000";
var APIURL = BASEURL + "/api";
var articlesAPIURL = APIURL + "/articles";
var categoriesAPIURL = APIURL + "/categories";
var tagsAPIURL = APIURL + "/tags";
var writersAPIURL = APIURL + "/writers";

// future DOM interactions
var articlesDatas = document.querySelector('#articlesDatas');
var articleNewTitleInput = document.querySelector('#newTitle');
var articleNewBodyTextarea = document.querySelector('#newBody');
var articleTitleInput = document.querySelector('#title');
var articleBodyTextarea = document.querySelector('#body');
var artCat = document.querySelector('#categoryArticle');
var articleCategory = document.querySelector('#category');
var articleTags = document.querySelector('#tagsCheckboxList');
var articleWriters = document.querySelector('#writersRadioList');
var articlePublishedAt = document.querySelector('#publishedAt');
var articleDivCheckbox = document.querySelector('#divCheckbox');
var infoZoneDiv = document.querySelector('#info');
var createButton = document.querySelector('#create');
var updateButton = document.querySelector('#update');

// 'GET'
var fetchCategories = function() {
    // then we fetch categories data and fill the select
    fetch(categoriesAPIURL, { method: "GET" })
        .then(function(response) { return response.json() })
        .then((responseJSON) => {
            responseJSON["hydra:member"].forEach(category => {
                let categoryOption = document.createElement("option");
                categoryOption.innerHTML = category["name"];
                categoryOption.value = category["id"];
                categoryOption.id = "option-" + category["id"];
                articleCategory.appendChild(categoryOption);
            });
        })
}

// 'GET'
var fetchTags = function() {
    // then we fetch tags data
    fetch(tagsAPIURL, { method: "GET" })
        .then(function(response) { return response.json() })
        .then((responseJSON) => {
            responseJSON["hydra:member"].forEach(tag => {
                let tagLabel = document.createElement("label");
                tagLabel.innerHTML = tag["name"];
                tagLabel.for = tag["id"];
                let tagCheckbox = document.createElement("input");
                tagCheckbox.type = "checkbox";
                tagCheckbox.id = "checkboxT-" + tag["id"];
                tagCheckbox.name = tag["id"];
                tagCheckbox.setAttribute("class", "tags");
                articleTags.append(tagLabel, tagCheckbox);
            });
        })
}

// 'GET'
var fetchWriters = function() {
    // then we fetch writers data
    fetch(writersAPIURL, { method: "GET" })
        .then(function(response) { return response.json() })
        .then((responseJSON) => {
            responseJSON["hydra:member"].forEach(writer => {
                let writerLabel = document.createElement("label");
                writerLabel.innerHTML = "Auteur " + writer["id"];
                writerLabel.for = writer["id"];
                let writerRadio = document.createElement("input");
                writerRadio.type = "radio";
                writerRadio.id = "radioW-" + writer["id"];
                writerRadio.name = writer["id"];
                writerRadio.setAttribute("class", "writers");
                articleWriters.append(writerLabel, writerRadio);
            });
        })
}

var optionsArticle = function() {
    // first we empty the select
    while (articleCategory.firstChild) {
        articleCategory.removeChild(articleCategory.firstChild);
    }
    // GET
    fetchCategories();

    // GET
    fetchTags();

    // GET
    fetchWriters();
}

// 'POST'
// function to create a new article
var createArticle = function() {
    var publishedNow = document.querySelector('#publishedNow');
    var dateNow = undefined;

    if (publishedNow) {
        if (publishedNow.checked) {
            dateNow = getDateTimeNow();
        }
    }

    // if no name is provided, we do nothing
    if (articleNewTitleInput.value == "" || articleNewBodyTextarea.value == "") {
        return;
    }
    // we prepare the parameters
    var requestParameters = {
            "title": articleNewTitleInput.value,
            "body": articleNewBodyTextarea.value,
            "category": "/api/categories/" + articleCategory.value,
            "tags": getTags(),
            "writer": getWriters(),
            "publishedAt": dateNow
        }
        // we do the request
    fetch(articlesAPIURL, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestParameters)
        })
        .then((response) => {
            if (response.status == 201) {
                window.setTimeout(function() { window.location.href = "./articles.html" }, 1000);
                infoZoneDiv.innerHTML = `<span style="font-size: 3rem; position: absolute; top: 40%; left: 25%; background-color: white; color: red; padding: 20px; border-radius: 10px;">Création d'article réussi</span>`;
            } else {
                infoZoneDiv.textContent = "⚠ Une erreur est survenue lors de la création de l'article'";
            }
        })
}

// 'GET'
// function to get all articles
var listArticles = function() {
    // first we empty the table
    if (articlesDatas) {
        while (articlesDatas.firstChild) {
            articlesDatas.removeChild(articlesDatas.firstChild);
        }
        // then we fetch data and fill the table
        fetch(articlesAPIURL, { method: "GET" })
            .then(function(response) { return response.json() })
            .then((responseJSON) => {
                if (responseJSON["hydra:member"]) {
                    responseJSON["hydra:member"].forEach(article => {
                        let articleTr = document.createElement("tr");
                        let articleTdId = document.createElement("td");
                        articleTdId.innerHTML = article.id;
                        let articleTdTitle = document.createElement("td");
                        articleTdTitle.innerHTML = article.title;
                        let articleTdPublishedAt = document.createElement("td");
                        // allow articles publishedAt without date for display the information "Non publié"
                        if (article.publishedAt != undefined) {
                            articleTdPublishedAt.innerHTML = formatDate(article.publishedAt);
                        } else {
                            articleTdPublishedAt.innerHTML = "Non publié";
                        }
                        let articleTdActions = document.createElement("td");
                        let linkEdit = document.createElement("a");
                        linkEdit.href = "./edit-article.html?edit=" + article.id;
                        linkEdit.setAttribute("class", "show");
                        linkEdit.innerHTML = "Voir/Modifier";
                        let linkDelete = document.createElement("a");
                        linkDelete.href = "./articles.html?delete=" + article.id;
                        linkDelete.setAttribute("class", "delete");
                        linkDelete.innerHTML = 'Supprimer';
                        linkDelete.addEventListener("click", deleteArticle);
                        articlesDatas.appendChild(articleTr);
                        articleTr.append(articleTdId, articleTdTitle, articleTdPublishedAt, articleTdActions);
                        articleTdActions.append(linkEdit, linkDelete);
                    })
                } else {
                    let articleTr = document.createElement("tr");
                    let articleTd = document.createElement("td");
                    articleTd.id = "noResult";
                    articleTd.colSpan = 4;
                    articleTd.innerHTML = "Aucun résultat";
                    articlesDatas.appendChild(articleTr);
                    articleTr.appendChild(articleTd);
                }
            })
    }
}

// function to format date from db for friendly sting
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = '' + d.getHours(),
        minutes = '' + d.getMinutes(),
        seconds = '' + d.getSeconds();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (hours.length < 2)
        hours = '0' + hours;
    if (minutes.length < 2)
        minutes = '0' + minutes;
    if (seconds.length < 2)
        seconds = '0' + seconds;

    return [day, month, year].join('/') + ' ' + [hours, minutes, seconds].join(':');
}

// 'GET' only one article informations
var showEditArticle = function() {
    var url = new URL(window.location.href);
    var id = url.searchParams.get("edit");

    optionsArticle();

    // then we fetch articles data
    fetch(articlesAPIURL + "/" + id, { method: "GET" })
        .then(function(response) { return response.json() })
        .then((responseJSON) => {
            articleTitleInput.value = responseJSON.title;
            articleBodyTextarea.value = responseJSON.body;
            // If not published
            if (responseJSON.publishedAt == undefined) {
                articlePublishedAt.innerHTML = "Pas encore publié";
                let articleCheckboxLabel = document.createElement('label');
                articleCheckboxLabel.for = "publishedNow";
                articleCheckboxLabel.innerHTML = "Publié maintenant";
                let articleCheckbox = document.createElement('input');
                articleCheckbox.id = "publishedNow";
                articleCheckbox.name = "publishedNow";
                articleCheckbox.type = "checkbox";
                articleDivCheckbox.append(articleCheckboxLabel, articleCheckbox);
            } else {
                articlePublishedAt.innerHTML = formatDate(responseJSON.publishedAt);
            }
            // fetch category data from article
            fetch(BASEURL + responseJSON.category, { method: "GET" })
                .then(function(categorie) { return categorie.json() })
                .then((categorieJSON) => {
                    let optionSelected = document.getElementById("option-" + categorieJSON.id);
                    optionSelected.setAttribute("selected", "true");
                })
                // fetch tags data from article
            responseJSON.tags.forEach(tag => {
                fetch(BASEURL + tag, { method: "GET" })
                    .then(function(tag) { return tag.json() })
                    .then((tagJSON) => {
                        let checkboxChecked = document.getElementById("checkboxT-" + tagJSON.id);
                        checkboxChecked.setAttribute("checked", "true");
                    })
            })

            // If author
            if (responseJSON.writer != undefined) {
                // fetch writer data from article
                fetch(BASEURL + responseJSON.writer, { method: "GET" })
                    .then(function(writer) { return writer.json() })
                    .then((writerJSON) => {
                        let optionSelected = document.getElementById("radioW-" + writerJSON.id);
                        optionSelected.setAttribute("checked", "true");
                    })
            }
        })
}

// Get tags checked
function getTags() {
    var tags = document.querySelectorAll('.tags');
    var tagsTab = [];
    for (var i = 0; i < tags.length; i++) {
        if (tags[i].checked) {
            let tag = "/api/tags/" + tags[i]["name"];
            tagsTab.push(tag);
        }
    }
    return tagsTab;
}

// Get writer checked
function getWriters() {
    var writers = document.querySelectorAll('.writers');
    var writerChecked = "";
    for (var i = 0; i < writers.length; i++) {
        if (writers[i].checked) {
            writerChecked = "/api/writers/" + writers[i]["name"];
        }
    }
    return writerChecked;
}

// Get Date now
function getDateTimeNow() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = '' + d.getHours(),
        minutes = '' + d.getMinutes(),
        seconds = '' + d.getSeconds();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (hours.length < 2)
        hours = '0' + hours;
    if (minutes.length < 2)
        minutes = '0' + minutes;
    if (seconds.length < 2)
        seconds = '0' + seconds;

    return year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds;
}

// 'PUT'
var updateArticle = function() {
    var url = new URL(window.location.href);
    var id = url.searchParams.get("edit");
    var publishedNow = document.querySelector('#publishedNow');
    var dateNow = undefined;

    if (publishedNow) {
        if (publishedNow.checked) {
            dateNow = getDateTimeNow();
        }
    }

    // if no name is provided, we do nothing
    if (articleTitleInput.value == "" || articleBodyTextarea.value == "") {
        return;
    }
    console.log(articleBodyTextarea.value);
    // we prepare the parameters
    var requestParameters = {
        "title": articleTitleInput.value,
        "body": articleBodyTextarea.value,
        "category": "/api/categories/" + articleCategory.value,
        "tags": getTags(),
        "writer": getWriters(),
        "publishedAt": dateNow
    }

    fetch(articlesAPIURL + "/" + id, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestParameters)
        })
        .then((response) => {
            if (response.status == 200) {
                window.setTimeout(function() { window.location.href = "./articles.html" }, 1000);
                infoZoneDiv.innerHTML = `<span style="font-size: 3rem; position: absolute; top: 40%; left: 25%; background-color: white; color: red; padding: 20px; border-radius: 10px;">Modification de l'article effectuée</span>`;
            } else {
                infoZoneDiv.textContent = "⚠ Une erreur est survenue lors de la modification de l'article'";
            }
        })
}

// 'DELETE'
var deleteArticle = function(e) {
    // retrieve the url from target element
    var url = new URL(e.target.href);
    // retrieve the parameter "delete" into url
    var id = url.searchParams.get("delete");
    e.preventDefault()

    fetch(articlesAPIURL + "/" + id, { method: "DELETE" })
        .then((response) => {
            if (response.status == 204) {
                listArticles()
                window.setTimeout(function() { infoZoneDiv.innerHTML = `<span style="font-size: 3rem; position: absolute; top: 40%; left: 35%; background-color: white; color: red; padding: 20px; border-radius: 10px;">Article supprimée</span>`; }, 500)
                window.setTimeout(function() { infoZoneDiv.innerHTML = ""; }, 2000)
            } else {
                infoZoneDiv.innerHTML = "⚠ Une erreur est survenue lors de la suppression de l'article";
            }
        })
}

if (createButton) {
    // Action for create article
    createButton.addEventListener("click", createArticle);
}
if (updateButton) {
    // Action for update article
    updateButton.addEventListener("click", updateArticle);
}

// When document DOM is loaded, we fetch the articles
document.addEventListener("DOMContentLoaded", listArticles);

if (articleCategory && articleTitleInput) {
    // When document DOM is loaded, we fetch the article informations
    document.addEventListener("DOMContentLoaded", showEditArticle);
}

if (articleCategory && articleNewTitleInput) {
    // When document DOM is loaded, we fetch the article options
    document.addEventListener("DOMContentLoaded", optionsArticle);
}