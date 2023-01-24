//my weather api key = 6e36d909b1e27a85b3c299313b8d76b9

//on init: pull searches from local storage and populate in history section

const apiKey = "6e36d909b1e27a85b3c299313b8d76b9"
var searchButtonEl = $('#search-button')
var inputEl = $('#search')
var searchOptionEl = $('#search-option')
var searchTerm;
var searchType;

var searchCityName;

var mainCardCity = $('#searched-city')
var mainCardDate = $('#main-date')

var cardDateEl = $('.date')

//when search button is clicked take search text and make API call
searchButtonEl.on('click', getLatAndLong)

//is geo api to get latitude and longitude for the other search
function getLatAndLong() {
    var searchLat;
    var searchLon;
    
    searchTerm = inputEl.val()
    searchType = searchOptionEl.val()

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

function getWeatherInfo(latitude, longitude) {
    console.log("Lat: " + latitude + "\nLon: " + longitude)

    $.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey+"&units=imperial"
    ).done((response)=>{
        console.log(response)
        displayResults(response)
    }).fail(()=>{
        alert("error")
    })
    
}

function displayResults(data){
    mainCardCity.text(searchCityName)
    var mainUnix = data.list[0].dt
    console.log(mainUnix)
    var mainDate = convertUnixToDate(mainUnix)
    console.log(mainDate)
    mainCardDate.text(mainDate)

    console.log(cardDateEl)
    var listIndex = 7;
    for(var i = 0; i < cardDateEl.length; i++){
        var cardUnix = data.list[listIndex].dt
        var cardDate = convertUnixToDate(cardUnix)
        $(cardDateEl[i]).text(cardDate)
        listIndex += 8;
    }
}

//function to convert a unix time to a US date
function convertUnixToDate(unix){
    var date = new Date(unix * 1000)
    date = date.toLocaleDateString("en-US")
    return date
}
//if it's valid and comes back with search results
//save search to the search history section
//save search to local storage

//then use weather api info to populate big card, and the 5 small ones