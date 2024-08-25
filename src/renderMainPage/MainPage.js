import React, { useEffect, useState } from "react";

const MainPage = () => {
  const [data, setData] = useState([]);
  const [actualPrice, setAtualPrice] = useState([]);
  const [priceIwant, setPriceIwant] = useState("");
  const [inputValue, setInputValue] = useState(0); // Pro sledování hodnoty ve vstupu
  const [buying, setbuying] = useState(false); // Pro sledování hodnoty ve vstupu
  const [isClicked, setIsClicked] = useState(false); // Pro sledování hodnoty ve vstupu

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/scrape");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours() + 1;
    const filterByHour = data.filter((entry) => {
      return Number(entry.hour) === currentHour;
    });

    if (filterByHour.length > 0) {
      setAtualPrice(filterByHour[0].price);
    }
  }, [data]);
  useEffect(() => {
    if (buying && priceIwant) {
      const actualPriceNumber = parseFloat(actualPrice.replace(",", "."));
      const pricePerKWh = (actualPriceNumber / 1000) * 25;

console.log(pricePerKWh < parseFloat(priceIwant));
      if (pricePerKWh < parseFloat(priceIwant)) {
    console.log("start");
        startCharging()
      } else {
        console.log("stop");
        stopCharging()
      }
    }
  }, [actualPrice, buying, priceIwant]);
 const startCharging = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/start-charging", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nakupuju: buying    
      }),
    });
    const result = await response.json();
    console.log("Charging started:", result);
  } catch (error) {
    console.error("Error starting charging:", error);
  }
};
  const stopCharging = async () => {
    try {
    const response = await fetch("http://localhost:5000/api/start-charging", {  // Update to your actual endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nakupuju: false  }),
      });
      const result = await response.json();
    } catch (error) {
      console.error("Error stopping charging:", error);
    }
  };
  const buyOnClick = (e) => {
    setbuying(true);
    setPriceIwant(inputValue);
  };
  const dontBuyOnClick = () => {
    setbuying(false);
    setInputValue("0");
    setPriceIwant("0");
  };

  const actualPriceString = String(actualPrice).replace(",", ".");
  const pricePerKWh = (actualPriceString / 1000) * 25;
  if (data.length === 0) {
    return <div class="loader"></div>;
  }

  return (
    <div className="all-content">
      <h1 className="title-el">Cena elektriky</h1>
      <p className="actual-price">Aktuální cena: {actualPrice} Eur/MWh</p>
      <p className="actual-price">Cena za: {pricePerKWh.toFixed(3)} Kč/KWh</p>
      <div class="form-group">
        <label>
          <input
            type="number"
            placeholder="Zadej cenu v kč za KWh"
            onChange={(e) => setInputValue(e.target.value)}
          />
        </label>

        <button className="button-price" onClick={buyOnClick}>
          Chci kupovat!
        </button>
      </div>
      {buying && priceIwant ? (
        <div>
          <h4 className="more-than-acual-price">
            Právě nakupuješ za cenu nizší než je {priceIwant} Kč/KWh
          </h4>
          <button className="stop-buying" onClick={dontBuyOnClick}>
            Nekupovat
          </button>
        </div>
      ) : (
        <div>
          <h4 className="more-than-acual-price">Právě nenakupuješ</h4>
        </div>
      )}
    </div>
  );
};

export default MainPage;
