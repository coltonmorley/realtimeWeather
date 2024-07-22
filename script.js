//Multiple view options?
//Update delete icon to trashcan type svg


//Update font
//Need one last function that updates based on day/night/weather condition





const weatherModule = (function(){
    let cards = [];
    let celsius = false;
    
    async function getForecastJSON(location){
    const url = 'https://api.weatherapi.com/v1/forecast.json?key=c4f3032b176541b5bed173945240301&q='
    try{
      const response = await fetch(url + location);
      const info = await response.json();
      return info;
  } catch (err){
    console.log(err);
  }
  }
  
  
  async function getWeatherJSON(location){
    const url = 'https://api.weatherapi.com/v1/current.json?key=c4f3032b176541b5bed173945240301&q='
    try{
      const response = await fetch(url + location);
      const info = await response.json();
      return info;
  } catch (err){
    console.log(err);
  }
  }
    
    const createCard = function(forecast){
      const city = forecast.location.name;
      const state = forecast.location.region;
      const country = forecast.location.country;
      const temp_c = forecast.current.temp_c;
      const temp_f = forecast.current.temp_f;
      const condition = forecast.current.condition.text;
      const wind_dir = forecast.current.wind_dir;
      const wind_mph = forecast.current.wind_mph;
      const time = forecast.location.localtime;
      const sunrise = forecast.forecast.forecastday[0].astro.sunrise;
      const sunset = forecast.forecast.forecastday[0].astro.sunset;
      const is_day = forecast.current.is_day;
        return {city, state, country, temp_c, temp_f, condition,
                wind_dir, wind_mph, time, sunrise, sunset, is_day};
    }
    
    const addLocation = async function(loc){
      //let weather = await getWeatherJSON(loc);
      let forecast = await getForecastJSON(loc);
      if(forecast.error){
        console.error(forecast.error.code + ":  "+ forecast.error.message);
        errorHandler(forecast.error);
        return;
      }
      //Remove previous error text if any
      document.querySelector('.errorTxt').textContent="";
      let card = createCard(forecast);
      cards.push(card);
    }
    
    const errorHandler = function(error){
      errorTxt = document.querySelector('.errorTxt');
      console.log(error.code);
      if(error.code == 1003){
        errorTxt.textContent="Search cannot be blank";
      }else if(error.code == 1006){
        errorTxt.textContent="No matching location found, please check input.";
      }else{
        errorTxt.textContent="Unknown error, please try again";
      }
  }
    
    const timeFormat = function(dt){
      let options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      let date = new Date(dt);
      return (date.toLocaleString('en-US', options))
    };
    
     const styleCard = function(card, id){
      let cardDiv = document.getElementById(id);
      if(card.is_day){cardDiv.classList.add('day');}
      else{ cardDiv.classList.add('night')}
    }
    
    const init = (async function(){
      await addLocation("auto:ip");  
      populate(cards[0], 0);
      styleCard(cards[0], "card0");
      })();
    
    
   const deleteCard = function(id){
     let index =  id.substring(6);
     cards.splice(index, 1);
     renderCards();
     document.querySelector('.content').lastElementChild.remove();
    }
   
   
    const renderCards = function(){
      cards.forEach(function (card, i){
        if(i == 0  || document.getElementById('card' + i)){
          populate(card, i);
          return;
        } else{
        const cardDiv = document.getElementById("card0").cloneNode(true);
        cardDiv.id = "card" + i;
        document.querySelector(".content").appendChild(cardDiv);
        document.querySelector("#card" + i + " > .top > .geoNotice").remove();
        let but = document.createElement('button');
        but.id = "delete" + i;
        but.classList.add('delete');
        but.textContent = "x";
        but.setAttribute("onclick","weatherModule.deleteCard(this.id);");
        document.querySelector("#card"+i+">.top>.city").before(but);
        populate(card, i);
        styleCard(card, cardDiv.id);
        };
        
        });
      };
    
    const populate= function(card, i){
      const cardId = "#card" + i;
        document.querySelector(cardId + " > .top > .city").textContent = card.city;
        document.querySelector(cardId + " > .top > .state").innerHTML = card.state + "&nbsp;";
        document.querySelector(cardId + " > .top > .country").textContent = card.country;
        document.querySelector(cardId + " .middle > .condition").textContent = card.condition;
        document.querySelector(cardId + " > .middle > .wind").textContent = 'Wind: '+ card.wind_dir + ' ' + Math.round(card.wind_mph) + 'mph';
      
        document.querySelector(cardId + " > .bottom > .time").textContent = "Local Time: " + timeFormat(card.time);
        document.querySelector(cardId + " > .bottom > .sunInfo > .sunrise").textContent = "Sunrise: " + card.sunrise;
        document.querySelector(cardId + " > .bottom > .sunInfo > .sunset").textContent = "Sunset: " + card.sunset;
      
      //Celsius or Fahrenheit Logic
        if(celsius){
          document.querySelector(cardId + " > .middle > .temp").innerHTML = Math.round(card.temp_c) + '&deg;';
          document.querySelector(cardId + " > .middle > .scale").textContent = "Celsius";
        }else{
          document.querySelector(cardId + " > .middle > .temp").innerHTML = Math.round(card.temp_f) + '&deg;';
          document.querySelector(cardId + " > .middle > .scale").textContent = "Fahrenheit";
          }; 
    }
    
    const toggleInputs = function(){
      const inp = document.getElementById('search');
      const but = document.getElementById('addButton');
      if(inp.disabled){
        inp.classList.remove('loading');
        inp.disabled = false;
        but.disabled = false;
    } else{
        inp.classList.add('loading');
        inp.disabled = true;
        but.disabled = true;
    }
    }
    
    const userAdd = async function(){
      const inp = document.getElementById('search');
      const loc = inp.value;
      toggleInputs();
      await addLocation(loc);
      toggleInputs();
      inp.value='';
      renderCards();
    }
    
    const refresh = async function(){
      const button = document.getElementById('refresh');
      button.textContent = "Refreshing...";
      button.disabled = true;
      await Promise.all(cards.map(async (card, i) => {
                                  const loc = card.city + ', '+ card.state;
                                  const forecast = await getForecastJSON(loc);
                                  cards[i] = createCard(forecast);
                                  renderCards();
                                  }))
     button.disabled = false;
     button.textContent = "Refresh Weather";
    }
     
    const toggleScale = function(){
      celsius = !celsius;
      if(celsius){
        document.getElementById("celsius").disabled = true;
        document.getElementById("fahr").disabled = false;
      }else{
        document.getElementById("celsius").disabled = false;
        document.getElementById("fahr").disabled = true;
      }
      //Repopulate with correct scale
      renderCards();
    }
    return {userAdd, refresh, deleteCard, toggleScale};
  })();
  
  
  function enterCheck(event){
    if(event.key == "Enter"){
      weatherModule.userAdd();
    }
  }