
document.addEventListener('DOMContentLoaded', () => {
    const theaterSelect = document.getElementById('theaterSelect'); // Dropdown teatterin valintaan
    const movieList = document.getElementById('movieList');         // Elokuvakorttien säiliö
    const timeInput = document.getElementById('timeInput');         // Aikahakukenttä 
  
    // Haetaan kaikki Finnkinon teatterit XML-rajapinnasta
    
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
      .then(response => response.text()) // Vastaus XML-muodossa tekstinä
      .then(xmlString => {
        const xml = new DOMParser().parseFromString(xmlString, "text/xml"); // Muunnetaan XML JavaScriptin käsiteltäväksi
        const areas = xml.querySelectorAll("TheatreArea"); // Haetaan kaikki <TheatreArea>-elementit
  
        // Lisätään jokainen teatteri valikkoon
        areas.forEach(area => {
          const id = area.querySelector("ID").textContent;
          const name = area.querySelector("Name").textContent;
  
          const option = document.createElement("option");
          option.value = id;
          option.textContent = name;
          theaterSelect.appendChild(option);
        });
      });
  
    // käyttäjä valitsee teatterin, haetaan sen elokuvat tälle päivälle
    
    theaterSelect.addEventListener('change', () => {
      const areaId = theaterSelect.value; // Valitun teatterin ID
      const today = new Date().toISOString().split('T')[0]; // Tämän päivän pvm 
      const url = `https://www.finnkino.fi/xml/Schedule/?area=${areaId}&dt=${today}`; // Rakennetaan API-kutsu
  
      fetch(url)
        .then(response => response.text()) // XML vastauksena
        .then(xmlString => {
          const xml = new DOMParser().parseFromString(xmlString, "text/xml"); // Parsitaan XML
          const shows = xml.querySelectorAll("Show"); // Kaikki näytökset
  
          movieList.innerHTML = ''; // Tyhjennetään vanhat tulokset
  
          const searchTime = timeInput.value; // Käyttäjän syöttämä aika esim. "18:00"
  
          // Käydään läpi jokainen näytös
            
          shows.forEach(show => {
            const title = show.querySelector("Title").textContent; // Elokuvan nimi
            const img = show.querySelector("EventLargeImagePortrait").textContent; // Kuvan URL
            const timeRaw = new Date(show.querySelector("dttmShowStart").textContent); // Näytöksen aloitusaika
            const showTimeStr = timeRaw.toTimeString().slice(0, 5); // Otetaan vain "HH:MM"
            const theatre = show.querySelector("Theatre").textContent; // Teatterin nimi
  
            // Jos aika ei ole annettu, näytetään kaikki — tai näytetään vain täsmäävät ajat
              
            if (!searchTime || searchTime === showTimeStr) {
              // Luodaan kortti tälle elokuvalle
              const movieDiv = document.createElement("div");
              movieDiv.classList.add("movie");
  
              // Kortin sisältö HTML:llä
                
              movieDiv.innerHTML = `
                <h3>${title}</h3>
                <img src="${img}" alt="${title}" />
                <p>${theatre}</p>
                <p>Näytösaika: ${showTimeStr}</p>
              `;
  
              // Lisätään kortti sivulle
                
              movieList.appendChild(movieDiv);
            }
          });
        });
    });
  
    //  3. Kun käyttäjä syöttää kellonajan, päivitetään elokuvat automaattisesti
    
    timeInput.addEventListener('input', () => {
      theaterSelect.dispatchEvent(new Event('change')); // Triggeröidään teatterin valinnan tapahtuma uudelleen
    });
  });
  
