const apiKey = "6e36d909b1e27a85b3c299313b8d76b9"
var searchButtonEl = $('#search-button')
var inputEl = $('#search')
var searchOptionEl = $('#search-option')

var searchTerm;
var searchType;
var searchCityName;

var outputDivEl = $('#output-div')

var mainCardCity = $('#searched-city')
var mainCardDate = $('#main-date')
var mainCardIcon = $('#main-icon')
var mainCardTempSpan = $('#main-temp')
var mainCardWindSpan = $('#main-wind')
var mainCardHumiditySpan = $('#main-humidity')

var cardDateEl = $('.date')
var cardIconEl = $('.card-icon')
var cardTempSpan = $('.card-temp')
var cardWindSPan = $('.card-wind')
var cardHumiditySpan = $('.card-humidity')

var searchHistoryListEl = $('#search-history')
var searchHistoryList = []


//when search button is clicked take search text and make API call
searchButtonEl.on('click', startSearchViaSearch)

function startSearchViaSearch() {
    searchTerm = inputEl.val()
    searchType = searchOptionEl.val()
    getLatAndLong(searchTerm, searchType)
}


function startSearchViaHistory(id) {
    searchTerm = searchHistoryList[id].term
    searchType = searchHistoryList[id].type
    getLatAndLong(searchTerm, searchType)
}
//is geo api to get latitude and longitude for the other search
function getLatAndLong(searchTerm, searchType) {
    var searchLat;
    var searchLon;

    //only search if there is something in the search field
    if (searchTerm) {
        if (searchType == 'city') {
            $.ajax("http://api.openweathermap.org/geo/1.0/direct?q=" + searchTerm + "&limit=1&appid=" + apiKey
            ).then((response) => {

                if (!response[0]) {
                    alert("City not found")
                } else {
                    console.log(response)
                    searchLat = response[0].lat
                    searchLon = response[0].lon
                    searchCityName = response[0].name

                    getWeatherInfo(searchLat, searchLon)
                }
            })
            // different api call if searching by zip code
        } else if (searchType == 'zip') {
            $.ajax("http://api.openweathermap.org/geo/1.0/zip?zip=" + searchTerm + "&appid=" + apiKey
            ).then((response) => {
                console.log(response)
                searchLat = response.lat
                searchLon = response.lon
                searchCityName = response.name

                getWeatherInfo(searchLat, searchLon)
            }).fail(() => {
                alert("City not found.")
            })
        }
    } else {
        alert("You must enter a search term")
    }
}

//using lat and long fromm geo api we get the weather info from that place
function getWeatherInfo(latitude, longitude) {
    console.log("Lat: " + latitude + "\nLon: " + longitude)

    $.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey + "&units=imperial"
    ).done((response) => {
        console.log(response)
        //display results to page if successful
        saveToHistory()
        displayResults(response)
    }).fail(() => {
        alert("error")
    })

}

//using data from weather api, display it on each card
function displayResults(data) {
    //show the main div
    outputDivEl.removeAttr("hidden")
    //display data on top card
    mainCardCity.text(searchCityName)
    var mainUnix = data.list[0].dt
    var mainDate = convertUnixToDate(mainUnix)
    mainCardDate.text(mainDate)
    mainCardIcon.attr("src", "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png")
    mainCardTempSpan.text(data.list[0].main.temp + "°F")
    mainCardWindSpan.text(data.list[0].wind.speed + "MPH")
    mainCardHumiditySpan.text(data.list[0].main.humidity + "%")

    //display data on other cards
    //starting at 7th index and going up by 8 each time makes it so each entry is evenly spaced out by 24 hours
    var listIndex = 7;
    for (var i = 0; i < cardDateEl.length; i++) {
        var cardUnix = data.list[listIndex].dt
        var cardDate = convertUnixToDate(cardUnix)
        $(cardDateEl[i]).text(cardDate)
        $(cardIconEl[i]).attr("src", "http://openweathermap.org/img/wn/" + data.list[listIndex].weather[0].icon + "@2x.png")
        $(cardTempSpan[i]).text(data.list[listIndex].main.temp + "°F")
        $(cardWindSPan[i]).text(data.list[listIndex].wind.speed + "MPH")
        $(cardHumiditySpan[i]).text(data.list[listIndex].main.humidity + "%")


        listIndex += 8;
    }
}

//save search details to history and append them to the list
function saveToHistory() {
    //save necessary data to local storage
    var dataToSave = {
        term: searchTerm,
        type: searchType,
        name: searchCityName
    }
    var shouldSave = true
    //go through and make sure there are no duplicates
    for (var i = 0; i < searchHistoryList.length; i++) {
        if (dataToSave.name == searchHistoryList[i].name) {
            shouldSave = false;
        }
    }
    if (shouldSave) {
        searchHistoryList.push(dataToSave)
        localStorage.setItem("history", JSON.stringify(searchHistoryList))
    }
    displayHistory()
}

//displays the history stored in local storage to the list below
function displayHistory() {
    //clear children from list
    searchHistoryListEl.empty()

    searchHistoryList = JSON.parse(localStorage.getItem("history"))

    for (var i = 0; i < searchHistoryList.length; i++) {
        var savedSearch = $('<a>')
        //create a bootstrap list element
        savedSearch.addClass("list-group-item list-group-item-action list-group-item-light history-item")
        savedSearch.text(searchHistoryList[i].name)
        savedSearch.attr("id", i)

        searchHistoryListEl.append(savedSearch)
    }
    //reset event listeners for the list
    setEventListeners()
}

//function to convert a unix time to a US date
function convertUnixToDate(unix) {
    var date = new Date(unix * 1000)
    date = date.toLocaleDateString("en-US")
    return date
}
//dont display search history if empty
if (localStorage.getItem("history")) {
    displayHistory()
}

function setEventListeners(){
$(".history-item").off()
$(".history-item").on('click', function() {
    var clickedId = parseInt($(this).attr("id"))
    console.log(clickedId)

    startSearchViaHistory(clickedId)
})
}